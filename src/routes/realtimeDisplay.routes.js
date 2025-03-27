import { Router } from "express";
import { productManager } from "../persistence/mongo/managers/product.manager.js";
import { cartManager } from "../persistence/mongo/managers/cart.manager.js";

const router = Router();

// Real-time products and carts
router.get('/products', async (req, res) => {
    try {
        const products = await productManager.getAllProducts({
            sort: 'price',
            sortDirection: -1,
        });

        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error("Error in realtimeproducts:", error);
        res.status(500).send("Error rendering realtime products");
    }
});

router.get('/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts(); // Get all carts from your cartManager
        res.render('realTimeCarts', { carts }); // Pass carts to the template
    } catch (error) {
        console.error("Error in realtimecarts:", error);
        res.status(500).send("Error rendering realtime carts");
    }
});

export default router;
