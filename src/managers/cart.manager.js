import { v4 as uuidv4 } from "uuid";
import { Cart } from "../models/cart.model.js";
import { notifyCartChange } from "../server.js";
import { productManager } from "../managers/product.manager.js";

export class CartManager {
    // Get all carts
    async getAllCarts() {
        
        try {
            const carts = await Cart.find(); // Find all carts
            for (const cart of carts) {
                for (const product of cart.products) {
                    const productDetails = await productManager.getProductById(product.pid);
                    
                    if (productDetails) {
                        product.title = productDetails.title;
                        product.imageURL = productDetails.imageURL;
                        product.price = productDetails.price;
                    }

                    console.log(product.price)
                }
            }
            return carts;
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
            // Check if the product exists and has stock
            const product = await productManager.getProductById(pid);
            if (!product) {
                throw Error(`Product with ID ${pid} not found`);
            }
            if (product.stock <= 0) {
                throw Error(`Product with ID ${pid} is out of stock`);
            }

            // Check if the cart exists
            const cart = await Cart.findOne({ cid });
            if (!cart) {
                throw Error(`Cart with ID ${cid} not found`);
            }

            // Check if product is already in the cart
            const productInCart = cart.products.find(
                (item) => item.pid === pid
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

    async clearCartById(cartId) {
        try {
            // Find the cart by ID
            const cart = await Cart.findOne({ cid: cartId });
            if (!cart) {
                throw Error(`Cart with ID ${cartId} not found`);
            }
    
            // Clear all products in the cart
            cart.products = [];
    
            // Save the updated cart
            await cart.save();
            notifyCartChange(); // Notify all clients about the cart update
            return cart;
        } catch (err) {
            console.error("Error clearing cart contents:", err);
            throw err;
        }
    }
}

export const cartManager = new CartManager();
