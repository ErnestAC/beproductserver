// src/routes/api.users.routes.js

import { Router } from "express";
import passport from "../config/passport/passport.config.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { userService } from "../services/user.services.js";
import { UserDTO } from "../dto/user.dto.js";

const router = Router();
const jwtAuth = passport.authenticate("jwt", { session: false });

//  GET: Fetch a user by ID (admin only)
router.get("/:uid", jwtAuth, requireRole("admin"), async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userService.getUserById(uid);

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const dtoUser = new UserDTO(user);
        res.json({ status: "success", payload: dtoUser });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

//  PATCH: Update a user by ID (admin only)
router.patch("/:uid", jwtAuth, requireRole("admin"), async (req, res) => {
    try {
        const { uid } = req.params;
        const { firstName, lastName, role } = req.body;

        const updatedFields = {
            first_name: firstName,
            last_name: lastName,
            role
        };

        const updatedUser = await userService.updateUser(uid, updatedFields);

        if (!updatedUser) {
            return res.status(404).json({ status: "error", message: "User not found or update failed" });
        }

        const dtoUser = new UserDTO(updatedUser);
        res.json({ status: "success", payload: dtoUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

export default router;
