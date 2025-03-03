import { Router } from "express";
import { cartManager } from "../managers/cart.manager.js";
import { notifyCartChange } from "../server.js";
import { ProductModel } from '../models/product.model.js';

const router = Router();

// GET: Retrieve all carts
router.get('/', async (req, res) => {
    try {
        // Fetch all carts
        const carts = await cartManager.getAllCarts();

        // For each cart, fetch product details for each product
        const populatedCartsPromises = carts.map(async (cart) => {
            const productDetailsPromises = cart.products.map(async (product) => {
                const productDetails = await ProductModel.findOne({ pid: product.pid });
                return {
                    ...product.toObject(),  // Merge product details into the product object
                    ...productDetails.toObject(),
                };
            });

            // Wait for all product details to be fetched for the current cart
            const productsWithDetails = await Promise.all(productDetailsPromises);

            return { ...cart.toObject(), products: productsWithDetails }; // Merge with cart data
        });

        // Wait for all populated carts to be ready
        const populatedCarts = await Promise.all(populatedCartsPromises);

        res.json({
            status: "success",
            payload: populatedCarts,
            totalPages: 1,
            prevPage: null,
            nextPage: null,
            page: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevLink: null,
            nextLink: null
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// GET: Retrieve a specific cart by CID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            // For each product in the cart, fetch product details
            const productDetailsPromises = cart.products.map(async (product) => {
                const productDetails = await ProductModel.findOne({ pid: product.pid });
                return {
                    ...product.toObject(),  // Convert mongoose doc to plain object
                    ...productDetails.toObject(), // Merge product details into product
                };
            });

            const productsWithDetails = await Promise.all(productDetailsPromises);

            res.json({
                status: "success",
                payload: { ...cart.toObject(), products: productsWithDetails },
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
            res.status(404).json({ status: "error", message: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// POST: Create a new cart
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.addCart();
        res.status(201).json({ status: "success", payload: newCart });
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// POST: Add a product to a cart
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        notifyCartChange();
        res.json({ status: "success", payload: updatedCart });
    } catch (err) {
        if (err.message.includes('Cart with ID')) {
            res.status(404).json({ status: "error", message: err.message });
        } else {
            res.status(500).json({ status: "error", message: 'Server error' });
        }
    }
});

// DELETE: delete cart contents by CID
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const deleted = await cartManager.clearCartById(cid);
        if (deleted) {
            notifyCartChange();
            res.json({ status: "success", message: "Cart contents deleted" });
        } else {
            res.status(404).json({ status: "error", message: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// DELETE: Remove a specific product from a cart
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        // Find the cart by cid
        const cart = await cartManager.getCartById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }

        // Check if the product exists in the cart
        const productIndex = cart.products.findIndex(item => item.pid === pid);
        if (productIndex === -1) {
            return res.status(404).json({ status: "error", message: "Product not found in cart" });
        }

        // Remove the product from the cart
        cart.products.splice(productIndex, 1);

        // Save the updated cart
        await cart.save();
        notifyCartChange(); // Notify 
        res.json({ status: "success", message: "Product removed from cart", payload: cart });
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});


export default router;
