import { z } from "zod";

// Schema for user registration
export const registerUserSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    
    age: z
        .union([
        z.string().transform((val) => parseInt(val, 10)),
        z.number(),
        ])
        .transform((val) => Number(val)) // Ensure it's a number regardless
        .refine((val) => !isNaN(val) && val > 0, {
        message: "Age must be a positive number",
        }),



    role: z.string().optional().default("user"),
});

// Schema for login
export const loginUserSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});
