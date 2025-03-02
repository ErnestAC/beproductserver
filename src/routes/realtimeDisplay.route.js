import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { cartManager } from "../managers/cart.manager.js";
import paginate from 'express-paginate';

const router = Router();

// Middleware setup
router.use(paginate.middleware(10, 50)); // def limit 10, max limit 50

// Real-time products and carts
router.get('/products', async (req, res) => {
    try {
        const limit = req.query.limit;
        const offset = req.skip;
        const page = req.query.page;

        const products = await productManager.getAllProducts({
            sort: 'price',
            sortDirection: -1,
            limit: limit,
            skip: offset,
        });

        const totalProducts = await productManager.getTotalProductCount();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('realTimeProducts', {
            products,
            currentPage: page,
            totalPages: totalPages,
        });
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