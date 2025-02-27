// forms.route.js
import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { notifyProductChange } from "../server.js";

const router = Router();

router.get('/add-product', (req, res) => {
    res.render('addProduct');
});

router.post('/add-product', async (req, res) => {
    const product = req.body;
    try {
        const result = await productManager.addProduct(product);
        if (result) {
            notifyProductChange();
            res.redirect('/api/products');
        } else {
            res.status(500).json({ message: "Error adding product" });
        }
    } catch (error) {
        res.status(500).json({ message: `Server error ${error}` });
    }
});

router.get('/delete-product', (req, res) => {
    res.render('deleteProduct');
});

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
        res.status(500).json({ message: `Server error ${error}` });
    }
});

export default router;