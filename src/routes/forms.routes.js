// forms.routes.js

import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { uploader } from "../utils.js";
import { productDao } from "../persistence/mongo/dao/product.dao.js";
import { notifyProductChange } from "../server.js";
import { requireRole } from "../middlewares/role.middleware.js";


const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

//  GET: Render form to add product (Admin only)
router.get('/add-product', jwtAuth, requireRole("admin"), (req, res) => {
    res.render('addProduct');
});

//  POST: Submit product form (Admin only)
router.post('/add-product', jwtAuth, requireRole("admin"), uploader.single("file"), async (req, res) => {
    try {
        const {
            title,
            handle,
            description,
            stock,
            code,
            price,
            category,
            pieces,
            active,
            lighting,
            wheelArrangement,
            motorizable,
            status
        } = req.body;

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
            imageURL: `/img/${req.file.filename}`,
            thumbs: [`/img/${req.file.filename}`],
        };

        const result = await productDao.addProduct(newProduct);

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

//  GET: Render form to delete product (Admin only)
router.get('/delete-product', jwtAuth, requireRole("admin"), (req, res) => {
    res.render('deleteProduct');
});

//  POST: Handle delete (Admin only)
router.post('/delete-product/:pid', jwtAuth, requireRole("admin"), async (req, res) => {
    const { pid } = req.params;
    try {
        const result = await productDao.deleteProduct(pid);
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
