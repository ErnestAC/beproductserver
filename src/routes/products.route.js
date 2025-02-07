import { Router } from "express";
import { productManager } from "../managers/product.managers.js";

const productsFile = "./src/data/products.json";

const route = Router();

// helper funct to remove an object by its id from an array
function removeById(array, idToRemove) {
    return array.filter(item => item.pid !== idToRemove && item.status !== false);
}

// GET all products with limit async
route.get('/', async (req, res) => {
    const { limit } = req.query;

    try {
        let listOfProducts = await productManager.getAllProducts(limit); 
        if (!listOfProducts) { // check for errors, if no response say there is a big issue
            console.log('Products: Error reading product data from storage.')
            return res.status(500).json({ error: 'Error reading product data from storage' });
        }
        const result = listOfProducts;
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

route.get('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    
    try {
        let selectedProduct = await productManager.getProductById(pid); 
        if (selectedProduct === null) { // null means i got nothing back
            return res.status(404).json({ error: `No hits with this ID: ${pid}` });
        }
        const result = selectedProduct;
        res.json({ result });
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

route.post('/', async (req, res) => {
    const product = req.body;
    let result = null;

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || !product.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation 2' });
    }
    try {
        result = await productManager.addProduct(product);
        res.status(201).json(result);
    } catch(error) {
        res.status(500).json({ message: `Server error ${error}` });
        console.log(error);
    }
});

// PUT Update product by pid asyncly
route.put('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    const productUpdate = req.body;
    //verify that not EVERY updatable field is missing
    if (!productUpdate.title && !productUpdate.description && !productUpdate.code && !productUpdate.price && !productUpdate.stock && !productUpdate.category && !productUpdate.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation 111' });
    }
    try {
        const result = await productManager.updateProduct(pid, productUpdate);
        if (result) {
            res.json({ result }); // return the updated product
        } else {
            res.json("Error updating, possible invalid ID.");
        }
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete data by ID
route.delete('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    const killFlag = req.body.killFlag;
    let result = "";

    try {
        result = await productManager.deleteProduct(pid, killFlag);
        if (result) {
            res.status(200).json({ "message": "data deleted" });
        } else {
            res.status(400).json({ "message": "data not deleted" });
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
        return res.status(400).json({ message: 'Missing required fields for this operation add prod' });
    }
    try {
        result = await productManager.addProduct(product);
        res.redirect('/api/products');  // Redirect back to products list
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
        console.log(error);
    }
});

export default route;
