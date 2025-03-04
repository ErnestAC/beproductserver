import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_BASE_URL = 'http://localhost:8080/api/carts';
const PRODUCT_API_URL = 'http://localhost:8080/api/products';

async function simulateCartActivity() {
    try {
        console.log("Simulating cart activity...");

        const operations = [
            { type: 'createCart', probability: 0.3 },
            { type: 'addProduct', probability: 0.7 },
            { type: 'removeProduct', probability: 0 },
            { type: 'deleteCart', probability: 0 }
        ];

        async function createCart() {
            const response = await axios.post(API_BASE_URL);
            console.log("Created new cart:", response.data.payload);
        }

        async function addProductToCart() {
            try {
                // Fetch carts
                const cartResponse = await axios.get(API_BASE_URL);
                
        
                const carts = cartResponse.data?.carts.payload;
                if (!Array.isArray(carts) || carts.length === 0) {
                    console.log("No carts available.");
                    return;
                }
        
                // Fetch products
                const productResponse = await axios.get(PRODUCT_API_URL);
                
        
                const products = productResponse.data?.payload;
                if (!Array.isArray(products) || products.length === 0) {
                    console.log("No products available.");
                    return;
                }
        
                // Select a random cart and product
                const randomCart = carts[Math.floor(Math.random() * carts.length)];
                const randomProduct = products[Math.floor(Math.random() * products.length)];
        
                // Ensure the cart has a valid `cid` and the product has a valid `pid`
                if (!randomCart.cid || !randomProduct.pid) {
                    console.log("Invalid cart or product data.");
                    return;
                }
        
                // Add product to cart
                await axios.post(`${API_BASE_URL}/${randomCart.cid}/product/${randomProduct.pid}`);
                console.log(`Added product ${randomProduct.pid} to cart ${randomCart.cid}`);
            } catch (error) {
                console.error("Error adding product to cart:", error.response?.data || error.message);
            }
        }
        
        async function removeProductFromCart() {
            try {
                const cartResponse = await axios.get(API_BASE_URL);
                const carts = cartResponse.data.payload;
                if (!carts.length) return;

                const randomCart = carts[Math.floor(Math.random() * carts.length)];
                if (!randomCart.products.length) return;

                const randomProduct = randomCart.products[Math.floor(Math.random() * randomCart.products.length)];
                await axios.delete(`${API_BASE_URL}/${randomCart.cid}/products/${randomProduct.pid}`);
                console.log(`Removed product ${randomProduct.pid} from cart ${randomCart.cid}`);
            } catch (error) {
                console.error("Error removing product from cart:", error.response?.data || error.message);
            }
        }

        async function deleteCart() {
            try {
                const cartResponse = await axios.get(API_BASE_URL);
                const carts = cartResponse.data.payload;
                if (!carts.length) return;

                const randomCart = carts[Math.floor(Math.random() * carts.length)];
                await axios.delete(`${API_BASE_URL}/${randomCart.cid}`);
                console.log(`Deleted cart ${randomCart.cid}`);
            } catch (error) {
                console.error("Error deleting cart:", error.response?.data || error.message);
            }
        }

        async function performRandomOperation() {
            const randomValue = Math.random();
            let cumulativeProbability = 0;

            for (const operation of operations) {
                cumulativeProbability += operation.probability;
                if (randomValue < cumulativeProbability) {
                    switch (operation.type) {
                        case 'createCart':
                            await createCart();
                            break;
                        case 'addProduct':
                            await addProductToCart();
                            break;
                        case 'removeProduct':
                            await removeProductFromCart();
                            break;
                        case 'deleteCart':
                            await deleteCart();
                            break;
                    }
                    return;
                }
            }
        }

        setInterval(performRandomOperation, Math.floor(Math.random() * 3000) + 2000);
    } catch (error) {
        console.error('Error simulating cart activity:', error);
    }
}

simulateCartActivity();
