import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { notifyProductChange } from "../server.js";

const router = Router();

// POST: Add a new product
router.post('/', async (req, res) => {
    try {
        const product = await productManager.addProduct(req.body);
        if (product) {
            notifyProductChange();
            res.status(201).json({ status: "success", payload: product });
        } else {
            res.status(400).json({ status: "error", message: "Invalid product data" });
        }
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// GET: Static products page with pagination
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort = 'title', sortOrder = 'asc', filterBy = '' } = req.query;
    const skip = (page - 1) * limit;

    try {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Fetch products with pagination
        const products = await productManager.getAllProducts({
            limit: Number(limit),
            skip: Number(skip),
            sort: sort,
            sortDirection: sortDirection,
            filterBy: filterBy
        });

        // Get total product count for pagination
        const totalProducts = await productManager.getTotalProductCount(filterBy);

        // Calculate total pages and page navigation flags
        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? Number(page) - 1 : null;
        const nextPage = hasNextPage ? Number(page) + 1 : null;

        // Function to generate next/previous links
        const generateLink = (newPage) => {
            const queryParams = new URLSearchParams(req.query);
            queryParams.set('page', newPage);
            return `${req.protocol}://${req.get('host')}${req.path}?${queryParams.toString()}`;
        };

        const prevLink = hasPrevPage ? generateLink(prevPage) : null;
        const nextLink = hasNextPage ? generateLink(nextPage) : null;

        // Response object with pagination details
        const response = {
            status: "success",
            payload: products, // Only return the products
            totalPages,
            prevPage,
            nextPage,
            page: Number(page),
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// GET: Retrieve products with pagination, sorting, and filtering (API version)
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort = 'title', sortOrder = 'asc', filterBy = '' } = req.query;
    const skip = (page - 1) * limit;

    try {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Fetch products with pagination
        const products = await productManager.getAllProducts({
            limit: Number(limit),
            skip: Number(skip),
            sort: sort,
            sortDirection: sortDirection,
            filterBy: filterBy
        });

        // Get total product count for pagination
        const totalProducts = await productManager.getTotalProductCount(filterBy);

        // Calculate total pages and page navigation flags
        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? Number(page) - 1 : null;
        const nextPage = hasNextPage ? Number(page) + 1 : null;

        // Function to generate next/previous links
        const generateLink = (newPage) => {
            const queryParams = new URLSearchParams(req.query);
            queryParams.set('page', newPage);
            return `${req.protocol}://${req.get('host')}${req.path}?${queryParams.toString()}`;
        };

        const prevLink = hasPrevPage ? generateLink(prevPage) : null;
        const nextLink = hasNextPage ? generateLink(nextPage) : null;

        // Response object
        const response = {
            status: "success",
            payload: products,
            totalPages,
            prevPage,
            nextPage,
            page: Number(page),
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// GET: Retrieve a specific product by PID
router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const selectedProduct = await productManager.getProductById(pid);
        if (!selectedProduct) {
            return res.status(404).json({ status: "error", message: `No product found with ID: ${pid}` });
        }
        res.json({ status: "success", payload: selectedProduct });
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// PUT: Update a product by PID
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const productUpdate = req.body;
    try {
        const result = await productManager.updateProduct(pid, productUpdate);
        if (result) {
            notifyProductChange();
            res.json({ status: "success", payload: result });
        } else {
            res.status(400).json({ status: "error", message: "Invalid product ID or update failed" });
        }
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

// DELETE: Delete a product by PID
router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    const { killFlag } = req.body;
    try {
        const result = await productManager.deleteProduct(pid, killFlag);
        if (result) {
            notifyProductChange();
            res.status(200).json({ status: "success", message: "Product deleted" });
        } else {
            res.status(400).json({ status: "error", message: "Product not found or could not be deleted" });
        }
    } catch (err) {
        res.status(500).json({ status: "error", message: 'Server error' });
    }
});

export default router;
