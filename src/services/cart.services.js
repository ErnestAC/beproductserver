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

        for (const item of cart.products) {
            const product = await ProductModel.findOne({ pid: item.pid });

            if (!product || product.stock <= 0) {
                notPurchased.push({
                    ...item.toObject(),
                    title: product ? product.title : "Unknown",
                    price: product ? product.price : 0
                });
                continue;
            }

            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await product.save();

                purchased.push({
                    ...item.toObject(),
                    title: product.title,
                    price: product.price
                });
                total += product.price * item.quantity;
            } else {
                purchased.push({
                    ...item.toObject(),
                    quantity: product.stock,
                    title: product.title,
                    price: product.price
                });

                total += product.price * product.stock;

                notPurchased.push({
                    ...item.toObject(),
                    quantity: item.quantity - product.stock,
                    title: product.title,
                    price: product.price
                });

                product.stock = 0;
                await product.save();
            }
        }

        cart.products = notPurchased.map(item => ({
            pid: item.pid,
            quantity: item.quantity
        }));
        await cart.save();

        return { purchased, notPurchased, total };
    }
}

export const cartService = new CartService();
