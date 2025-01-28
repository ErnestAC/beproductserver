import { Router } from "express";
import { listOfObjects } from "../mockdata.js";
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

const productsFile = "./src/assets/products.json";

const route = Router();


// funct to read
async function readFromFileDB(){
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

// Function to read, append, and rewrite the data to the file
async function appendToFile(newProduct) {
    try {
        let existingData = await readFromFileDB(); // wait for me reading the file
        // Add the new product to the list in memory
        existingData.push(newProduct);
        // Write the updated data
        await fs.writeFile(productsFile, JSON.stringify(existingData, null, 2)); // write json to file
        console.log(`Product with id ${newProduct.id} appended successfully!`);
    } catch (err) {
        console.error('Error appending to file:', err);
    }
}

// GET all products with limit async
route.get('/', async (req, res) => {
    const { limit } = req.query;

    try {
        let listOfProducts = await readFromFileDB(); 
        if (!listOfProducts) { // check for errors
            return res.status(500).json({ error: 'Error reading the product data' });
        }
        
        const result = limit ? listOfProducts.slice(0, Number(limit)) : listOfObjects;
        console.log(result)
        if (!result) {
            return res.status(404).json({ error: `ID # ${id} not found` });
        }
        
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET product by pid but asyncly
route.get('/:id', async (req, res) => { // Make this async
    const id = req.params.id;
    
    try {
        let listOfProducts = await readFromFileDB(); 
        if (!listOfProducts) { // check for errors
            return res.status(500).json({ error: 'Error reading the product data' });
        }
        
        const result = listOfProducts.find(({ id: objectId }) => objectId == id);
        console.log(result)
        if (!result) {
            return res.status(404).json({ error: `ID # ${id} not found` });
        }
        
        res.json({ result });
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST a new product
route.post('/', (req, res) => {
    const product = req.body;
    const opuuid = uuidv4();

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || !product.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }

    console.log('Working on: ', opuuid);

    // Create a new product object with a unique ID
    const newProduct = { ...product, id: opuuid };

    // Append to file
    appendToFile(newProduct);

    res.status(201).json({ message: `Finished operation - ${opuuid}` });
});

export default route;
