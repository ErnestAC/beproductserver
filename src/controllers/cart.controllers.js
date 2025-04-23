// src/controllers/cart.controllers.js

import { request, response } from "express";
import { notifyCartChange } from "../server.js";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { Cart } from "../persistence/mongo/models/cart.model.js";
import { cartService } from "../services/cart.services.js";
import { errorLog } from "../utils/errorLog.util.js";
import { ticketService } from "../services/ticket.services.js";
import { CartDTO } from "../dto/cart.dto.js";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response.util.js"; // <-- USE HERE

class CartControllers {
    async getCartById(req, res) {
        const { cid } = req.params;
        try {
            const cart = await cartService.getCartById(cid);
            if (!cart) {
                return sendErrorResponse(res, "Cart not found", 404);
            }
            const dto = new CartDTO(cart);
            sendSuccessResponse(res, { payload: dto }, req.user);
        } catch (err) {
            errorLog(err);
            sendErrorResponse(res);
        }
    }

    async createCart(req = request, res = response) {
        try {
            const newCart = await cartService.createCart();
            notifyCartChange();
            sendSuccessResponse(res, { message: "Cart created successfully", payload: new CartDTO(newCart) }, req.user);
        } catch (err) {
            errorLog(err);
            sendErrorResponse(res, "Invalid request body", 400);
        }
    }

    async deleteCart(req, res) {
        const { cid } = req.params;
        try {
            const deleted = await cartService.clearCart(cid);
            if (!deleted) {
                return sendErrorResponse(res, "Cart not found", 404);
            }
            notifyCartChange();
            sendSuccessResponse(res, { message: "Cart contents deleted" }, req.user);
        } catch (err) {
            errorLog(err);
            sendErrorResponse(res);
        }
    }

    async updateProductInCart(req, res) {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return sendErrorResponse(res, "Quantity must be a valid positive number", 400);
        }

        try {
            const cart = await cartService.updateProductQuantity(cid, pid, quantity);
            notifyCartChange();
            sendSuccessResponse(res, { message: "Product quantity updated", payload: new CartDTO(cart) }, req.user);
        } catch (err) {
            errorLog(err);
            sendErrorResponse(res);
        }
    }

    async deleteProductFromCart(req, res) {
        const { cid, pid } = req.params;
        try {
            const cart = await cartService.removeProductFromCart(cid, pid);
            notifyCartChange();
            sendSuccessResponse(res, { message: "Product removed from cart", payload: new CartDTO(cart) }, req.user);
        } catch (err) {
            errorLog(err);
            sendErrorResponse(res);
        }
    }

    async addProductToCart(req, res) {
        const { cid, pid } = req.params;
        try {
            const updatedCart = await cartService.addProductToCart(cid, pid);
            notifyCartChange();
            sendSuccessResponse(res, { payload: new CartDTO(updatedCart) }, req.user);
        } catch (err) {
            errorLog(err);
            const statusCode = err.message.includes("Cart with ID") ? 404 : 500;
            sendErrorResponse(res, err.message || "Server error", statusCode);
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

            const dtoCarts = carts.payload.map(cart => new CartDTO(cart));

            sendSuccessResponse(res, {
                payload: dtoCarts,
                totalPages: carts.totalPages,
                prevPage: carts.hasPrevPage ? carts.prevPage : null,
                nextPage: carts.hasNextPage ? carts.nextPage : null,
                page: carts.page,
                hasPrevPage: carts.hasPrevPage,
                hasNextPage: carts.hasNextPage,
                prevLink: carts.hasPrevPage
                    ? `${req.baseUrl}?page=${carts.prevPage}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder === -1 ? "desc" : "asc"}`
                    : null,
                nextLink: carts.hasNextPage
                    ? `${req.baseUrl}?page=${carts.nextPage}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder === -1 ? "desc" : "asc"}`
                    : null
            }, req.user);
        } catch (err) {
            errorLog(err);
            sendErrorResponse(res);
        }
    }

    async purchaseCart(req = request, res = response) {
        try {
            const { cid } = req.params;

            const cart = await cartService.getCartById(cid);

            if (!cart) {
                return sendErrorResponse(res, `Cart ${cid} not found`, 404);
            }

            const { purchased, notPurchased, total } = await cartService.purchaseCart(cid);

            const ticket = await ticketService.createTicket({
                amount: total,
                purchaser: req.user.email,
                purchased,
                notPurchased
            });
            sendSuccessResponse(res, { ticket }, req.user);
            return ticket
        } catch (error) {
            errorLog(error);
            sendErrorResponse(res);
        }
    }
}

export const cartController = new CartControllers();
