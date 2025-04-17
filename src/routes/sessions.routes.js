import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../persistence/mongo/models/user.model.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { registerUserSchema, loginUserSchema } from "../schemas/user.schema.js";
import { userController } from "../controllers/user.controllers.js"

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_string";

// Register new user
router.post("/register", validateRequest(registerUserSchema), userController.registerUser);

// Login with session-based Passport
router.post("/login", validateRequest(loginUserSchema), (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info.message });

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({
                message: "Logged in successfully",
                user: { id: user._id, username: user.username, email: user.email },
            });
        });
    })(req, res, next);
});

// Logout and clear cookie
router.post("/logout", (req, res) => {
    res.clearCookie("token"); // Clear JWT cookie
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logged out successfully" });
    });
});

// Get current user using JWT from cookie
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        return res.json({ user: req.user });
    }
);

// JWT login and send token via cookie
router.post("/jwt/login", validateRequest(loginUserSchema), async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: "30m",
        });

        // Send token in cookie (HttpOnly)
        res
            .cookie("token", token, {
                httpOnly: true,
                secure: false, // Set to true if using HTTPS
                sameSite: "strict",
                maxAge: 30 * 60 * 1000, // 30 minutes
            })
            .json({
                message: "JWT issued and stored in cookie",
                user: { id: user._id, username: user.username, email: user.email },
            });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
