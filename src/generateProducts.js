// generateProducts.js
import { connectDB } from './helpers/mongo.helpers.js';
import { ProductModel } from './models/product.model.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Explicit path to .env in root

async function generateProducts(count) {
    try {
        await connectDB();

        const products = [];
        for (let i = 0; i < count; i++) {
            const product = {
                pid: uuidv4(),
                title: `Product ${i + 1}`,
                description: `Description of product ${i + 1}`,
                code: `CODE-${i + 1}`,
                price: Math.floor(Math.random() * 100) + 10,
                status: Math.random() < 0.9,
                stock: Math.floor(Math.random() * 50) + 5,
                category: `Category ${Math.floor(Math.random() * 5) + 1}`,
                thumbnails: [],
                active: true,
                handle: `product-${i+1}-handle`,
                imageURL: `http://example.com/image${i+1}.jpg`,
                pieces: Math.floor(Math.random() * 10) + 1,
                lighting: Math.random() < 0.5,
                wheelArrangement: `Wheel-${Math.floor(Math.random() * 3) + 1}`
            };
            products.push(product);
        }

        await ProductModel.insertMany(products);
        console.log(`${count} products generated and inserted successfully.`);
    } catch (error) {
        console.error('Error generating products:', error);
    } finally {
        mongoose.disconnect();
    }
}

const productCount = 250;
generateProducts(productCount);