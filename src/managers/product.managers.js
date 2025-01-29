import fs from "fs/promises"; // Use promises API for modern async file operations
import { v4 as uuidv4 } from "uuid";

const productsFile = "./src/data/products.json"

export class ProductManager {

    constructor(filePath = "./src/data/products.json") {
        // Store the file path as a property of the class
        this.productsFilePath = filePath;
    }

    async getAllProducts(){
        let existingData = [];
        try {
            const fileData = await fs.readFile(productsFile, 'utf-8');
            existingData = JSON.parse(fileData); // parse json
            return existingData
        } catch (err) {
            console.error('Error reading or parsing the file:', err);
            return null;
        }
    }

    async getProductById(pid) {
        try {
            // ✅ Use `this.getAllProducts()` instead of `getAllProducts()`
            const products = await this.getAllProducts();  
    
            if (!products) {
                console.error("Error: Unable to fetch products.");
                return null;
            }
    
            const result = products.find(({ pid: objectId }) => objectId == pid);
    
            if (!result) {
                console.log("Nothing found with this pid");
                return null;
            } else {
                console.log("Found product with this pid:", result);
                return result;
            }
    
        } catch (err) {
            console.error("Error reading or parsing the file:", err);
            return null;
        }
    }
    
}

export const productManager = new ProductManager();
