// src/schemas/cart.schema.js

import { z } from "zod";

export const cartSchema = z.object({
    cid: z.string({
        required_error: "Cart ID (cid) is required",
        invalid_type_error: "Cart ID must be a string"
    }),
    products: z.array(
        z.object({
            pid: z.string({
                required_error: "Product ID (pid) is required",
                invalid_type_error: "Product ID must be a string"
            }),
            quantity: z.number({
                required_error: "Quantity is required",
                invalid_type_error: "Quantity must be a number"
            }).min(1, "Quantity must be at least 1")
        })
    ).optional()
});
