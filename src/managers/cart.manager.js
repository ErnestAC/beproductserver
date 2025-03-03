import { v4 as uuidv4 } from "uuid";
import { Cart } from "../models/cart.model.js";
import { notifyCartChange } from "../server.js";
import { ProductModel } from "../models/product.model.js";
import { productManager } from "./product.manager.js"

export class CartManager {
    // Get all carts with populated product details
    async getAllCarts() {
        try {
            const carts = await Cart.find(); // Fetch all carts
    
            // Function to get cart with populated product details
            const getCartWithDetails = async (cartId) => {
                const cart = await this.getCartById(cartId); // Use the getCartById method to fetch cart with products
                if (!cart) {
                    console.log(`Cart with ID ${cartId} not found`);
                    return null;
                }
                return cart;
            };
    
            // Fetch details for each cart
            const cartsWithDetails = await Promise.all(carts.map(async (cart) => {
                return await getCartWithDetails(cart.cid);
            }));
    
            return cartsWithDetails.filter(cart => cart !== null); // Filter out null carts
    
        } catch (err) {
            console.error("Error retrieving all carts:", err);
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
            const product = await ProductModel.findOne({ pid });
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
            const productInCart = cart.products.find(item => item.pid === pid);

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

    // Get a cart by its ID (without product details)
    async getCartById(cartId) {
        try {
            const cart = await Cart.findOne({ cid: cartId });
            if (!cart) return null;
    
            // Convert cart to a plain object before modifying
            const cartObject = cart.toObject();
    
            // Collect product IDs from the cart
            const productIds = cartObject.products.map(p => p.pid);
    
            // Fetch all product details in one query
            const productsMap = new Map();
            if (productIds.length > 0) {
                const products = await ProductModel.find({ pid: { $in: productIds } });
                products.forEach(product => {
                    productsMap.set(product.pid, product);
                });
            }
    
            // Attach product details to the cart
            cartObject.products.forEach(product => {
                const productDetails = productsMap.get(product.pid);
                if (productDetails) {
                    Object.assign(product, productDetails.toObject());
                }
            });
    
            return cartObject; // Return the modified plain object
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

    // Clear all products from a cart
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
