import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import {productManager} from "../managers/product.managers.js";

const productsFile = "./src/data/products.json";

const route = Router();

// helper funct to remove an object by its id from an array
function removeById(array, idToRemove) {
    return array.filter(item => item.pid !== idToRemove && item.status !== false);
}


// GET all products with limit async
route.get('/', async (req, res) => {
    const { limit } = req.query;

    try {
        let listOfProducts = await productManager.getAllProducts(limit); 
        if (!listOfProducts) { // check for errors, if no response say there is a big issue
            console.log('Products: Error reading product data from storage.')
            return res.status(500).json({ error: 'Error reading product data from storage' });
        }
        const result = listOfProducts;
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

route.get('/:pid', async (req, res) => { 
    const pid = req.params.pid;
    
    try {
        let selectedProduct = await productManager.getProductById(pid); 
        if (selectedProduct === null) { // null means i got nothing back
            return res.status(404).json({ error: `No hits with this ID: ${pid}` });
        }
        const result = selectedProduct
        res.json({ result });
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

route.post('/', async (req, res) => {
    const product = req.body;
    let result = null

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || !product.status) {
        return res.status(400).json({ message: 'Missing required fields for this operation' });
    }
    try {
        result = await productManager.addProduct(product);
        res.status(201).json(result);
    } catch(error) {
        res.status(500).json({ message: `Server error ${error}` });
        console.log(error);
    }
    
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
        let listOfProducts = await productManager.getAllProducts(); 
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
        let listOfProducts = await productManager.getAllProducts(); // read everything from file and load it to be modified
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
            
            console.log(`Products: Data for ID#${product.pid} ${killFlag ? "" : "marked as "}deleted`)
        }
        const result=`Data for ID#${product.pid} ${killFlag ? "" : "marked as "}deleted.`
        res.json({ result }); // return the updated product list
    } catch (err) {
        console.error('Something broke', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default route;
