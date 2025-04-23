// src/services/cart.services.js

import { cartDao } from "../persistence/mongo/dao/cart.dao.js";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { Cart } from "../persistence/mongo/models/cart.model.js";

class CartService {
    async getCartById(cid) {
        return await cartDao.getCartById(cid);
    }

    async getCartByIdMongoose(cid) {
        return await Cart.findOne({ cid })
            .populate({
                path: "products.pid",
                model: ProductModel,
                select: "title handle imageURL description price category stock pieces"
            })
            .lean();
    }

    async createCart() {
        return await cartDao.addCart();
    }

    async addProductToCart(cid, pid) {
        return await cartDao.addProductToCart(cid, pid);
    }

    async removeProductFromCart(cid, pid) {
        return await cartDao.deleteProductFromCart(cid, pid);
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

        const productInCart = cart.products.find(item => item.pid === pid);
        if (!productInCart) throw new Error("Product not found in cart");

        productInCart.quantity = parseInt(quantity, 10);
        await cart.save();
        return cart;
    }

    async purchaseCart(cid) {
        const cart = await cartDao.getCartByIdMongoose(cid);
        if (!cart) throw new Error(`Cart with ID ${cid} not found`);

        const purchased = [];
        const notPurchased = [];
        let total = 0;

        const stillInCart = [];

        for (const item of cart.products) {
            const product = await ProductModel.findOne({ pid: item.pid });

            if (!product || product.stock < item.quantity) {
                notPurchased.push({
                    pid: item.pid,
                    quantity: item.quantity,
                    title: product?.title || "Unknown",
                    price: product?.price || 0
                });

                stillInCart.push({ pid: item.pid, quantity: item.quantity });
                continue;
            }

            product.stock -= item.quantity;
            await product.save();

            purchased.push({
                pid: item.pid,
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
