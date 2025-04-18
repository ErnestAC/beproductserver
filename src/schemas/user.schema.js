import { z } from "zod";

// Schema for user registration
export const registerUserSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    
    dateOfBirth: z
        .string()
        .refine(val => !isNaN(Date.parse(val)), {
            message: "Invalid date format for Date of Birth",
        }),
    
    gid: z
        .string()
        .min(5, "Government ID must be at least 5 characters long"),

    role: z.string().optional().default("user"),
});

// Schema for login
export const loginUserSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});
