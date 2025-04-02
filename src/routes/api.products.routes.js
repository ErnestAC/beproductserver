import { Router } from "express";
import { uploader } from "../utils.js";
import passport from "../config/passport/passport.config.js";
import { productsController } from "../controllers/product.controllers.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createProductSchema } from "../schemas/product.schema.js";
import { requireAdminOrOwner } from "../middlewares/role.middleware.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

// Admin only: Add a new product
router.post(
    "/",
    jwtAuth,
    requireAdminOrOwner(), // Only role === 'admin'
    uploader.single("file"),
    validateRequest(createProductSchema),
    productsController.addProduct
);

// Authenticated users: Get all products
router.get("/", jwtAuth, productsController.getAllProducts);

// Authenticated users: Get a specific product
router.get("/:pid", jwtAuth, productsController.getProductById);

// Admin only: Update a product
router.put("/:pid", jwtAuth, requireAdminOrOwner(), productsController.updateProduct);

// Admin only: Delete a product
router.delete("/:pid", jwtAuth, requireAdminOrOwner(), productsController.deleteProduct);

export default router;
