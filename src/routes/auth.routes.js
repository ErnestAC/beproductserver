import { Router } from "express";
import passport from "passport";
import { User } from "../persistence/mongo/models/user.model.js";
import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// ========== SESSION-BASED ==========

// Register a new user
router.post(
    "/register",
    [
        check("username", "Username is required").not().isEmpty(),
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: "User already exists" });

            user = new User({ username, email, password });
            await user.save();

            res.json({ message: "User registered successfully" });
        } catch (err) {
            console.error("Error registering user:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Login with session
router.post("/login", (req, res, next) => {
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

// Logout
router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logged out successfully" });
    });
});

// Auth status check (session)
router.get("/me", (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ user: req.user });
    } else {
        return res.status(401).json({ message: "Not authenticated" });
    }
});

// ========== JWT-BASED ==========

// Login and issue JWT token
router.post("/jwt/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const valid = await user.matchPassword(password);
        if (!valid) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Optionally store the token in a cookie
        // res.cookie("token", token, { httpOnly: true });

        res.json({
            message: "JWT issued",
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error("JWT login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Protected route using JWT
router.get("/jwt/protected", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.json({
        message: "JWT-protected route accessed",
        user: req.user
    });
});

export default router;
