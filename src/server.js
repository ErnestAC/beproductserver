// server.js
import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

import { __dirname } from './utils.js';
import ProductsRoute from './routes/products.route.js';
import CartsRoute from './routes/carts.route.js';
import homeRoute from './routes/home.route.js';
import FormsRoute from './routes/forms.route.js';
import { productManager } from './managers/product.manager.js';
import { cartManager } from './managers/cart.manager.js';
import { connectDB } from './helpers/mongo.helpers.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Notify product change to all clients
export const notifyProductChange = async () => {
    try {
        const products = await productManager.getAllProducts();
        console.log("Emitting updateProducts event with products:", products);
        io.emit('updateProducts', products);
        console.log("updateProducts event emitted."); // Add this line
    } catch (err) {
        console.error('Error notifying product change:', err);
    }
};

// Notify cart change to all clients
export const notifyCartChange = async () => {
    try {
        const carts = await cartManager.getAllCarts();
        io.emit('updateCarts', carts);
    } catch (err) {
        console.error('Error notifying cart change:', err);
    }
};

// Socket.io connection handling
io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id);

    // Send current products on connection
    try {
        const products = await productManager.getAllProducts();
        socket.emit('updateProducts', products);
    } catch (err) {
        console.error('Error sending product list:', err);
    }

    // Send current carts on connection
    try {
        const carts = await cartManager.getAllCarts();
        socket.emit('updateCarts', carts);
    } catch (err) {
        console.error('Error sending cart list:', err);
    }

    // Handle product requests
    socket.on("requestProducts", async () => {
        try {
            const products = await productManager.getAllProducts();
            socket.emit("updateProducts", products);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    });

    // Handle cart requests
    socket.on("requestCarts", async () => {
        try {
            const carts = await cartManager.getAllCarts();
            socket.emit("updateCarts", carts);
        } catch (err) {
            console.error('Error fetching carts:', err);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Routes
app.use('/', homeRoute);

// Use the formsRouter
app.use('/forms', FormsRoute);

app.use('/api/products', ProductsRoute);
app.use('/api/carts', CartsRoute);

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error("Error in realtimeproducts:", error);
        res.status(500).send("Error rendering realtime products");
    }
});

app.get('/realtimecarts', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.render('realTimeCarts', { carts });
    } catch (error) {
        console.error("Error in realtimecarts:", error);
        res.status(500).send("Error rendering realtime carts");
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});