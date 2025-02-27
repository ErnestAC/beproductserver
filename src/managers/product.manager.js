// product.manager.js
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "../helpers/mongo.helpers.js";
import { ProductModel } from "../models/product.model.js";
import { notifyProductChange } from "../server.js";

export class ProductManager {
    async initialize() {
        try {
            await connectDB();
            console.log("ProductManager: Database connection initialized.");
        } catch (error) {
            console.error("ProductManager: Database connection failed:", error);
            throw error;
        }
    }

    async addProduct(newProduct) {
        if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category || newProduct.status === undefined) {
            return null;
        }
        const opuuid = uuidv4();
        newProduct.pid = opuuid;
        newProduct.active = true;

        try {
            const product = new ProductModel(newProduct);
            await product.save();
            console.log(`Products: Product with PID ${newProduct.pid} added successfully!`);
            console.log("Product added, notifying clients");
            notifyProductChange();
            return product.toObject();
        } catch (err) {
            console.error("Error saving product:", err);
            return null;
        }
    }

    async getAllProducts(limit = null) {
        try {
            let query = { active: true };
            let products = ProductModel.find(query);

            if (limit) {
                products = products.limit(Number(limit));
            }

            return await products.lean();
        } catch (err) {
            console.error("Error fetching products:", err);
            return [];
        }
    }

    async getProductById(pid) {
        try {
            return await ProductModel.findOne({ pid: pid, active: true }).lean();
        } catch (err) {
            console.error("Error fetching product by PID:", err);
            return null;
        }
    }

    async updateProduct(pid, productUpdate) {
        if (!Object.keys(productUpdate).length) {
            return null;
        }

        try {
            const updatedProduct = await ProductModel.findOneAndUpdate(
                { pid: pid, active: true },
                productUpdate,
                { new: true }
            ).lean();

            if (updatedProduct) {
                console.log(`Updated product PID ${pid}.`);
                console.log("Product updated, notifying clients");
                notifyProductChange();
                return updatedProduct;
            } else {
                console.log(`Nothing found for PID #${pid} or no changes made.`);
                return null;
            }
        } catch (err) {
            console.error("Error updating product:", err);
            return null;
        }
    }

    async deleteProduct(pid, killFlag = false) {
        try {
            if (killFlag) {
                const deleteResult = await ProductModel.deleteOne({ pid: pid });

                if (deleteResult.deletedCount > 0) {
                    console.log(`Permanently deleted product PID ${pid}.`);
                    console.log("Product deleted, notifying clients");
                    notifyProductChange();
                    return true;
                } else {
                    console.log(`PID #${pid} not found. Nothing deleted.`);
                    return null;
                }
            } else {
                const updateResult = await ProductModel.findOneAndUpdate(
                    { pid: pid, active: true },
                    { active: false },
                    { new: true }
                );

                if (updateResult) {
                    console.log(`Soft deleted product PID ${pid}.`);
                    console.log("Product deleted, notifying clients");
                    notifyProductChange();
                    return true;
                } else {
                    console.log(`PID #${pid} not found. Nothing deleted.`);
                    return null;
                }
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            return null;
        }
    }
}

export const productManager = new ProductManager();

productManager.initialize().catch((error) => {
    console.error("ProductManager initialization failed:", error);
});