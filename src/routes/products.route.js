import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { notifyProductChange } from "../server.js"; // Import notify function

const router = Router();

// GET all products with limit
router.get('/', async (req, res) => {
    const { limit } = req.query;

    try {
        const listOfProducts = await productManager.getAllProducts(limit);
        if (!listOfProducts) {
            console.error('Error reading product data from storage.');
            return res.status(500).json({ error: 'Error reading product data from storage' });
        }
        res.json({ result: listOfProducts });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single product by pid
router.get('/:pid', async (req, res) => { 
    const { pid } = req.params;
    
    try {
        const selectedProduct = await productManager.getProductById(pid); 
        if (!selectedProduct) {
            return res.status(404).json({ error: `No product found with ID: ${pid}` });
        }
        res.json({ result: selectedProduct });
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Render the Add Product form (for Handlebars)
router.get('/add-product', (req, res) => {
    res.render('addProduct');  
});

// Handle form submission and add a new product
router.post('/add-product', async (req, res) => {
    const product = req.body;

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || product.status === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await productManager.addProduct(product);
        if (result) {
            notifyProductChange();
            res.redirect('/api/products');  
        } else {
            res.status(500).json({ message: "Error adding product" });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: `Server error ${error}` });
    }
});

// PUT to update product by pid
router.put('/:pid', async (req, res) => { 
    const { pid } = req.params;
    const productUpdate = req.body;
    
    if (!Object.keys(productUpdate).length) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    try {
        const result = await productManager.updateProduct(pid, productUpdate);
        if (result) {
            notifyProductChange();
            res.json({ result });
        } else {
            res.status(400).json({ message: "Invalid product ID or update failed" });
        }
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE product by ID (soft or hard delete)
router.delete('/:pid', async (req, res) => { 
    const { pid } = req.params;
    const { killFlag } = req.body;

    try {
        const result = await productManager.deleteProduct(pid, killFlag);
        if (result) {
            notifyProductChange();
            res.status(200).json({ message: "Product deleted" });
        } else {
            res.status(400).json({ message: "Product not found or could not be deleted" });
        }
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Render the Delete Product page (for Handlebars)
router.get('/delete-product', (req, res) => {
    res.render('deleteProduct');
});

// Handle form submission to delete a product
router.post('/delete-product/:pid', async (req, res) => {
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
        console.error('Error deleting product:', error);
        res.status(500).json({ message: `Server error ${error}` });
    }
});

export default router;
