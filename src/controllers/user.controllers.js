// src/controllers/user.controllers.js
import { userService } from "../services/user.services.js";
import { UserDTO } from "../dto/user.dto.js";

class UserControllers {
    // Registration
    async registerUser(req, res) {
        const { username, email, password, first_name, last_name, dateOfBirth, gid } = req.body;

        const role = "user";

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
                dateOfBirth,
                gid,
                role
            };

            const newUser = await userService.createUser(userData);

            res.status(201).render("registerSuccess", {
                user: {
                    username: newUser.username,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName
                }
            });
        } catch (err) {
            console.error("Error registering user:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // Get all users (Admin)
    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            const sanitized = users.map(u => new UserDTO(u));
            res.json({ status: "success", payload: sanitized });
        } catch (err) {
            console.error("Error fetching users:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // Get one user (Admin)
    async getUserById(req, res) {
        const { uid } = req.params;
        try {
            const user = await userService.getUserById(uid);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ status: "success", payload: new UserDTO(user) });
        } catch (err) {
            console.error("Error fetching user:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // Update user (Admin)
    async updateUser(req, res) {
        const { uid } = req.params;
        const updates = req.body;

        try {
            const updatedUser = await userService.updateUser(uid, updates);
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found or update failed" });
            }
            res.json({ status: "success", payload: new UserDTO(updatedUser) });
        } catch (err) {
            console.error("Error updating user:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
}

export const userController = new UserControllers();
