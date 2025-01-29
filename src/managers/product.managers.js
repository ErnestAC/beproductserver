import fs from "fs/promises"; // Use promises API for modern async file operations
import { v4 as uuidv4 } from "uuid";

const productsFile = "./src/data/products.json"

export class ProductManager {

    constructor(filePath = "./src/data/products.json") {
        this.productsFilePath = filePath;
    }

    // helper function to write an updated array to disk
    async writeProductsStorage(productsFile, jsonDataToWrite){
        try {
            await fs.writeFile(productsFile, JSON.stringify(jsonDataToWrite, null, 2)); // write json to file
            console.log("Data writen to file")
            return true;
        } catch (err) {
            console.log("Error: Data not writen to file", err)
            return false;
        }
    }

    async addProduct(newProduct) {
        const opuuid = uuidv4()
        let result = false
            // Create a new product object with a unique ID
        newProduct = { ...newProduct, pid: opuuid };
        try {
            let existingData = await productManager.getAllProducts(); // wait for me reading the file
            // Add the new product to the list in memory
            existingData.push(newProduct);
            // Write the updated data
            this.writeProductsStorage(productsFile, existingData)
            console.log(`Products: Product with id ${newProduct.pid} added successfully!`);
            result = newProduct
        } catch (err) {
            console.error('Error saving data:', err);
            result = null
        }
        return result
    }

    async getAllProducts(limit = null){
        let allProducts = [];
        try {
            const fileData = await fs.readFile(productsFile, 'utf-8');
            allProducts = JSON.parse(fileData); // parse json
            //filter based on if there is a limit or not passed
            if(limit){
                allProducts = allProducts.slice(0, Number(limit));
            }
            console.log(`A list of products has been produced. ${limit ? `Limited to ${limit} record(s).`  : "Not limited."}`)
            return allProducts
        } catch (err) {
            console.error('Error reading or parsing the file:', err);
            return null;
        }
    }

    async getProductById(pid) {
        try {
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
