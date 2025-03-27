
import { productManager } from "../persistence/mongo/managers/product.manager.js";
import { notifyProductChange } from "../server.js";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { request, response } from "express"

class ProductsControllers {
    async deleteProduct(req, res) {
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
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
    async updateProduct(req = request, res = response) {
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
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
    async getProductById (req, res) {
        const { pid } = req.params;
        try {
            const selectedProduct = await productManager.getProductById(pid);
            if (!selectedProduct) {
                return res.status(404).json({ status: "error", message: `No product found with ID: ${pid}` });
            }
            res.json({ status: "success", payload: selectedProduct });
        } catch (err) {
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
    async getAllProducts (req, res) {
        try {
            const { limit = 10, page = 1, sort = "title", sortOrder = "asc", filterKey, filterValue } = req.query;
    
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: sortOrder === "desc" ? -1 : 1 },
                lean: true,
                customLabels: { docs: "payload" }
            };
    
            let query = {};
    
            if (filterKey && filterValue) {
                query[filterKey] = filterValue;
            }
    
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
                prevLink: result.hasPrevPage
                    ? `${req.baseUrl}?page=${result.prevPage}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder}${filterKey ? `&filterKey=${filterKey}&filterValue=${filterValue}` : ""}`
                    : null,
                nextLink: result.hasNextPage
                    ? `${req.baseUrl}?page=${result.nextPage}&limit=${limit}&sort=${sort}&sortOrder=${sortOrder}${filterKey ? `&filterKey=${filterKey}&filterValue=${filterValue}` : ""}`
                    : null
            });
        } catch (err) {
            console.error("Error retrieving products:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
    async addProduct(req, res) {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "Missing image file data. Add and retry." });
        }
    
        try {
            const {
                title,
                handle,
                description,
                stock,
                code,
                price,
                category,
                pieces,
                active,
                lighting,
                wheelArrangement
            } = req.body;
    
            const newProduct = {
                title,
                handle,
                imageURL: `/img/${req.file.filename}`,
                description,
                stock: Number(stock),
                code,
                price: Number(price),
                category,
                pieces: Number(pieces),
                active: active === "true",
                lighting: lighting === "true",
                wheelArrangement
            };
    
            const product = await productManager.addProduct(newProduct);
            console.log(newProduct);
            if (!product) {
                return res.status(400).json({ status: "error", message: "Invalid product data" });
            }
    
            res.status(201).json({ status: "success", payload: product });
        } catch (err) {
            console.error("Error creating product:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
}

export const productsController = new ProductsControllers();