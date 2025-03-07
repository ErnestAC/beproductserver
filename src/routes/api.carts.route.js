import { Router } from "express";
import { cartManager } from "../managers/cart.manager.js";
import { notifyCartChange } from "../server.js";
import { ProductModel } from "../models/product.model.js"
import { Cart } from "../models/cart.model.js"
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET: Retrieve all carts with product details

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'cid';  // Default sort by 'cid'
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;  // Convert sortOrder to number

        const carts = await Cart.find()
            .sort({ [sort]: sortOrder })
            .populate({
                path: 'products.pid',
                model: ProductModel,  // Ensure to populate using the ProductModel
                select: 'title handle imageURL description price category stock pieces'  // Optional: specify which fields to select
            })
            .lean()
            .paginate({ 
                page,
                limit,
                customLabels: { docs:'payload' }
            });

        res.json({
            status: "success",
            carts,
        });

    } catch (err) {
        console.error("Error retrieving carts with product details:", err);
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// GET: Retrieve a specific cart by CID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        
        const cart = await cartManager.getCartById(cid);

        if (cart) {
            
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
/* router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.addCart();
        res.status(201).json({ status: "success", payload: newCart });
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
}); */

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

// PATCH: Update quantity of a product in a cart
router.patch('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Validate that quantity is a number and not empty
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ status: "error", message: "Quantity must be a valid positive number" });
    }

    try {
        // get the cart contents
        const cart = await cartManager.getCartByIdMongoose(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }

        // find product inside the cart
        const productInCart = cart.products.find(item => item.pid === pid);
        if (!productInCart) {
            return res.status(404).json({ status: "error", message: "Product not found in cart" });
        }

        // Update the quantity
        productInCart.quantity = parseInt(quantity, 10);

        // Save the updated cart
        await cart.save();
        notifyCartChange();

        res.json({ status: "success", message: "Product quantity updated", payload: cart });
    } catch (err) {
        console.error("Error updating product quantity:", err);
        res.status(500).json({ status: "error", message: "Server error" });
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

router.post('/', async (req, res) => {
    try {
        const { products } = req.body || {};

        let cartProducts = [];

        if (Array.isArray(products) && products.length > 0) {
            cartProducts = products.map(product => {
                if (!product.pid) {
                    throw new Error("Each product must have a valid 'pid'.");
                }

                return {
                    pid: product.pid,
                    quantity: Number.isInteger(product.quantity) && product.quantity > 0 ? product.quantity : 1
                };
            });
        }

        const cid = uuidv4();

        const newCart = new Cart({
            cid,
            products: cartProducts
        });

        await newCart.save();
        notifyCartChange();

        res.status(201).json({
            status: "success",
            message: cartProducts.length > 0 ? "Cart created successfully with products." : "Empty cart created.",
            payload: newCart
        });

    } catch (err) {
        console.error("Error creating custom cart:", err);
        res.status(400).json({ status: "error", message: err.message || "Invalid request body." });
    }
});


export default router;
