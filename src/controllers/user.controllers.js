// user.controllers.js
import { userService } from "../services/user.services.js";

class UserControllers {
    async registerUser(req, res) {
        const { username, email, password, first_name, last_name, age } = req.body;

        const role = "user" // forces everything that is created to be a user no matter what has been sent in the body

        try {
            const existingUser = await userService.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            const userData = {
                username,
                email,
                password,
                first_name,
                last_name,
                age,
                role
            };

            const newUser = await userService.createUser(userData);

            // newUser is already a UserDTO
            res.status(201).json({
                message: "User registered successfully",
                user: newUser // Clean and safe for client
            });
        } catch (err) {
            console.error("Error registering user:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
}

export const userController = new UserControllers();
