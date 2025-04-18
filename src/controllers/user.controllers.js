// src/controllers/user.controllers.js
import { userService } from "../services/user.services.js";

class UserControllers {
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
}

export const userController = new UserControllers();
