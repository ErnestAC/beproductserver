import { connectDB } from './connectors/mongo.helpers.js';
import { ProductModel } from './models/product.model.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Explicit path to .env in root

// List of image URLs
const imageUrls = [
    "https://shopnhour-27c1e.web.app/img/arco.png",
    "https://shopnhour-27c1e.web.app/img/siemens.png",
    "https://shopnhour-27c1e.web.app/img/alstom.png",
    "https://shopnhour-27c1e.web.app/img/jrf_all_dualend.png",
    "https://shopnhour-27c1e.web.app/img/shunt2d.png",
    "https://shopnhour-27c1e.web.app/img/classf.png",
    "https://shopnhour-27c1e.web.app/img/toshiba.png",
    "https://shopnhour-27c1e.web.app/img/metcar.png",
    "https://shopnhour-27c1e.web.app/img/xlightrail.png",
    "https://shopnhour-27c1e.web.app/img/boxshunt.png",
    "https://shopnhour-27c1e.web.app/img/shuntlh.png",
    "https://shopnhour-27c1e.web.app/img/oddrail.png",
    "https://shopnhour-27c1e.web.app/img/arco_hsp.png",
    "https://shopnhour-27c1e.web.app/img/arco_ddf.png",
    "https://shopnhour-27c1e.web.app/img/alstom1934.png",
    "https://shopnhour-27c1e.web.app/img/dbldkr.png",
    "https://shopnhour-27c1e.web.app/img/tankcon.png",
    "https://shopnhour-27c1e.web.app/img/dv12.png",
    "https://shopnhour-27c1e.web.app/img/mu1h.png",
    "https://shopnhour-27c1e.web.app/img/u12c.png",
    "https://shopnhour-27c1e.web.app/img/gondola.png",
    "https://shopnhour-27c1e.web.app/img/modal_tanker.png"
];

async function generateProducts(count) {
    try {
        await connectDB();

        const products = [];
        for (let i = 0; i < count; i++) {
            const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

            const product = {
                pid: uuidv4(),
                title: `Model Train ${i + 1}`,
                description: `Description of model train ${i + 1}`,
                code: `CODE-${i + 1}`,
                price: Math.floor(Math.random() * 300) + 10,
                status: Math.random() < 0.9,
                stock: Math.floor(Math.random() * 50) + 1,
                category: `Category ${Math.floor(Math.random() * 5) + 1}`,
                thumbnails: [],
                active: true,
                handle: `product-${i + 1}-handle`,
                imageURL: randomImageUrl, // Assign random image URL from list
                pieces: Math.floor(Math.random() * 10) + 1,
                lighting: Math.random() < 0.5,
                wheelArrangement: `Wheel-A${Math.floor(Math.random() * 3) + 1}`
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

const productCount = 21;
generateProducts(productCount);
