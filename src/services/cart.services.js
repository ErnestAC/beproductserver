// src/services/cart.services.js

import { cartDao } from "../persistence/mongo/dao/cart.dao.js";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { Cart } from "../persistence/mongo/models/cart.model.js";
import { CartDTO } from "../dto/cart.dto.js";
import { Types } from "mongoose";

class CartService {
    async getCartById(cid) {
        const cart = await cartDao.getCartById(cid);
        if (!cart) return null;

        const cartObj = cart.toObject?.() || cart;
        const productIds = cartObj.products.map(p => p.pid);
        const productDocs = await ProductModel.find({ _id: { $in: productIds } }).lean();

        const productMap = new Map(productDocs.map(p => [p._id.toString(), p]));

        const enrichedProducts = cartObj.products.map(item => {
            const pidStr = item?.pid?.toString?.();
            const details = productMap.get(pidStr);
        
            return {
                pid: pidStr || null,
                quantity: item.quantity,
                title: details?.title ?? null,
                imageURL: details?.imageURL ?? null,
                category: details?.category ?? null,
                price: details?.price ?? null,
                stock: details?.stock ?? null,
                pieces: details?.pieces ?? null,
                description: details?.description ?? null,
                code: details?.code ?? null
            };
        });

        return new CartDTO({ cid: cartObj.cid, products: enrichedProducts });
    }

    async getCartByIdMongoose(cid) {
        const cart = await Cart.findOne({ cid }).lean();
        if (!cart) return null;

        const productIds = cart.products.map(p => p.pid);
        const products = await ProductModel.find({ _id: { $in: productIds } }).lean();

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        cart.products = cart.products.map(item => ({
            ...item,
            ...(productMap.get(item.pid.toString()) || {})
        }));

        return cart;
    }

    async createCart() {
        return await cartDao.addCart();
    }

    async addProductToCart(cid, pid) {
        await cartDao.addProductToCart(cid, pid);
        return await this.getCartById(cid);
    }

    async removeProductFromCart(cid, pid) {
        await cartDao.deleteProductFromCart(cid, pid);
        return await this.getCartById(cid);
    }

    async clearCart(cid) {
        return await cartDao.clearCartById(cid);
    }

    async mergeGuestCartIntoUserCart(userCartId, guestProducts) {
        for (const guestItem of guestProducts) {
            for (let i = 0; i < guestItem.quantity; i++) {
                await this.addProductToCart(userCartId, guestItem.pid);
            }
        }
        return await this.getCartById(userCartId);
    }

    async updateProductQuantity(cid, pid, quantity) {
        const cart = await cartDao.getCartByIdMongoose(cid);
        if (!cart) throw new Error("Cart not found");

        const productInCart = cart.products.find(item => item.pid.toString() === pid);
        if (!productInCart) throw new Error("Product not found in cart");

        productInCart.quantity = parseInt(quantity, 10);
        await cart.save();

        return await this.getCartById(cid);
    }

    async purchaseCart(cid) {
        const cart = await cartDao.getCartByIdMongoose(cid);
        if (!cart) throw new Error(`Cart with ID ${cid} not found`);

        const purchased = [];
        const notPurchased = [];
        let total = 0;

        const stillInCart = [];

        for (const item of cart.products) {
            const product = await ProductModel.findById(item.pid);

            if (!product || product.stock < item.quantity) {
                if (!product) {
                    notPurchased.push({
                        pid: item.pid.toString(),
                        quantity: item.quantity,
                        title: "Unknown",
                        price: 0
                    });
                } else {
                    notPurchased.push({
                        pid: product._id.toString(),
                        quantity: item.quantity,
                        title: product.title,
                        price: product.price
                    });
                }
                                stillInCart.push({ pid: item.pid, quantity: item.quantity });
                continue;
            }

            product.stock -= item.quantity;
            await product.save();

            purchased.push({
                pid: product._id.toString(),
                quantity: item.quantity,
                title: product.title,
                price: product.price
            });

            total += product.price * item.quantity;
        }

        cart.products = stillInCart;
        await cart.save();

        return { purchased, notPurchased, total };
    }
}

export const cartService = new CartService();
