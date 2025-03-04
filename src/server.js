// server.js
import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

import { __dirname } from './utils.js';
import ProductsRoute from './routes/api.products.route.js';
import CartsRoute from './routes/api.carts.route.js';
import homeRoute from './routes/index.route.js';
import FormsRoute from './routes/forms.route.js';
import { productManager } from './managers/product.manager.js';
import { cartManager } from './managers/cart.manager.js';
import RealtimeViews from './routes/realtimeDisplay.route.js'
import Handlebars from 'handlebars';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Register the eq helper to handle equality comparison in Handlebars
Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});

// Register the ifCond helper for conditional checks (used in productsStatic.handlebars)
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return v1 == v2 ? options.fn(this) : options.inverse(this);
        case '===':
            return v1 === v2 ? options.fn(this) : options.inverse(this);
        case '<':
            return v1 < v2 ? options.fn(this) : options.inverse(this);
        case '<=':
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
        case '>':
            return v1 > v2 ? options.fn(this) : options.inverse(this);
        case '>=':
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

// Notify product change to all clients
export const notifyProductChange = async () => {
    try {
        const products = await productManager.getAllProducts({
            limit: 50,
            sort: 'price',
            sortDirection: -1,
        });
        io.emit('updateProducts', products);
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
        const products = await productManager.getAllProducts({
            limit: 50,
            sort: 'stock',
            sortDirection: -1,
        });
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
            const products = await productManager.getAllProducts({
                limit: 50,
                sort: 'stock',
                sortDirection: -1,
            });
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
app.use('/realtime/', RealtimeViews)

const PORT = 8080;
server.listen(PORT, () => {
    
    console.log(` `) 
    console.log(`Server started on port ${PORT}.`);
    console.log(`http://localhost:${PORT}`);
    console.log(` `) 

});
