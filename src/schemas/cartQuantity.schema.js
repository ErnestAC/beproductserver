// src/schemas/cartQuantity.schema.js
import { z } from "zod";

export const cartQuantitySchema = z.object({
    quantity: z.number({
        required_error: "Quantity is required",
        invalid_type_error: "Quantity must be a number"
    }).min(1, "Quantity must be at least 1")
});
