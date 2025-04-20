// src/controllers/product.controllers.js

import { productService } from "../services/product.services.js";
import { notifyProductChange } from "../server.js";
import { request, response } from "express";
import { ProductModel } from "../persistence/mongo/models/product.model.js";
import { ProductDTO } from "../dto/product.dto.js";
import { generateToken } from "../utils/token.util.js"; // NEW

class ProductsControllers {
    async deleteProduct(req, res) {
        const { pid } = req.params;
        const { killFlag } = req.body;
        try {
            const result = await productService.deleteProduct(pid, killFlag);
            if (result) {
                notifyProductChange();
                const newToken = generateToken(req.user); // 🔥 Refresh token on DELETE
                res.status(200).json({ status: "success", message: "Product deleted", token: newToken });
            } else {
                res.status(400).json({ status: "error", message: "Product not found or could not be deleted" });
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }

    async updateProduct(req = request, res = response) {
        const { pid } = req.params;
        const productUpdate = req.body;
        try {
            const result = await productService.updateProduct(pid, productUpdate);
            if (result) {
                notifyProductChange();
                const dto = new ProductDTO(result);
                const newToken = generateToken(req.user); // 🔥 Refresh token on UPDATE
                res.json({ status: "success", payload: dto, token: newToken });
            } else {
                res.status(400).json({ status: "error", message: "Invalid product ID or update failed" });
            }
        } catch (err) {
            console.error("Error updating product:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }

    async getProductById(req, res) {
        const { pid } = req.params;
        try {
            const selectedProduct = await productService.getProductById(pid);
            if (!selectedProduct) {
                return res.status(404).json({ status: "error", message: `No product found with ID: ${pid}` });
            }
            const dto = new ProductDTO(selectedProduct);
            res.json({ status: "success", payload: dto }); // ❌ No token refresh on simple GET
        } catch (err) {
            console.error("Error retrieving product by ID:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }

    async getAllProducts(req, res) {
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

            const dtoPayload = result.payload.map(product => new ProductDTO(product));

            res.json({
                status: "success",
                payload: dtoPayload,
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
            }); // ❌ No token refresh on simple GET
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

            const product = await productService.addProduct(newProduct);

            if (!product) {
                return res.status(400).json({ status: "error", message: "Invalid product data" });
            }

            const dto = new ProductDTO(product);
            const newToken = generateToken(req.user); // 🔥 Refresh token on ADD
            res.status(201).json({ status: "success", payload: dto, token: newToken });
        } catch (err) {
            console.error("Error creating product:", err);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
}

export const productsController = new ProductsControllers();
