import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { cartController } from "../controllers/cart.controllers.js"

const router = Router();

// Protected: Retrieve all carts
router.get("/", isAuthenticated, cartController.getAllCarts);

// Protected: Retrieve a specific cart by CID
router.get("/:cid", isAuthenticated, cartController.getCartById);

// Protected: Add a product to a cart
router.post("/:cid/product/:pid", isAuthenticated, cartController.addProductToCart);

// Protected: Update quantity of a product in a cart
router.patch("/:cid/product/:pid", isAuthenticated, cartController.updateProductInCart);

// Protected: Delete a cart by CID
router.delete("/:cid", isAuthenticated, cartController.deleteCart);

// Protected: Remove a specific product from a cart
router.delete("/:cid/products/:pid", isAuthenticated, cartController.deleteProductFromCart);

// Protected: Create a new cart
router.post("/", isAuthenticated, cartController.createCart);

export default router;
