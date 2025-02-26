import { Router } from "express";
import {CartManager} from '../managers/cart.manager.js'

const cartManager = new CartManager();
const route = Router();



route.get("/:cid", async (req, res) => {
    let result = "";
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid)
    if (cart !== null){
        result = cart.products
    } else {
        res.status(404).json({ "message": "no cart was found" });
        return
    }
    res.json(result);    
});

route.post("/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await cartManager.addProductToCart(cid,pid)
    res.json(cart);    
});

route.post("/", async (req, res) => {
    const result = await cartManager.addCart()
    res.json(result);
})

route.get('/realtimecarts', async (req, res) => {
    const carts = await CartManager.getAllCarts();
    res.render('realTimeCarts', { carts });
});

export default route;

