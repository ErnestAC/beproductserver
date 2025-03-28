//cart.controllers.js

import { request, response } from "express"
import { v4 as uuidv4 } from 'uuid';
import { cartDao } from "../persistence/mongo/dao/cart.dao.js";
import { notifyCartChange } from "../server.js";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { Cart } from "../persistence/mongo/models/cart.model.js";



class CartControllers{
    async getCartById(req, res) {
        const { cid } = req.params;
        try {
            const cart = await cartDao.getCartById(cid);
            if (cart) {
                res.json({
                    status: "success",
                    payload: cart,
                    totalPages: 1,
                    prevPage: null,
                    nextPage: null,
                    page: 1,
                    hasPrevPage: false,
                    hasNextPage: false,
                    prevLink: null,
                    nextLink: null
                });
            } else {
                res.status(404).json({ status: "error", message: "Cart not found" });
            }
        } catch (err) {
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }

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
    async deleteCart(req, res) {
        const { cid } = req.params;
        try {
            const deleted = await cartDao.clearCartById(cid);
            if (deleted) {
                notifyCartChange();
                res.json({ status: "success", message: "Cart contents deleted" });
            } else {
                res.status(404).json({ status: "error", message: "Cart not found" });
            }
        } catch (err) {
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }

    async updateProductInCart(req, res) {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ status: "error", message: "Quantity must be a valid positive number" });
        }

        try {
            const cart = await cartDao.getCartByIdMongoose(cid);
            if (!cart) {
                return res.status(404).json({ status: "error", message: "Cart not found" });
            }

            const productInCart = cart.products.find(item => item.pid === pid);
            if (!productInCart) {
                return res.status(404).json({ status: "error", message: "Product not found in cart" });
            }

            productInCart.quantity = parseInt(quantity, 10);
            await cart.save();
            notifyCartChange();

            res.json({ status: "success", message: "Product quantity updated", payload: cart });
        } catch (err) {
            console.error("Error updating product quantity:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
    
    async deleteProductFromCart(req, res) {
        const { cid, pid } = req.params;
        try {
            const cart = await cartDao.getCartByIdMongoose(cid);
            if (!cart) {
                return res.status(404).json({ status: "error", message: "Cart not found" });
            }

            const productIndex = cart.products.findIndex(item => item.pid === pid);
            if (productIndex === -1) {
                return res.status(404).json({ status: "error", message: "Product not found in cart" });
            }

            cart.products.splice(productIndex, 1);
            await cart.save();
            notifyCartChange();
            res.json({ status: "success", message: "Product removed from cart", payload: cart });
        } catch (err) {
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
    async addProductToCart(req, res) {
        const { cid, pid } = req.params;
        try {
            const updatedCart = await cartDao.addProductToCart(cid, pid);
            notifyCartChange();
            res.json({ status: "success", payload: updatedCart });
        } catch (err) {
            if (err.message.includes("Cart with ID")) {
                res.status(404).json({ status: "error", message: err.message });
            } else {
                res.status(500).json({ status: "error", message: "Server error" });
            }
        }
    }
    
    async getAllCarts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || "cid";
            const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    
            const carts = await Cart.find()
                .sort({ [sort]: sortOrder })
                .populate({
                    path: "products.pid",
                    model: ProductModel,
                    select: "title handle imageURL description price category stock pieces"
                })
                .lean()
                .paginate({
                    page,
                    limit,
                    customLabels: { docs: "payload" }
                });
    
            res.json({ status: "success", carts });
    
        } catch (err) {
            console.error("Error retrieving carts with product details:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
}

export const cartController = new CartControllers();