import { Router } from "express";
import { uploader } from "../utils/fileHandler.utils.js";
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
    requireAdminOrOwner(), // Only admins
    uploader.single("file"),
    validateRequest(createProductSchema),
    productsController.addProduct
);

// Authenticated users: Get all products
router.get("/", jwtAuth, productsController.getAllProducts);

// Authenticated users: Get a specific product by MongoDB _id
router.get("/:id", jwtAuth, productsController.getProductById);

// Admin only: Update a product by _id
router.put("/:id", jwtAuth, requireAdminOrOwner(), productsController.updateProduct);

// Admin only: Delete a product by _id
router.delete("/:id", jwtAuth, requireAdminOrOwner(), productsController.deleteProduct);

export default router;
