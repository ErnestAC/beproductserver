import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { notifyProductChange } from "../server.js";
import { ProductModel } from "../models/product.model.js";
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
    try {
        const { limit = 10, page = 1, sort = 'title', sortOrder = 'asc', filterBy } = req.query;

        // Convert values to proper types
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sort]: sortOrder === 'desc' ? -1 : 1 },
            lean: true, // Convert documents to plain JavaScript objects
            customLabels: {docs :'payload'}
        };

        // Build query filter
        const query = filterBy ? { category: filterBy } : {};

        // Use mongoose paginate
        const result = await ProductModel.paginate(query, options);

        res.json({
            status: "success",
            payload: result.payload,
            totalPages: result.totalPages,
            prevPage: result.hasPrevPage ? result.prevPage : null,
            nextPage: result.hasNextPage ? result.nextPage : null,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `${req.baseUrl}?page=${result.prevPage}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder}` : null,
            nextLink: result.hasNextPage ? `${req.baseUrl}?page=${result.nextPage}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder}` : null
        });

    } catch (err) {
        console.error("Error retrieving products:", err);
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
