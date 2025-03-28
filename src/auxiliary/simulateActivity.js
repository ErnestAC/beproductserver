import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_BASE_URL = 'http://localhost:8080/api/products';
const LOGIN_URL = 'http://localhost:8080/api/auth/login';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

async function login() {
    const credentials = {
        email: "noemail2@email.com",
        password: "sss121"
    };

    try {
        const response = await client.post(LOGIN_URL, credentials);
        console.log("✅ Logged in successfully");
        return response.data;
    } catch (error) {
        console.error("❌ Login failed:", error.response?.data || error.message);
        throw error;
    }
}

async function simulateActivity() {
    try {
        await login(); // ✅ Login first

        console.log("🚀 Simulating activity...");

        const operations = [
            { type: 'create', probability: 0.0 },
            { type: 'update', probability: 1 },
            { type: 'delete', probability: 0.0 }
        ];

        async function createProduct() {
            const product = {
                title: `Simulated Product ${uuidv4().substring(0, 8)}`,
                description: `Simulated description ${uuidv4().substring(0, 10)}`,
                code: `SIM-${uuidv4().substring(0, 6)}`,
                price: Math.floor(Math.random() * 100) + 10,
                status: Math.random() < 0.9,
                stock: Math.floor(Math.random() * 50) + 5,
                category: `Simulated Category ${Math.floor(Math.random() * 5) + 1}`,
                thumbnails: [],
                handle: `simulated-product-${uuidv4().substring(0,6)}-handle`,
                imageURL: `http://example.com/simulated-image-${uuidv4().substring(0,6)}.jpg`,
                pieces: Math.floor(Math.random() * 10) + 1,
                lighting: Math.random() < 0.5,
                wheelArrangement: `Wheel-${Math.floor(Math.random() * 3) + 1}`
            };
            await client.post(API_BASE_URL, product);
            console.log("✅ Created product");
        }

        async function updateProduct() {
            try {
                const response = await client.get(API_BASE_URL);
                const products = response.data.payload;

                if (products && products.length > 0) {
                    const randomProduct = products[Math.floor(Math.random() * products.length)];
                    const updatedProduct = {
                        title: `Updated Simulated Product ${uuidv4().substring(0, 8)}`,
                        description: `Updated description ${uuidv4().substring(0, 10)}`,
                        price: Math.floor(Math.random() * 100) + 10,
                        stock: Math.floor(Math.random() * 50) + 5,
                        status: true
                    };
                    await client.put(`${API_BASE_URL}/${randomProduct.pid}`, updatedProduct);
                    console.log("✅ Updated product:", randomProduct.pid);
                }
            } catch (error) {
                console.error("❌ Error updating product:", error.response?.data || error.message);
            }
        }

        async function deleteProduct() {
            try {
                const response = await client.get(API_BASE_URL);
                const products = response.data.payload;

                if (products && products.length > 0) {
                    const randomProduct = products[Math.floor(Math.random() * products.length)];
                    await client.delete(`${API_BASE_URL}/${randomProduct.pid}`);
                    console.log("✅ Deleted product:", randomProduct.pid);
                }
            } catch (error) {
                console.error("❌ Error deleting product:", error.response?.data || error.message);
            }
        }

        async function performRandomOperation() {
            const randomValue = Math.random();
            let cumulativeProbability = 0;

            for (const operation of operations) {
                cumulativeProbability += operation.probability;
                if (randomValue < cumulativeProbability) {
                    switch (operation.type) {
                        case 'create':
                            await createProduct();
                            break;
                        case 'update':
                            await updateProduct();
                            break;
                        case 'delete':
                            await deleteProduct();
                            break;
                    }
                    return;
                }
            }
        }

        setInterval(performRandomOperation, Math.floor(Math.random() * 1000) + 1000);

    } catch (error) {
        console.error('❌ Error simulating activity:', error);
    }
}

simulateActivity();
