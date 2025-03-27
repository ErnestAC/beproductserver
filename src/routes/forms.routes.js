import { Router } from "express";
import { productManager } from "../persistence/mongo/managers/product.manager.js";
import { notifyProductChange } from "../server.js";

const router = Router();

router.get('/add-product', (req, res) => {
    res.render('addProduct');
});

import { uploader } from "../utils.js";

router.post('/add-product', uploader.single("file"), async (req, res) => {
    try {
        const { title, handle, description, stock, code, price, category, pieces, active, lighting, wheelArrangement, motorizable, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Error: Missing image file." });
        }

        const newProduct = {
            title,
            handle,
            description,
            stock: Number(stock),
            code,
            price: Number(price),
            category,
            pieces: Number(pieces),
            active: active === "true",
            lighting: lighting === "true",
            wheelArrangement,
            motorizable: motorizable === "true",
            status: status === "true",
            imageURL: `/img/${req.file.filename}`, // Save the image URL
            thumbs: [`/img/${req.file.filename}`],
        };
        console.log("Saving product:", newProduct);
        const result = await productManager.addProduct(newProduct);

        if (result) {
            notifyProductChange();
            res.redirect('/api/products');
        } else {
            res.status(500).json({ message: "Error adding product. Check required fields." });
        }

    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
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