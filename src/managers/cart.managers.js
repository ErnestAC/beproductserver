import fs from "fs/promises"; // Use promises API for modern async file operations
import { v4 as uuidv4 } from "uuid";

export class CartManager {
    constructor(filePath = "./src/data/carts.json") {
        // Store the file path as a property of the class
        this.cartsFilePath = filePath;
    }

  // Helper method to read data from the file
    async getAllCarts() {
        try {
            const fileData = await fs.readFile(this.cartsFilePath, "utf-8");
            return JSON.parse(fileData); // Parse and return JSON
        } catch (err) {
            if (err.code === "ENOENT") {
                // If the file does not exist, return an empty array
                console.warn(`File not found: ${this.cartsFilePath}. Returning an empty array.`);
                return [];
            }
        console.error("Error reading or parsing the file:", err);
        throw err; // Re-throw the error to allow further handling if needed
        }
    }

// Method to save data back to the file
    async saveCarts(data) {
        try {
            const jsonData = JSON.stringify(data, null, 2); // save json with pretty format
            await fs.writeFile(this.cartsFilePath, jsonData, "utf-8");
        } catch (err) {
            console.error("Error writing to the file:", err);
        throw err;
        }
    }

    // Method to add a new cart
    async addCart() {
        const carts = await this.getAllCarts();
        const newCart = {
            cid: uuidv4(), // Generate a unique ID
            products: [], // Assign an empty list to products
        };
        carts.push(newCart); // Add the new cart to the array
        await this.saveCarts(carts); // Save the updated carts back to the file
        return newCart;
    }

    // add product to cart
    async addProductToCart(cid, pid) {
        // Read all carts from the file
        let carts = await this.getAllCarts(); 

        // Find the cart by cid
        let cart = carts.find(cart => cart.cid === cid);
        if (!cart) {
            throw Error(`Cart with ID ${cid} not found`);
        }
        const productInCart = cart.products.find(product => product.pid === pid); // is already in the cart?
        if (productInCart) {
            productInCart.quantity += 1;  // Increment quantity
        } else {
            cart.products.push({ pid: pid, quantity: 1 });  // Add new product
        }

        // Write updated carts back to the file
        await fs.writeFile("./src/data/carts.json", JSON.stringify(carts, null, 2), "utf-8");

        return cart;  // Return updated cart
    }

  // Method to get a cart by its ID
async getCartById(cartId) {
    const carts = await this.getAllCarts();
    let result = carts.find(cart => cart.cid === cartId) || null; // Return the cart or null if not found
    return result
}

  // Method to delete a cart by its ID
async deleteCartById(cartId) {
    const carts = await this.getAllCarts();
    const updatedCarts = carts.filter(cart => cart.id !== cartId);
    if (updatedCarts.length === carts.length) {
        console.warn(`Cart with ID ${cartId} not found.`);
        return false; // Indicate no cart was deleted
    }
    await this.saveCarts(updatedCarts); // Save the updated carts back to the file
    return true; // Indicate success
}
}

export const cartManager = new CartManager();
