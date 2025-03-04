import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { cartManager } from "../managers/cart.manager.js";
import { Cart } from "../models/cart.model.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        res.render('index');
    } catch (err) {
        console.error('Error rendering home page:', err);
        res.status(500).send("Error rendering home page");
    }
});

router.get('/products', async (req, res) => {
    let { sort = 'title', sortOrder = 'asc' } = req.query;

    try {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        
        const products = await productManager.getAllProducts({
            sort: sort,
            sortDirection: sortDirection
        });

        res.render('productsStatic', {
            products,
            sort,
            sortOrder,
        });
    } catch (err) {
        console.error('Error rendering products page:', err);
        res.status(500).send("Error rendering products");
    }
});

router.get('/carts', async (req, res) => {
    try {
        const carts = await Cart.find().sort({ stock: -1 }).lean();
        let products = await productManager.getAllProducts({
            sort: 'stock',
            sortDirection: -1,
        });
        
        if (!Array.isArray(products)) {
            products = products ? [products] : [];
        }

        const productsMap = new Map();
        products.forEach(product => productsMap.set(product.pid, product));

        carts.forEach(cart => {
            cart.products.forEach(product => {
                const productDetails = productsMap.get(product.pid);
                if (productDetails) {
                    product.title = productDetails.title;
                    product.imageURL = productDetails.imageURL;
                    product.price = productDetails.price;
                }
            });
        });

        res.render('cartsStatic', { carts });
    } catch (error) {
        console.error("Error fetching carts:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartById(cid);
        if (!cart) {
            return res.status(404).render("cart", { error: "Cart not found" });
        }
        res.render("cart", { cart });
    } catch (err) {
        res.status(500).render("cart", { error: "Failed to load cart" });
    }
});

export default router;
