import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import paginate from 'express-paginate';

const router = Router();

// Middleware setup
router.use(paginate.middleware(10, 50));

// Static route for viewing all products with sorting and pagination
router.get('/', async (req, res) => {
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

export default router;