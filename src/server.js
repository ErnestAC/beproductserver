import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

import { __dirname } from './utils.js';
import ProductsRoute from './routes/products.route.js';
import CartsRoute from './routes/carts.route.js';
import homeRoute from './routes/home.route.js';
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
app.use('/api/products', ProductsRoute);
app.use('/api/carts', CartsRoute);

app.get('/add-product', (req, res) => {
    res.render('addProduct');  
});

app.post('/add-product', async (req, res) => {
    const product = req.body;
    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || product.status === undefined) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }

    try {
        const result = await productManager.addProduct(product);
        if (result) {
            notifyProductChange();
            res.redirect('/api/products');  
        } else {
            res.status(500).json({ message: "Failed to save product" });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
    }
});

app.get("/delete-product", (req, res) => {
    res.render("deleteProduct");
});

app.post('/delete-product/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const result = await productManager.deleteProduct(pid);
        if (result) {
            notifyProductChange();
            res.redirect('/api/products');  
        } else {
            res.status(500).json({ message: "Failed to delete product" });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
    }
});

app.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAllProducts();
    res.render('realTimeProducts', { products });
});

// New route for real-time carts
app.get('/realtimecarts', async (req, res) => {
    const carts = await cartManager.getAllCarts();
    res.render('realTimeCarts', { carts });
});



const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
