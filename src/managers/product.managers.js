import fs from "fs/promises"; // Use promises for file operations
import { v4 as uuidv4 } from "uuid";

const productsFile = "./src/data/products.json";

export class ProductManager {
    constructor(filePath = "./src/data/products.json") {
        this.productsFilePath = filePath;
    }

    // Helper function to write data to file
    async writeProductsStorage(dataToWrite) {
        try {
            await fs.writeFile(this.productsFilePath, JSON.stringify(dataToWrite, null, 2));
            console.log("Products: Data written to file successfully.");
            return true;
        } catch (err) {
            console.error("Error: Failed to write data to file", err);
            return false;
        }
    }

    // Add a new product
    async addProduct(newProduct) {
        const opuuid = uuidv4();
        newProduct = { ...newProduct, pid: opuuid };

        try {
            let existingData = await this.getAllProducts();
            if (!existingData) {
                existingData = [];
            }
            existingData.push(newProduct);

            const success = await this.writeProductsStorage(existingData);
            if (!success) return null;

            console.log(`Products: Product with ID ${newProduct.pid} added successfully!`);
            return newProduct;
        } catch (err) {
            console.error("Error saving product:", err);
            return null;
        }
    }

    // Fetch all products
    async getAllProducts(limit = null) {
        try {
            const fileData = await fs.readFile(this.productsFilePath, "utf-8");
            let allProducts = JSON.parse(fileData);
            allProducts = allProducts.filter(obj => obj.active !== false);

            if (limit) {
                allProducts = allProducts.slice(0, Number(limit));
            }
            return allProducts;
        } catch (err) {
            console.error("Error reading or parsing the file:", err);
            return [];
        }
    }

    // Fetch a single product by ID
    async getProductById(pid) {
        try {
            const products = await this.getAllProducts();
            const result = products.find(({ pid: objectId }) => objectId === pid);
            return result || null;
        } catch (err) {
            console.error("Error fetching product by ID:", err);
            return null;
        }
    }

    // Helper: Merge updated properties except `pid`
    updateProductHelper(targetObject, sourceObject) {
        Object.keys(sourceObject).forEach(key => {
            if (key !== "pid" && key in targetObject) {
                targetObject[key] = sourceObject[key];
            }
        });
    }

    // Update a product
    async updateProduct(pid, productUpdate) {
        let listOfProducts = await this.getAllProducts();
        const productIndex = listOfProducts.findIndex(({ pid: objectId }) => objectId === pid);

        if (productIndex === -1) {
            console.log(`Nothing found for ID #${pid}.`);
            return null;
        }

        this.updateProductHelper(listOfProducts[productIndex], productUpdate);
        const success = await this.writeProductsStorage(listOfProducts);

        if (!success) {
            console.log(`Failed to update ID #${pid}.`);
            return null;
        }
        return listOfProducts[productIndex];
    }

    // Delete a product (soft delete unless killFlag is set)
    async deleteProduct(pid, killFlag = false) {
        let listOfProducts = await this.getAllProducts();
        const productIndex = listOfProducts.findIndex(({ pid: productId }) => productId === pid);

        if (productIndex === -1) {
            console.log(`ID #${pid} not found. Nothing deleted.`);
            return null;
        }

        if (killFlag) {
            listOfProducts.splice(productIndex, 1);
            console.log(`Permanently deleted product ID ${pid}.`);
        } else {
            listOfProducts[productIndex].active = false;
            console.log(`Soft deleted product ID ${pid}.`);
        }

        const success = await this.writeProductsStorage(listOfProducts);
        return success ? true : null;
    }
}

export const productManager = new ProductManager();
