import fs from "fs/promises"; // Use promises 
import { v4 as uuidv4 } from "uuid";

const productsFile = "./src/data/products.json"

export class ProductManager {

    constructor(filePath = "./src/data/products.json") {
        this.productsFilePath = filePath;
    }

    // helper function to write an updated array to disk
    async writeProductsStorage(productsFile, DataToWrite){
        try {
            await fs.writeFile(productsFile, JSON.stringify(DataToWrite, null, 2)); // write json to file
            console.log("Products: Data writen to file")
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
    
    updateProductHelper(targetObject, sourceObject) {
        for (const key in sourceObject) {
            if (key !== 'pid' && targetObject.hasOwnProperty(key)) { //checking both objects have the same keys (properties) and updating source > target and I exclude the Id field as I DO NOT WANT TO TOUCH IT.
                targetObject[key] = sourceObject[key];
            }
        }
    }

    // helper funct to remove an object by its id from an array
    removeById(array, idToRemove) {
        return array.filter(item => item.pid !== idToRemove && item.status !== false);
    }

    async updateProduct(pid, productUpdate){
        let listOfProducts = await this.getAllProducts(); 
        const product = listOfProducts.find(({ pid: objectId }) => objectId == pid)
        if(!product){
            console.log(`Nothing found for ID # ${pid}.`);
            return null
        }
        console.log(`Updating product ${pid}.`);
        this.updateProductHelper(product,productUpdate) // use my helper to merge both objects
        listOfProducts = this.removeById(listOfProducts,pid) // remove old entry
        listOfProducts.push(product) // push updated new entry
        if (!await this.writeProductsStorage(productsFile,listOfProducts)){
            console.log(`Failed writing ID # ${pid} to storage.`);
            return null
        }
        return product
    }

    async deleteProduct(pid, killFlag=false){
        let listOfProducts = await this.getAllProducts();
        const productToDelete = listOfProducts.find(({ pid: productId }) => productId == pid)
        console.log("Attempting to remove", productToDelete)
        if(!productToDelete || !productToDelete.status){
            console.log(`ID # ${pid} not found. Nothing deleted.`);
            return null
        }
        listOfProducts = this.removeById(listOfProducts, pid)
        productToDelete.status = false // mark the object deleted
        if(!killFlag){ // if the flag to kill is not set, i'll update status. otherwise i'll delete from the file.
            listOfProducts.push(productToDelete) // add the updated object to the array
        } else {
            console.log(`killFlag has been set to true. I have a license to kill now.`)
            console.log(`Skipping re-adding ${pid} to the array.`)
        }
        if (!await this.writeProductsStorage(productsFile,listOfProducts)){
            console.log(`Failed deleting ID # ${pid} from storage.`);
            return null
        }
        return true
    }

}

export const productManager = new ProductManager();
