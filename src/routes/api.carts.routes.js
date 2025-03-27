import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { cartController } from "../controllers/cart.controllers.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// Protected: Retrieve all carts
router.get("/", jwtAuth, cartController.getAllCarts);

// Protected: Retrieve a specific cart by CID
router.get("/:cid", jwtAuth, cartController.getCartById);

// Protected: Add a product to a cart
router.post("/:cid/product/:pid", jwtAuth, cartController.addProductToCart);

// Protected: Update quantity of a product in a cart
router.patch("/:cid/product/:pid", jwtAuth, cartController.updateProductInCart);

// Protected: Delete a cart by CID
router.delete("/:cid", jwtAuth, cartController.deleteCart);

// Protected: Remove a specific product from a cart
router.delete("/:cid/products/:pid", jwtAuth, cartController.deleteProductFromCart);

// Protected: Create a new cart
router.post("/", jwtAuth, cartController.createCart);

export default router;
