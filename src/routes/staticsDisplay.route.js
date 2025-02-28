import { Router } from "express";
import { productManager } from "../managers/product.manager.js";

const router = Router();

// Static route for viewing all products with sorting and pagination
router.get('/products', async (req, res) => {
    // Extract query parameters with default values
    let { limit = 10, page = 1, sort = 'title', sortOrder = 'asc' } = req.query;

    // Ensure limit is a valid number and >= 1
    limit = Math.max(1, Number(limit) || 10); // Default to 10 if invalid

    // Ensure the page is a valid number and >= 1
    const currentPage = Math.max(1, Number(page)); // Ensure page is at least 1
    const skip = (currentPage - 1) * limit;

    try {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Fetch products with pagination and sorting
        const products = await productManager.getAllProducts({
            limit: limit,
            skip: skip,
            sort: sort,
            sortDirection: sortDirection
        });

        // Get total product count for pagination
        const totalProducts = await productManager.getTotalProductCount();
        const totalPages = Math.ceil(totalProducts / limit);

        // Calculate page navigation flags
        const hasPrevPage = currentPage > 1;
        const hasNextPage = currentPage < totalPages;
        const prevPage = hasPrevPage ? currentPage - 1 : null;
        const nextPage = hasNextPage ? currentPage + 1 : null;

        res.render('productsStatic', {
            products,
            currentPage,
            totalPages,
            prevPage,
            nextPage,
            hasPrevPage,
            hasNextPage,
            sort,
            sortOrder
        });
    } catch (err) {
        console.error('Error rendering products page:', err);
        res.status(500).send("Error rendering products");
    }
});

export default router;