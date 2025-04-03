// api.carts.routes.js

import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { cartController } from "../controllers/cart.controllers.js";
import { requireAdminOrOwner } from "../middlewares/role.middleware.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// Admin only: Retrieve all carts
router.get("/", jwtAuth, requireAdminOrOwner(), cartController.getAllCarts);

// Admin or cart owner: Retrieve a specific cart
router.get("/:cid", jwtAuth, requireAdminOrOwner("cid"), cartController.getCartById);

// Admin or cart owner: Add a product to a cart
router.post("/:cid/product/:pid", jwtAuth, requireAdminOrOwner("cid"), cartController.addProductToCart);

// Admin or cart owner: Update quantity of a product in a cart
router.patch("/:cid/product/:pid", jwtAuth, requireAdminOrOwner("cid"), cartController.updateProductInCart);

// Admin or cart owner: Delete a cart
router.delete("/:cid", jwtAuth, requireAdminOrOwner("cid"), cartController.deleteCart);

// Admin or cart owner: Remove a product from a cart
router.delete("/:cid/products/:pid", jwtAuth, requireAdminOrOwner("cid"), cartController.deleteProductFromCart);

// Any user: Create a new cart
router.post("/", jwtAuth, cartController.createCart);

export default router;
