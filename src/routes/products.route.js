// products.route.js
import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { notifyProductChange } from "../server.js";

const router = Router();

// GET all products with limit
router.get('/', async (req, res) => {
    const { limit } = req.query;
    try {
        const listOfProducts = await productManager.getAllProducts(limit);
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
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT to update product by pid
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const productUpdate = req.body;
    try {
        const result = await productManager.updateProduct(pid, productUpdate);
        if (result) {
            notifyProductChange();
            res.json({ result });
        } else {
            res.status(400).json({ message: "Invalid product ID or update failed" });
        }
    } catch (err) {
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
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;