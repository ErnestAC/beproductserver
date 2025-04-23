import { connectDB } from "../connectors/mongo.connector.js";
import { ProductModel } from "../models/product.model.js";
import { notifyProductChange } from "../../../server.js";
import { validateCompletenessOfProduct } from "../../../utils/productCompleteHelper.util.js";
import { Types } from "mongoose";

export class ProductDao {
    async initialize() {
        try {
            await connectDB();
        } catch (error) {
            console.error("ProductManager: Database connection failed:", error);
            throw error;
        }
    }

    async addProduct(newProduct) {
        if (!validateCompletenessOfProduct(newProduct)) {
            return null;
        }

        newProduct.active = true;

        try {
            const product = new ProductModel(newProduct);
            await product.save();
            notifyProductChange();
            return product.toObject();
        } catch (err) {
            console.error("Error saving product:", err);
            return err;
        }
    }

    async getAllProducts({ limit = 10, skip = 0, sort = "title", sortDirection = 1, filterBy = "" }) {
        const query = { active: true };
        const sortCriteria = {};
        sortCriteria[sort] = sortDirection;

        try {
            return await ProductModel.find(query)
                .sort(sortCriteria)
                .skip(skip)
                .limit(Number(limit))
                .lean();
        } catch (err) {
            console.error("Error fetching products:", err);
            return [];
        }
    }

    async getProductById(id) {
        try {
            if (!Types.ObjectId.isValid(id)) return null;
            return await ProductModel.findOne({ _id: id, active: true }).lean();
        } catch (err) {
            console.error("Error fetching product by ID:", err);
            return null;
        }
    }

    async updateProduct(id, productUpdate) {
        if (!Types.ObjectId.isValid(id) || !Object.keys(productUpdate).length) return null;

        try {
            const updatedProduct = await ProductModel.findOneAndUpdate(
                { _id: id, active: true },
                productUpdate,
                { new: true }
            ).lean();

            if (updatedProduct) {
                notifyProductChange();
                return updatedProduct;
            }
            return null;
        } catch (err) {
            console.error("Error updating product:", err);
            return null;
        }
    }

    async deleteProduct(id, killFlag = true) {
        try {
            if (!Types.ObjectId.isValid(id)) return null;

            if (killFlag) {
                const result = await ProductModel.deleteOne({ _id: id });

                if (result.deletedCount > 0) {
                    notifyProductChange();
                    return true;
                }
                return null;
            } else {
                const result = await ProductModel.findOneAndUpdate(
                    { _id: id, active: true },
                    { active: false },
                    { new: true }
                );

                if (result) {
                    notifyProductChange();
                    return true;
                }
                return null;
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            return null;
        }
    }

    async getTotalProductCount(filterBy = "") {
        try {
            const query = { active: true };

            if (filterBy) {
                query.$or = [
                    { title: { $regex: filterBy, $options: "i" } },
                    { description: { $regex: filterBy, $options: "i" } },
                    { code: { $regex: filterBy, $options: "i" } },
                    { price: { $regex: filterBy, $options: "i" } },
                    { stock: { $regex: filterBy, $options: "i" } },
                    { category: { $regex: filterBy, $options: "i" } }
                ];
            }

            return await ProductModel.countDocuments(query);
        } catch (err) {
            console.error("Error getting total product count:", err);
            return 0;
        }
    }
}

export const productDao = new ProductDao();

productDao.initialize().catch((error) => {
    console.error("ProductManager initialization failed:", error);
});
