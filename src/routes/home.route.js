import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { Cart } from "../models/cart.model.js";
import paginate from 'express-paginate';

const router = Router();

// Middleware setup
router.use(paginate.middleware(10, 50)); // lim 10, 50 max

router.get('/', async (req, res) => {
    try {
        // Render the home page
        res.render('home');
    } catch (err) {
        console.error('Error rendering home page:', err);
        res.status(500).send("Error rendering home page");
    }
});

router.get('/products', async (req, res) => {
    let { sort = 'title', sortOrder = 'asc' } = req.query;

    try {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        let limit = Math.max(1, Number(req.query.limit) || 10);
        let page = Math.max(1, Number(req.query.page) || 1);
        const offset = (page - 1) * limit; //calculate the offset manually

        // Fetch products with pagination and sorting
        const products = await productManager.getAllProducts({
            limit: limit,
            skip: offset, //use the manually calculated offset
            sort: sort,
            sortDirection: sortDirection
        });

        // Get total product count for pagination
        const totalProducts = await productManager.getTotalProductCount();
        const totalPages = Math.ceil(totalProducts / limit);

        // Calculate page navigation flags
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? page - 1 : null;
        const nextPage = hasNextPage ? page + 1 : null;

        res.render('productsStatic', {
            products,
            currentPage: page,
            totalPages: totalPages,
            prevPage: prevPage,
            nextPage: nextPage,
            hasPrevPage: hasPrevPage,
            hasNextPage: hasNextPage,
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
        let { page = 1, limit = 10, sort } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const totalItems = await Cart.countDocuments(); // Total carts
        const pageCount = Math.ceil(totalItems / limit); // Total pages
        const carts = await Cart.find()
            .sort(sort ? { [sort]: 1 } : {}) // Sort dynamically if provided
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('products.pid')  // Populate the product information
            .lean(); // Convert Mongoose objects to plain JSON

        // Generate page numbers
        const pages = [];
        for (let i = 1; i <= pageCount; i++) {
            pages.push(i);
        }

        res.render('cartsStatic', {
            carts,
            totalItems,
            pageCount,
            currentPage: page,
            prevPage: page > 1 ? page - 1 : 1,
            nextPage: page < pageCount ? page + 1 : pageCount,
            limit,
            sort,
            pages, // Pass the pages array to Handlebars
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


export default router;
