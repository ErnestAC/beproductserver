import { v4 as uuidv4 } from "uuid";
import { Cart } from "../models/cart.model.js";
import { notifyCartChange } from "../server.js";

export class CartManager {
    // Get all carts
    async getAllCarts() {
        try {
            return await Cart.find();
        } catch (err) {
            console.error("Error retrieving carts:", err);
            throw err;
        }
    }

    // Add a new cart
    async addCart() {
        try {
            const newCart = new Cart({
                cid: uuidv4(),
                products: [],
            });
            await newCart.save();
            notifyCartChange(); // Notify all clients about the new cart
            return newCart;
        } catch (err) {
            console.error("Error adding cart:", err);
            throw err;
        }
    }

    // Add product to a cart
    async addProductToCart(cid, pid) {
        try {
            const cart = await Cart.findOne({ cid });

            if (!cart) {
                throw Error(`Cart with ID ${cid} not found`);
            }

            const productInCart = cart.products.find(
                (product) => product.pid === pid
            );

            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ pid, quantity: 1 });
            }

            await cart.save();
            notifyCartChange(); // Notify all clients about the cart update
            return cart;
        } catch (err) {
            console.error("Error adding product to cart:", err);
            throw err;
        }
    }

    // Get a cart by its ID
    async getCartById(cartId) {
        try {
            return await Cart.findOne({ cid: cartId }) || null;
        } catch (err) {
            console.error("Error retrieving cart by ID:", err);
            throw err;
        }
    }

    // Delete a cart by its ID
    async deleteCartById(cartId) {
        try {
            const deletedCart = await Cart.findOneAndDelete({ cid: cartId });
            if (!deletedCart) {
                console.warn(`Cart with ID ${cartId} not found.`);
                return false;
            }
            notifyCartChange(); // Notify all clients about the cart deletion
            return true;
        } catch (err) {
            console.error("Error deleting cart by ID:", err);
            throw err;
        }
    }
}

export const cartManager = new CartManager();
