//cart.controllers.js

import { request, response } from "express";
import { notifyCartChange } from "../server.js";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { Cart } from "../persistence/mongo/models/cart.model.js";
import { cartService } from "../services/cart.services.js";
import { errorLog } from "../utils/errorLog.util.js";
import { ticketService } from "../services/ticket.services.js";

class CartControllers {
    async getCartById(req, res) {
        const { cid } = req.params;
        try {
            const cart = await cartService.getCartById(cid);
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
            errorLog(err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }

    async createCart(req = request, res = response) {
        console.log("📥 Received request to create cart");
        try {
            const newCart = await cartService.createCart();
            notifyCartChange();

            res.status(201).json({
                status: "success",
                message: "Cart created successfully.",
                payload: newCart
            });
        } catch (err) {
            console.error("Error creating cart:", err);
            res.status(400).json({ status: "error", message: err.message || "Invalid request body." });
        }
    }

    async deleteCart(req, res) {
        const { cid } = req.params;
        try {
            const deleted = await cartService.clearCart(cid);
            if (deleted) {
                notifyCartChange();
                res.json({ status: "success", message: "Cart contents deleted" });
            } else {
                res.status(404).json({ status: "error", message: "Cart not found" });
            }
        } catch (err) {
            errorLog(err);
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
            const cart = await cartService.updateProductQuantity(cid, pid, quantity);
            notifyCartChange();

            res.json({ status: "success", message: "Product quantity updated", payload: cart });
        } catch (err) {
            console.error("Error updating product quantity:", err);
            res.status(500).json({ status: "error", message: err.message || "Server error" });
        }
    }

    async deleteProductFromCart(req, res) {
        const { cid, pid } = req.params;
        try {
            const cart = await cartService.removeProductFromCart(cid, pid);
            notifyCartChange();
            res.json({ status: "success", message: "Product removed from cart", payload: cart });
        } catch (err) {
            errorLog(err);
            res.status(500).json({ status: "error", message: err.message || "Server error" });
        }
    }

    async addProductToCart(req, res) {
        const { cid, pid } = req.params;
        try {
            const updatedCart = await cartService.addProductToCart(cid, pid);
            notifyCartChange();
            res.json({ status: "success", payload: updatedCart });
        } catch (err) {
            errorLog(err);
            res.status(err.message.includes("Cart with ID") ? 404 : 500).json({
                status: "error",
                message: err.message || "Server error"
            });
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
            errorLog(err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }

    async purchaseCart(req = request, res = response) {
        try {
            const { cid } = req.params;

            const cart = await cartService.getCartById(cid);
            if (!cart) {
                return res.status(404).json({ status: "error", message: `Cart ${cid} was not found.` });
            }

            const { purchased, notPurchased, total } = await cartService.purchaseCart(cid);

            const ticket = await ticketService.createTicket({
                amount: total,
                purchaser: req.user.email,
                purchased,
                notPurchased
            });

            res.status(200).json({ status: "success", ticket });
        } catch (error) {
            errorLog(error, req);
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
}

export const cartController = new CartControllers();
