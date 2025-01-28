import { Router } from "express";
import { upload } from "../utils.js";
import { listOfObjects } from "../mockdata.js";
import { v4 as uuidv4 } from 'uuid';

const route = Router();

// GET all products with limit
route.get('/', (req, res) => {
    const { limit } = req.query;
    const limitedList = limit ? listOfObjects.slice(0, Number(limit)) : listOfObjects;
    res.json({ limitedList });
});

// GET product by pid
route.get('/:pid', (req, res) => {
    const pid = Number(req.params.pid); // Convert to number to match data coming from mock
    const result = listOfObjects.find(({ pid: objectPid }) => objectPid === pid);
    if (!result) { //when result is falsy is when it has no value
        return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ result });
});


route.get('/:id/detalle', (req, res) => { 
    const { id } = req.params;
    res.json({
        id,
        nombre: 'Arroz',
        descripcion: 'El mejor arroz barato y rico',
        precio: 800,
        descuento: false
    });
});


// POST a new product
route.post('/',(req, res) => {
    const product = req.body
    const opuuid = uuidv4()

    if(!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category || !product.status){
        return res.status(400).json({ message: 'Missing required fields for this operation'})
    }

    console.log('Saved product ID: ', opuuid)
    console.log('Named: ', product.title)
    
    res.status(201).json({ message: `Product saved under ID#${opuuid}` })
})


// PUT to update a product
route.put('/:pid', upload.single('avatar'), (req, res) => {
    const producto = req.body;
    const { pid } = req.params;

    // Update logic here...

    res.json({ mensaje: 'Se actualizó el producto correctamente' });
});

// DELETE a product by pid
route.delete('/:pid', (req, res) => {
    const { pid } = req.params;

    // Delete logic here...

    res.json({ mensaje: 'Se eliminó el producto correctamente' });
});

export default route;