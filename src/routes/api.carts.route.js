import { Router } from "express";
import { cartManager } from "../managers/cart.manager.js";
import { notifyCartChange } from "../server.js";

const router = Router();

// GET: Retrieve all carts
router.get('/', async (req, res) => {
    try {
        // Fetch all carts without populating product details
        const carts = await cartManager.getAllCarts();
        console.log(carts);
        // Simply return the carts without any further modifications
        const cartData = carts.map(cart => cart.toObject());

        res.json({
            status: "success",
            payload: cartData,
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
        // Fetch the cart without populating product details
        const cart = await cartManager.getCartById(cid);

        if (cart) {
            // Just return the cart as is, without any product details population
            res.json({
                status: "success",
                payload: cart,  // Directly return the cart without extra population
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
        const cart = await cartManager.getCartByIdMongoose(cid);
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
