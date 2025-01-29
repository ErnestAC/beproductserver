import { Router } from "express";
import {CartManager} from '../managers/cart.managers.js'

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

export default route;

