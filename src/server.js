import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport/passport.config.js";
import cookieParser from "cookie-parser";
import { jwtViewAuth } from "./middlewares/auth.middleware.js";
import { __dirname } from "./utils/fileHandler.utils.js";
import os from "os";
import methodOverride from "method-override";
import Handlebars from "handlebars";

import ProductsRoute from "./routes/api.products.routes.js";
import CartsRoute from "./routes/api.carts.routes.js";
import TicketsRoute from "./routes/api.tickets.routes.js";
import homeRoute from "./routes/index.routes.js";
import FormsRoute from "./routes/forms.routes.js";
import UsersRoute from "./routes/api.users.routes.js";
import RealtimeViews from "./routes/realtimeDisplay.routes.js";
import authRoutes from "./routes/sessions.routes.js";

import { productDao } from "./persistence/mongo/dao/product.dao.js";
import { cartDao } from "./persistence/mongo/dao/cart.dao.js";
import { ProductModel } from "./persistence/mongo/models/product.model.js";
import { Cart } from "./persistence/mongo/models/cart.model.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(jwtViewAuth);
app.use(methodOverride("_method"));

// Static files
app.use("/static", express.static(path.join(__dirname, "../public")));
app.use("/img", express.static(path.join(__dirname, "../public/img")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));

// View engine setup
app.set("views", path.join(__dirname, "../views"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Session setup
app.use(
    session({
        secret: process.env.JWT_SECRET || "this_is_not_final",
        resave: false,
        saveUninitialized: false,
    })
);

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());

// Handlebars helpers
Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
    switch (operator) {
        case "==": return v1 == v2 ? options.fn(this) : options.inverse(this);
        case "===": return v1 === v2 ? options.fn(this) : options.inverse(this);
        case "<": return v1 < v2 ? options.fn(this) : options.inverse(this);
        case "<=": return v1 <= v2 ? options.fn(this) : options.inverse(this);
        case ">": return v1 > v2 ? options.fn(this) : options.inverse(this);
        case ">=": return v1 >= v2 ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
    }
});
Handlebars.registerHelper("stringify", function (context) {
    return JSON.stringify(context);
});

// Real-time emitters
export const notifyProductChange = async () => {
    try {
        const products = await productDao.getAllProducts({ limit: 50, sort: "price", sortDirection: -1 });
        io.emit("updateProducts", products);
    } catch (err) {
        console.error("Error notifying product change:", err);
    }
};

export const notifyCartChange = async () => {
    try {
        const carts = await Cart.find().populate({
            path: "products.pid",
            model: ProductModel
        }).lean();

        const enrichedCarts = carts.map(cart => ({
            ...cart,
            products: cart.products.map(item => {
                const product = item.pid || {};
                return {
                    _id: product._id?.toString() || null,
                    pid: product._id?.toString() || null,
                    title: product.title || 'Unknown',
                    price: product.price || 0,
                    imageURL: product.imageURL || '',
                    quantity: item.quantity || 1
                };
            })
        }));

        io.emit("updateCarts", enrichedCarts);
    } catch (err) {
        console.error("Error notifying cart change:", err);
    }
};

// Socket.IO
io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id);

    try {
        const products = await productDao.getAllProducts({ limit: 50, sort: "stock", sortDirection: -1 });
        socket.emit("updateProducts", products);
    } catch (err) {
        console.error("Error sending product list:", err);
    }

    try {
        const carts = await Cart.find().populate({
            path: "products.pid",
            model: ProductModel
        }).lean();

        const enrichedCarts = carts.map(cart => ({
            ...cart,
            products: cart.products.map(item => {
                const product = item.pid || {};
                return {
                    _id: product._id?.toString() || null,
                    pid: product._id?.toString() || null,
                    title: product.title || 'Unknown',
                    price: product.price || 0,
                    imageURL: product.imageURL || '',
                    quantity: item.quantity || 1
                };
            })
        }));

        socket.emit("updateCarts", enrichedCarts);
    } catch (err) {
        console.error("Error sending cart list:", err);
    }

    socket.on("requestProducts", async () => {
        try {
            const products = await productDao.getAllProducts({ limit: 50, sort: "stock", sortDirection: -1 });
            socket.emit("updateProducts", products);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    });

    socket.on("requestCarts", async () => {
        try {
            const carts = await Cart.find().populate({
                path: "products.pid",
                model: ProductModel
            }).lean();

            const enrichedCarts = carts.map(cart => ({
                ...cart,
                products: cart.products.map(item => {
                    const product = item.pid || {};
                    return {
                        _id: product._id?.toString() || null,
                        pid: product._id?.toString() || null,
                        title: product.title || 'Unknown',
                        price: product.price || 0,
                        imageURL: product.imageURL || '',
                        quantity: item.quantity || 1
                    };
                })
            }));

            socket.emit("updateCarts", enrichedCarts);
        } catch (err) {
            console.error("Error fetching carts:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Expose logged-in user to views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use("/", homeRoute);
app.use("/forms", FormsRoute);
app.use("/api/products", ProductsRoute);
app.use("/api/carts", CartsRoute);
app.use("/api/tickets", TicketsRoute);
app.use("/api/users", UsersRoute);
app.use("/api/sessions", authRoutes);
app.use("/realtime/", RealtimeViews);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    const networkInterfaces = os.networkInterfaces();
    let localIP = "localhost";

    for (const interfaceKey in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceKey];
        if (!networkInterface) continue;

        for (const net of networkInterface) {
            if (net.family === "IPv4" && !net.internal) {
                localIP = net.address;
                break;
            }
        }
        if (localIP !== "localhost") break;
    }

    console.log(`\nServer started on port ${PORT}.`);
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://${localIP}:${PORT}\n`);
});
