import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { productDao } from "../persistence/mongo/dao/product.dao.js";
import { cartDao } from "../persistence/mongo/dao/cart.dao.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// ✅ Protected: Real-time products view
router.get("/products", jwtAuth, async (req, res) => {
    try {
        const products = await productDao.getAllProducts({
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
        const carts = await cartDao.getAllCarts();
        res.render("realTimeCarts", { carts });
    } catch (error) {
        console.error("Error in realtimecarts:", error);
        res.status(500).send("Error rendering realtime carts");
    }
});

export default router;
