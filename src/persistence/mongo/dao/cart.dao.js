// cart.dao.js

import { v4 as uuidv4 } from "uuid";
import { Cart } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";
import { notifyCartChange } from "../../../server.js";
import { Types } from "mongoose";

export class CartDao {
    async getAllCarts() {
        return await Cart.find();
    }

    async addCart() {
        const newCart = new Cart({
            cid: uuidv4(),
            products: []
        });
        await newCart.save();
        notifyCartChange();
        return newCart;
    }

    async addProductToCart(cid, pid) {
        let objectId;
        try {
            objectId = new Types.ObjectId(pid);
        } catch (err) {
            throw new Error(`Invalid ObjectId format for pid: ${pid}`);
        }
    
        const product = await ProductModel.findById(objectId);
        if (!product) throw new Error(`Product with id ${pid} not found`);
        if (product.stock <= 0) throw new Error(`Product with id ${pid} is out of stock`);
    
        const cart = await Cart.findOne({ cid });
        if (!cart) throw new Error(`Cart with id ${cid} not found`);
    
        // Remove any bad legacy pid values
        cart.products = cart.products.filter(item => Types.ObjectId.isValid(item.pid?.toString()));
    
        const productInCart = cart.products.find(item => item.pid.toString() === pid);
        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ pid: objectId, quantity: 1 });
        }
    
        await cart.save();
        notifyCartChange();
        return cart;
    }

    async getCartById(cartId) {
        const cart = await Cart.findOne({ cid: cartId }).populate({
            path: "products.pid",
            model: ProductModel
        }).lean();
        return cart ?? null;
    }

    async getCartByIdMongoose(cartId) {
        return await Cart.findOne({ cid: cartId }).populate({
            path: "products.pid",
            model: ProductModel
        });
    }

    async getAllCartsMongoose(page, limit, sort, sortOrder) {
        const sortCriteria = {};
        if (sort && sortOrder) {
            sortCriteria[sort] = sortOrder === "desc" ? -1 : 1;
        }

        return Cart.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sortCriteria)
            .populate("products.pid");
    }

    async deleteCartById(cartId) {
        const deletedCart = await Cart.findOneAndDelete({ cid: cartId });
        if (deletedCart) notifyCartChange();
        return !!deletedCart;
    }

    async clearCartById(cartId) {
        const cart = await Cart.findOne({ cid: cartId });
        if (!cart) throw new Error(`Cart with id ${cartId} not found`);

        cart.products = [];
        await cart.save();
        notifyCartChange();
        return cart;
    }

    async deleteProductFromCart(cid, pid) {
        const cart = await Cart.findOne({ cid });
        if (!cart) throw new Error(`Cart with ID ${cid} not found.`);

        const productIndex = cart.products.findIndex(item => item.pid?.toString() === pid);
        if (productIndex === -1) throw new Error(`Product with ID ${pid} not found in cart.`);

        cart.products.splice(productIndex, 1);
        await cart.save();

        notifyCartChange();
        return cart;
    }

    async purchaseCart(cid) {
        const cart = await Cart.findOne({ cid });
        if (!cart) throw new Error(`Cart with ID ${cid} not found.`);

        const productsPurchased = [];
        const productsNotPurchased = [];

        for (let cartItem of cart.products) {
            const product = await ProductModel.findById(cartItem.pid);

            if (!product) {
                productsNotPurchased.push({
                    pid: cartItem.pid.toString(),
                    reason: "Product not found"
                });
                continue;
            }

            if (product.stock >= cartItem.quantity) {
                product.stock -= cartItem.quantity;
                await product.save();

                productsPurchased.push({
                    pid: product._id.toString(),
                    quantity: cartItem.quantity,
                    price: product.price
                });
            } else {
                productsNotPurchased.push({
                    pid: product._id.toString(),
                    reason: "Insufficient stock"
                });
            }
        }

        cart.products = [];
        for (const item of productsNotPurchased) {
            if (!Types.ObjectId.isValid(item.pid)) {
                console.warn(`Skipping invalid pid in cart re-add: ${item.pid}`);
                continue;
            }
            cart.products.push({
                pid: new Types.ObjectId(item.pid),
                quantity: 1
            });
        }

        await cart.save();
        notifyCartChange();

        return productsPurchased.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    }
}

export const cartDao = new CartDao();
