import { Router } from "express";
import { productManager } from "../managers/product.manager.js";
import { notifyProductChange } from "../server.js";

const router = Router();

// Add a new product
router.post('/', async (req, res) => {
    try {
        const product = await productManager.addProduct(req.body);
        if (product) {
            notifyProductChange();
            res.status(201).json({ result: product });
        } else {
            res.status(400).json({ message: "Invalid product data" });
        }
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get products with pagination, filtering, and sorting
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort = 'title', sortOrder = 'asc', filterBy = '' } = req.query;
    const skip = (page - 1) * limit;

    

    try {
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        let products = await productManager.getAllProducts({
            limit: Number(limit),
            skip: Number(skip),
            sort: sort,
            sortDirection: sortDirection,
            filterBy: filterBy
        });

        const totalProducts = await productManager.getTotalProductCount(filterBy);
        const totalPages = Math.ceil(totalProducts / limit);

        const response = {
            products,
            page: Number(page),
            totalPages,
            previousPage: page > 1 ? Number(page) - 1 : null,
            nextPage: page < totalPages ? Number(page) + 1 : null,
            pages: Array.from({ length: totalPages }, (_, i) => i + 1),
            isFirstPage: page === 1,
            isLastPage: page === totalPages,
            limit: Number(limit),
            sort,
            sortOrder,
        };

        res.json(response);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a single product by ID
router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const selectedProduct = await productManager.getProductById(pid);
        if (!selectedProduct) {
            return res.status(404).json({ error: `No product found with ID: ${pid}` });
        }
        res.json({ result: selectedProduct });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a product by ID
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const productUpdate = req.body;
    try {
        const result = await productManager.updateProduct(pid, productUpdate);
        if (result) {
            notifyProductChange();
            res.json({ result });
        } else {
            res.status(400).json({ message: "Invalid product ID or update failed" });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a product by ID
router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    const { killFlag } = req.body;
    try {
        const result = await productManager.deleteProduct(pid, killFlag);
        if (result) {
            notifyProductChange();
            res.status(200).json({ message: "Product deleted" });
        } else {
            res.status(400).json({ message: "Product not found or could not be deleted" });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;