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
            limit: 20,
            sort: 'stock',
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
            limit: 20,
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
                limit: 20,
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

// Static route for viewing all products with sorting and pagination
app.get('/products/static', async (req, res) => {
    // Extract query parameters with default values
    let { limit = 10, page = 1, sort = 'title', sortOrder = 'asc' } = req.query;

    // Ensure limit is a valid number and >= 1
    limit = Math.max(1, Number(limit) || 10); // Default to 10 if invalid

    // Ensure the page is a valid number and >= 1
    const currentPage = Math.max(1, Number(page)); // Ensure page is at least 1
    const skip = (currentPage - 1) * limit;

    try {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Fetch products with pagination and sorting
        const products = await productManager.getAllProducts({
            limit: limit,
            skip: skip,
            sort: sort,
            sortDirection: sortDirection
        });

        // Get total product count for pagination
        const totalProducts = await productManager.getTotalProductCount();
        const totalPages = Math.ceil(totalProducts / limit);

        // Calculate page navigation flags
        const hasPrevPage = currentPage > 1;
        const hasNextPage = currentPage < totalPages;
        const prevPage = hasPrevPage ? currentPage - 1 : null;
        const nextPage = hasNextPage ? currentPage + 1 : null;

        res.render('productsStatic', {
            products,
            currentPage,
            totalPages,
            prevPage,
            nextPage,
            hasPrevPage,
            hasNextPage,
            sort,
            sortOrder
        });
    } catch (err) {
        console.error('Error rendering products page:', err);
        res.status(500).send("Error rendering products");
    }
});



// Real-time products and carts
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getAllProducts({
            limit: 20,
            sort: 'stock',
            sortDirection: -1,
        });
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
    console.log(`http://localhost:${PORT}`);
});
