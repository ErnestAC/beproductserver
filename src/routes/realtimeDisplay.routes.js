import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { productManager } from "../persistence/mongo/managers/product.manager.js";
import { cartManager } from "../persistence/mongo/managers/cart.manager.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// ✅ Protected: Real-time products view
router.get("/products", jwtAuth, async (req, res) => {
    try {
        const products = await productManager.getAllProducts({
            sort: "price",
            sortDirection: -1,
        });

        res.render("realTimeProducts", { products });
    } catch (error) {
        console.error("Error in realtimeproducts:", error);
        res.status(500).send("Error rendering realtime products");
    }
});

// ✅ Protected: Real-time carts view
router.get("/carts", jwtAuth, async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.render("realTimeCarts", { carts });
    } catch (error) {
        console.error("Error in realtimecarts:", error);
        res.status(500).send("Error rendering realtime carts");
    }
});

export default router;
