// product.services.js

import { productDao } from "../persistence/mongo/dao/product.dao.js";
import { Types } from "mongoose";

class ProductService {
    async addProduct(productData) {
        return await productDao.addProduct(productData);
    }

    async getAllProducts({ limit, skip, sort, sortDirection, filterBy }) {
        return await productDao.getAllProducts({ limit, skip, sort, sortDirection, filterBy });
    }

    async getProductById(id) {
        if (!Types.ObjectId.isValid(id)) return null;
        return await productDao.getProductById(id);
    }

    async updateProduct(id, updateData) {
        if (!Types.ObjectId.isValid(id)) return null;
        return await productDao.updateProduct(id, updateData);
    }

    async deleteProduct(id, killFlag = true) {
        if (!Types.ObjectId.isValid(id)) return null;
        return await productDao.deleteProduct(id, killFlag);
    }

    async getTotalProductCount(filterBy) {
        return await productDao.getTotalProductCount(filterBy);
    }
}

export const productService = new ProductService();
