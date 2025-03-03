import { ProductModel } from "../models/product.model.js";
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
    let { page = 1, limit = 10, sort = 'title', sortOrder = 'asc', filterBy = '' } = req.query;

    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    try {
        const query = filterBy ? { category: filterBy } : {}; // Filter products if a category is provided

        const options = {
            page,
            limit,
            sort: { [sort]: sortDirection },
            lean: true // Convert Mongoose docs to plain JS objects
        };

        const result = await ProductModel.paginate(query, options);

        res.render('productsStatic', {
            products: result.docs,
            currentPage: result.page,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            totalItems: result.totalDocs,
            limit,
            sort,
            sortOrder,
            filterBy
        });

    } catch (err) {
        console.error('Error rendering products page:', err);
        res.status(500).send("Error rendering products");
    }
});


router.get('/carts', async (req, res) => {
    try {
        let { limit = 10, page = 1, sort = 'createdAt', sortOrder = 'desc' } = req.query;
        limit = Math.max(1, Number(limit) || 10);
        page = Math.max(1, Number(page));
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Fetch carts without population
        const options = {
            page,
            limit,
            sort: { [sort]: sortDirection },
            lean: true // Convert Mongoose docs to plain JS objects
        };

        const result = await Cart.paginate({}, options);

        // Manually populate product details
        for (let cart of result.docs) {
            for (let item of cart.products) {
                const product = await ProductModel.findOne({ pid: item.pid }).lean();
                if (product) {
                    item.productDetails = product;
                }
            }
        }

        console.log("Carts data being sent to Handlebars:", JSON.stringify(result.docs, null, 2));

        res.render('cartsStatic', {
            carts: result.docs, 
            currentPage: result.page,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            sort,
            sortOrder,
            limit,
        });

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
