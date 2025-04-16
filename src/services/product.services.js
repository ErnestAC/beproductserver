// product.services.js

import { productDao } from "../persistence/mongo/dao/product.dao.js";

class ProductService {
    async addProduct(productData) {
        return await productDao.addProduct(productData);
    }

    async getAllProducts({ limit, skip, sort, sortDirection, filterBy }) {
        return await productDao.getAllProducts({ limit, skip, sort, sortDirection, filterBy });
    }

    async getProductById(pid) {
        return await productDao.getProductById(pid);
    }

    async updateProduct(pid, updateData) {
        return await productDao.updateProduct(pid, updateData);
    }

    async deleteProduct(pid, killFlag = true) {
        return await productDao.deleteProduct(pid, killFlag);
    }

    async getTotalProductCount(filterBy) {
        return await productDao.getTotalProductCount(filterBy);
    }
}

export const productService = new ProductService();
