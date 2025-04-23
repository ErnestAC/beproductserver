// api.carts.routes.js

import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { cartController } from "../controllers/cart.controllers.js";
import { requireAdminOrOwner, requireOwner, requireRole } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { cartSchema } from "../schemas/cart.schema.js";
import { cartQuantitySchema } from "../schemas/cartQuantity.schema.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// Admin only: Retrieve all carts
router.get("/", jwtAuth, requireAdminOrOwner(), cartController.getAllCarts);

// Admin or cart owner: Retrieve a specific cart
router.get("/:cid", jwtAuth, requireAdminOrOwner("cid"), cartController.getCartById); // I'm allowing admins to see only the carts, they can't modify anymore based on input from tutor.

// Cart owner: Add a product to a cart
router.post("/:cid/product/:pid", jwtAuth, requireOwner("cid"), cartController.addProductToCart);

// Cart owner: Update quantity of a product in a cart
router.patch("/:cid/product/:pid", jwtAuth, requireOwner("cid"), validateRequest(cartQuantitySchema), cartController.updateProductInCart);

// Admin only: Delete a cart
router.delete("/:cid", jwtAuth, requireRole("admin"), cartController.deleteCart); // Admins can delete carts to replace a cart for a user manually.

// Cart owner: Remove a product from a cart
router.delete("/:cid/products/:pid", jwtAuth, requireOwner("cid"), cartController.deleteProductFromCart);

// Admin only: Create a new cart manually
router.post("/", jwtAuth, requireRole("admin"), validateRequest(cartSchema), cartController.createCart); // Admins can create carts

// Use POST method for purchase - Admin is not allowed to purchase!
router.post("/:cid/purchase", jwtAuth, requireOwner("cid"), requireRole("user"), cartController.purchaseCart);

export default router;
