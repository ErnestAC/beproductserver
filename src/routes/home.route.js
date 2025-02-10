import { Router } from "express";
import { productManager } from "../managers/product.managers.js";

const route = Router();

// Home route to render products list
route.get('/', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
        res.render('home', { products });
    } catch (err) {
        console.error("Error loading products:", err);
        res.status(500).send("Error loading products");
    }
});

export default route;