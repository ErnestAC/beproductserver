import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

const productsFile = "./src/assets/products.json";

const route = Router();

// helper funct to read from file
async function getAllProducts(){
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

// helper funct to remove an object by its id from an array
function removeById(array, idToRemove) {
    return array.filter(item => item.pid !== idToRemove && item.status !== false);
}

// helper function to write an updated array to disk
async function writeProductsStorage(productsFile, jsonDataToWrite){
    try {
        await fs.writeFile(productsFile, JSON.stringify(jsonDataToWrite, null, 2)); // write json to file
        console.log("Data writen to file")
        return true;
    } catch (err) {
        console.log("Error: Data not writen to file", err)
        return false;
    }
}



// GET all products with limit async
route.get('/', async (req, res) => {
    const { limit } = req.query;

    try {
        let listOfProducts = await getAllProducts(); 
        if (!listOfProducts) { // check for errors
            console.log('Products: Error reading product data from storage.')
            return res.status(500).json({ error: 'Error reading product data from storage' });
        }
        
        const result = limit ? listOfProducts.slice(0, Number(limit)) : listOfProducts;
        console.log(`Products: Products have been retrieved. ${limit ? `Limited to ${limit} objects` : "No limit passed."}`)
        
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET product by pid but asyncly
route.get('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    
    try {
        let listOfProducts = await getAllProducts(); 
        if (!listOfProducts) { // false list of prods means something failed
            return res.status(500).json({ error: 'Error reading the product data' });
        }
        
        const result = listOfProducts.find(({ pid: objectId }) => objectId == pid);
        console.log(result)
        if (!result) { // if result is false, i found nothing
            return res.status(404).json({ error: `ID # ${pid} not found` });
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

    async function addProduct(newProduct) {
        try {
            let existingData = await getAllProducts(); // wait for me reading the file
            // Add the new product to the list in memory
            existingData.push(newProduct);
            // Write the updated data
            writeProductsStorage(productsFile, existingData)
            console.log(`Products: Product with id ${newProduct.pid} added successfully!`);
        } catch (err) {
            console.error('Error saving data:', err);
        }
    }

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || !product.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }

    console.log('Products: Working on: ', opuuid);

    // Create a new product object with a unique ID
    const newProduct = { ...product, id: opuuid };

    // Append to file
    addProduct(newProduct);

    res.status(201).json({ message: `Finished operation - ${opuuid}` });
});

// PUT Update product by pid asyncly
route.put('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    const productUpdate = req.body
    
    function updateProduct(targetObject, sourceObject) {
        for (const key in sourceObject) {
            if (key !== 'pid' && targetObject.hasOwnProperty(key)) { //checking both objects have the same keys (properties) and updating source > target and I exclude the Id field as I DO NOT WANT TO TOUCH IT.
                targetObject[key] = sourceObject[key];
            }
        }
    }

    try {
        let listOfProducts = await getAllProducts(); 
        if (!listOfProducts) { // false list of prods means something failed
            return res.status(500).json({ error: 'Error reading the product data' });
        }
        
        const product = listOfProducts.find(({ pid: objectId }) => objectId == pid);

        if (!product) { // check if the id is found first
            return res.status(404).json({ error: `ID # ${pid} not found` });
        } else {
            updateProduct(product,productUpdate) // I update the product I got from the above search before I replace the one in the listofproducts array.
            listOfProducts = removeById(listOfProducts, product.pid) // remove the original object
            listOfProducts.push(product) // add the updated object to the array
            writeProductsStorage(productsFile,listOfProducts)
            console.log(`Products: Updated data for ID# ${product.pid} `)
        }
        const result=product
        res.json({ result }); // return the updated product list
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete data by ID

route.delete('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    const killFlag = req.body.killFlag
    

    try {
        let listOfProducts = await getAllProducts(); // read everything from file and load it to be modified
        if (!listOfProducts) { // false list means failed or nothing read, report error and end
            return res.status(500).json({ error: 'Error reading the product data' });
        }
        
        const product = listOfProducts.find(({ pid: objectId }) => objectId == pid);

        if (!product || !product.status) { // check if the id is found first, if not; end.
            return res.status(404).json({ error: `ID # ${pid} not found` });
        } else {
            // mark it deleted by updating status to false
            product.status=false
            listOfProducts = removeById(listOfProducts, product.pid) // remove the original object
            if(!killFlag){
                listOfProducts.push(product) // add the updated object to the array
                console.log(`killFlag has been set to true. I have a license to kill now.`)
            
            }
            writeProductsStorage(productsFile,listOfProducts)
            
            console.log(`Products: Data for ID#${product.pid} ${killFlag ? "" : "marked"} as deleted`)
        }
        const result=`Data for ID#${product.pid} ${killFlag ? "" : "marked"} as deleted`
        res.json({ result }); // return the updated product list
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default route;
