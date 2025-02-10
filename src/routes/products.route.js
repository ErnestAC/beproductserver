import { Router } from "express";
import { productManager } from "../managers/product.managers.js";
import { notifyProductChange } from "../server.js"; // Import notify function

const route = Router();

// Helper function to remove an object by its id from an array
function removeById(array, idToRemove) {
    return array.filter(item => item.pid !== idToRemove && item.status !== false);
}

// GET all products with limit
route.get('/', async (req, res) => {
    const { limit } = req.query;

    try {
        let listOfProducts = await productManager.getAllProducts(limit);
        if (!listOfProducts) {
            console.log('Products: Error reading product data from storage.')
            return res.status(500).json({ error: 'Error reading product data from storage' });
        }
        const result = listOfProducts;
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single product by pid
route.get('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    
    try {
        let selectedProduct = await productManager.getProductById(pid); 
        if (selectedProduct === null) {
            return res.status(404).json({ error: `No hits with this ID: ${pid}` });
        }
        const result = selectedProduct;
        res.json({ result });
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST to add a new product
route.post('/', async (req, res) => {
    const product = req.body;
    let result = null;

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || !product.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }
    try {
        result = await productManager.addProduct(product);
        if (result) {
            // Notify clients of the new product addition
            notifyProductChange();
            res.status(201).json(result);
        } else {
            res.status(500).json({ message: "Error adding product" });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
        console.log(error);
    }
});

// PUT to update product by pid
route.put('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    const productUpdate = req.body;
    
    // Verify that not EVERY updatable field is missing
    if (!productUpdate.title && !productUpdate.description && !productUpdate.code && !productUpdate.price && !productUpdate.stock && !productUpdate.category && !productUpdate.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }
    try {
        const result = await productManager.updateProduct(pid, productUpdate);
        if (result) {
            // Notify clients of the updated product
            notifyProductChange();
            res.json({ result }); // Return the updated product
        } else {
            res.status(400).json({ message: "Error updating, possibly invalid ID" });
        }
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE product by ID (soft or hard delete)
route.delete('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    const killFlag = req.body.killFlag;
    let result = "";

    try {
        result = await productManager.deleteProduct(pid, killFlag);
        if (result) {
            // Notify clients of the deleted product
            notifyProductChange();
            res.status(200).json({ "message": "Product deleted" });
        } else {
            res.status(400).json({ "message": "Product not deleted" });
        }
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Render the Add Product form (for Handlebars)
route.get('/add-product', (req, res) => {
    res.render('addProduct');  // Make sure you have addProduct.handlebars in your views folder
});

// Handle the form submission and add the new product
route.post('/add-product', async (req, res) => {
    const product = req.body;
    let result = null;

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || !product.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }
    try {
        result = await productManager.addProduct(product);
        if (result) {
            // Notify clients of the new product addition
            notifyProductChange();
            res.redirect('/api/products');  // Redirect back to products list
        } else {
            res.status(500).json({ message: "Error adding product" });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
        console.log(error);
    }
});

export default route;
