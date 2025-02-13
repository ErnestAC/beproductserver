import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

import { __dirname } from './utils.js';
import ProductsRoute from './routes/products.route.js';
import CartsRoute from './routes/carts.route.js';
import homeRoute from './routes/home.route.js';
import { productManager } from './managers/product.managers.js';
import { connectDB } from './helpers/mongo.helpers.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Set up Handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Notify clients of product updates
export const notifyProductChange = async () => {
    try {
        const products = await productManager.getAllProducts();
        io.emit('updateProducts', products);
    } catch (err) {
        console.error('Error notifying product change:', err);
    }
};

// WebSocket connection
io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id);
    
    try {
        const products = await productManager.getAllProducts();
        socket.emit('updateProducts', products);
    } catch (err) {
        console.error('Error sending product list:', err);
    }

    socket.on("requestProducts", async () => {
        try {
            const products = await productManager.getAllProducts();
            socket.emit("updateProducts", products);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    });
});

// Routes
app.use('/', homeRoute);
app.use('/api/products', ProductsRoute);
app.use('/api/carts', CartsRoute);

// Connect to DB
connectDB();

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
