import { Router } from "express";
import { uploader } from "../utils.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { productsController } from "../controllers/product.controllers.js";

const router = Router();

// Protected: Add a new product (Requires login)
router.post("/", isAuthenticated, uploader.single("file"), productsController.addProduct);

// Protected: Get static products with pagination
router.get("/", isAuthenticated, productsController.getAllProducts);

// Protected: Retrieve a specific product by PID
router.get("/:pid", isAuthenticated, productsController.getProductById);

// Protected: Update a product by PID
router.put("/:pid", isAuthenticated, productsController.updateProduct);

// Protected: Delete a product by PID
router.delete("/:pid", isAuthenticated, productsController.deleteProduct);

export default router;
