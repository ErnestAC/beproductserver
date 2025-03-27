import { request, response } from "express"
import { v4 as uuidv4 } from 'uuid';
import { cartManager } from "../persistence/mongo/managers/cart.manager.js";
import { notifyCartChange } from "../server.js";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { Cart } from "../persistence/mongo/models/cart.model.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";


class CartControllers{
    async createCart(req = request, res = response) {
        try {
            const { products } = req.body || {};
            const cid = uuidv4();
            const newCart = new Cart({
                cid,
                products: products || []
            });

            await newCart.save();
            notifyCartChange();

            res.status(201).json({
                status: "success",
                message: products?.length ? "Cart created successfully with products." : "Empty cart created.",
                payload: newCart
            });

        } catch (err) {
            console.error("Error creating custom cart:", err);
            res.status(400).json({ status: "error", message: err.message || "Invalid request body." });
        }

    }
}

export const cartController = new CartControllers();