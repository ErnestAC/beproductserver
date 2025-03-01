import { v4 as uuidv4 } from "uuid";
import { connectDB } from "../helpers/mongo.helpers.js";
import { ProductModel } from "../models/product.model.js";
import { notifyProductChange } from "../server.js";
import mongoosePaginate from 'mongoose-paginate-v2';

export class ProductManager {
    async initialize() {
        try {
            await connectDB();
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
            notifyProductChange();
            return product.toObject();
        } catch (err) {
            console.error("Error saving product:", err);
            return null;
        }
    }

    // Updated to use pagination via mongoose-paginate-v2
    async getAllProducts({ limit = 10, page = 1, sort = 'title', sortDirection = 1, filterBy = '' }) {
        const query = { active: true }; // Add filter logic if necessary
    
        const sortCriteria = {};
        sortCriteria[sort] = sortDirection;

        try {
            const options = {
                page: Number(page),
                limit: Number(limit),
                sort: sortCriteria,
                lean: true
            };

            if (filterBy) {
                query.$or = [
                    { title: { $regex: filterBy, $options: 'i' } },
                    { description: { $regex: filterBy, $options: 'i' } },
                    { code: { $regex: filterBy, $options: 'i' } },
                    { price: { $regex: filterBy, $options: 'i' } },
                    { stock: { $regex: filterBy, $options: 'i' } },
                    { category: { $regex: filterBy, $options: 'i' } },
                    { pid: { $regex: filterBy, $options: 'i' } }
                ];
            }

            const result = await ProductModel.paginate(query, options);
            return result;
        } catch (err) {
            console.error("Error fetching products:", err);
            return { docs: [], totalDocs: 0 };
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
                notifyProductChange();
                return updatedProduct;
            } else {
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
                    notifyProductChange();
                    return true;
                } else {
                    return null;
                }
            } else {
                const updateResult = await ProductModel.findOneAndUpdate(
                    { pid: pid, active: true },
                    { active: false },
                    { new: true }
                );

                if (updateResult) {
                    notifyProductChange();
                    return true;
                } else {
                    return null;
                }
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            return null;
        }
    }

    // This method is now unnecessary, as pagination handles the counting.
    async getTotalProductCount(filterBy = '') {
        try {
            const query = { active: true };

            if (filterBy) {
                query.$or = [
                    { title: { $regex: filterBy, $options: 'i' } },
                    { description: { $regex: filterBy, $options: 'i' } },
                    { code: { $regex: filterBy, $options: 'i' } },
                    { price: { $regex: filterBy, $options: 'i' } },
                    { stock: { $regex: filterBy, $options: 'i' } },
                    { category: { $regex: filterBy, $options: 'i' } },
                    { pid: { $regex: filterBy, $options: 'i' } }
                ];
            }

            const count = await ProductModel.countDocuments(query);
            return count;
        } catch (err) {
            console.error("Error getting total product count:", err);
            return 0;
        }
    }
}

export const productManager = new ProductManager();

productManager.initialize().catch((error) => {
    console.error("ProductManager initialization failed:", error);
});
