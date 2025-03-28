import { Router } from "express";
import { uploader } from "../utils.js";
import passport from "../config/passport/passport.config.js";
import { productsController } from "../controllers/product.controllers.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createProductSchema } from "../schemas/product.schema.js";

const router = Router();

// JWT authentication middleware
const jwtAuth = passport.authenticate("jwt", { session: false });

// Protected: Add a new product (Requires JWT)
router.post(
    "/",
    jwtAuth,
    uploader.single("file"),
    validateRequest(createProductSchema),
    productsController.addProduct
);

// Protected: Get static products with pagination
router.get("/", jwtAuth, productsController.getAllProducts);

// Protected: Retrieve a specific product by PID
router.get("/:pid", jwtAuth, productsController.getProductById);

// Protected: Update a product by PID
router.put("/:pid", jwtAuth, productsController.updateProduct);

// Protected: Delete a product by PID
router.delete("/:pid", jwtAuth, productsController.deleteProduct);

export default router;
