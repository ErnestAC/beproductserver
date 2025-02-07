import express from 'express';
import { engine } from 'express-handlebars';
import ProductsRoute from './routes/products.route.js';
import CartsRoute from './routes/carts.route.js';
import { productManager } from './managers/product.managers.js';  // Import productManager
import { __dirname } from './utils.js';
import path from 'path';

const app = express();

// Set the correct path for views directory under 'src/views'
app.set('views', path.join(__dirname, 'views'));

// Set Handlebars as the view engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Middleware for serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Routes for API
app.use('/api/products/', ProductsRoute);
app.use('/api/carts/', CartsRoute);

// Route for displaying the Add Product form
app.get('/add-product', (req, res) => {
    console.log("Rendering Add Product Form");
    res.render('addProduct');  // Ensure you have addProduct.handlebars in your 'views' folder
});

// Handle the form submission and add the new product
app.post('/add-product', async (req, res) => {
    const product = req.body;
  
    // Validate required fields
    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || product.status === undefined) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }

    try {
        const result = await productManager.addProduct(product);
        if (result) {
            res.redirect('/api/products');  // Redirect back to products list
        } else {
            res.status(500).json({ message: "Failed to save product" });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
        console.log(error);
    }
});

// Start the server
app.listen(8080, () => {
    console.log('Server started on port 8080');
});
