import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().min(1, "Description is required"),
  stock: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Stock must be a non-negative number",
    }),
  code: z.string().min(1, "Code is required"),

  price: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Price must be a positive number",
    }),
  category: z.string().min(1, "Category is required"),
  pieces: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Pieces must be a non-negative number",
    }),
  active: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  lighting: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  motorizable: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  wheelArrangement: z.string().min(1, "Wheel arrangement is required"),
  thumbs: z
    .union([
      z.string().transform((val) => val.split(",")), // "a,b,c" → ["a", "b", "c"]
      z.array(z.string()),
    ])
    .optional(),
});
