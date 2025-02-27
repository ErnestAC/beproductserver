import { Router } from "express";
import { cartManager } from "../managers/cart.manager.js";
import { notifyCartChange } from "../server.js";

const router = Router();

// GET all carts
router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.json({ result: carts });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET cart by ID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            res.json({ result: cart });
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create a new cart
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.addCart();
        res.status(201).json({ result: newCart });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST add product to cart
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        res.json({ result: updatedCart });
    } catch (err) {
        if (err.message.includes('Cart with ID')) {
            res.status(404).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

// DELETE cart by ID
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const deleted = await cartManager.deleteCartById(cid);
        if (deleted) {
            res.json({ message: 'Cart deleted' });
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;