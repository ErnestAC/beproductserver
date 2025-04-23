// src/routes/realtime.routes.js

import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { productDao } from "../persistence/mongo/dao/product.dao.js";
import { cartDao } from "../persistence/mongo/dao/cart.dao.js";
import { requireAdminOrOwner } from "../middlewares/role.middleware.js";
import { ProductDTO } from "../dto/product.dto.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// Admin only: Real-time products view
router.get("/products", jwtAuth, requireAdminOrOwner(), async (req, res) => {
    try {
        const products = await productDao.getAllProducts({
            sort: "price",
            sortDirection: -1
        });

        const dtoProducts = products.map(p => new ProductDTO(p));

        res.render("realTimeProducts", { products: dtoProducts });
    } catch (error) {
        console.error("Error in realtimeproducts:", error);
        res.status(500).send("Error rendering realtime products");
    }
});

// Admin only: Real-time carts view
router.get("/carts", jwtAuth, requireAdminOrOwner(), async (req, res) => {
    try {
        const rawCarts = await cartDao.getAllCarts();

        const populatedCarts = await Promise.all(
            rawCarts.map(async cart => {
                const fullCart = await cartDao.getCartById(cart.cid);

                fullCart.products = fullCart.products.map(p => {
                    const product = p.pid;
                    return {
                        _id: product._id.toString(),
                        pid: product._id.toString(),
                        title: product.title,
                        imageURL: product.imageURL,
                        code: product.code,
                        description: product.description,
                        pieces: product.pieces,
                        price: product.price,
                        quantity: p.quantity
                    };
                });

                return fullCart;
            })
        );

        res.render("realTimeCarts", { carts: populatedCarts });
    } catch (error) {
        console.error("Error in realtimecarts:", error);
        res.status(500).send("Error rendering realtime carts");
    }
});

export default router;
