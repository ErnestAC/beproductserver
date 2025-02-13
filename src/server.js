import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import ProductsRoute from './routes/products.route.js';
import CartsRoute from './routes/carts.route.js';
import { productManager } from './managers/product.managers.js';  
import { __dirname } from './utils.js';
import path from 'path';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server); // WebSocket server

// notify all connected users of product updates
export const notifyProductChange = async () => {
    try {
        const products = await productManager.getAllProducts(); // Fetch all products reusing fucntion from before
        io.emit('updateProducts', products); // Emit updated products to all connected clients, everybody gets the complete list
    } catch (err) {
        console.error('Error notifying product change:', err);
    }
};

// home view route
import homeRoute from './routes/home.route.js';
app.use('/', homeRoute);

// set the correct path for views directory under 'src/views'
app.set('views', path.join(__dirname, 'views'));

// Set Handlebars as the view engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/api/products/', ProductsRoute);
app.use('/api/carts/', CartsRoute);


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
            notifyProductChange();  // Real-time update
            res.redirect('/api/products');  
        } else {
            res.status(500).json({ message: "Failed to save product" });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
    }
});

// Delete Product Page
app.get("/delete-product", (req, res) => {
    res.render("deleteProduct");
});

app.post('/delete-product/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const result = await productManager.deleteProduct(pid);
        if (result) {
            notifyProductChange();  // Real-time update after deletion
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

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("Client connected to WebSocket. Session ID:", socket.id);
    
    // Send the initial product list when a new client connects
    socket.emit('updateProducts', productManager.getAllProducts());
    
    socket.on("requestProducts", async () => {
        const products = await productManager.getAllProducts();
        socket.emit("updateProducts", products);
    });
});

// Start the server
server.listen(8080, () => {
    console.log('Server started on port 8080');
});
