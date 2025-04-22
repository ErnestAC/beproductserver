// src/schemas/ticket.schema.js

// not using this one as I am not letting the users create carts manually.

import { z } from "zod";

export const ticketSchema = z.object({
    amount: z.number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number"
    }),
    purchaser: z.string({
        required_error: "Purchaser email is required",
        invalid_type_error: "Purchaser must be a string"
    }).email("Purchaser must be a valid email address"),
    purchased: z.array(z.any()).optional(),
    notPurchased: z.array(z.any()).optional()
});
