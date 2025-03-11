import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { check, validationResult } from "express-validator";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "00_IMPORTANT_JWT_SECRET_00";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "00_IMPORTANT_JWT_REFRESH_SECRET_00";

// Temporary storage for refresh tokens (can be stored in a database instead)
let refreshTokens = [];

// Generate Access Token (expires in 1 hour)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1h" });
};

// Generate Refresh Token (expires in 7 days)
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: "7d" });
};

// Register a new user
router.post("/register", [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ username, email, password });
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        refreshTokens.push(refreshToken); // Store refresh token

        res.json({ accessToken, refreshToken, user: { id: user._id, username, email } });

    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Login user
router.post("/login", [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        refreshTokens.push(refreshToken); // Store refresh token

        res.json({ accessToken, refreshToken, user: { id: user._id, username: user.username, email } });

    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Refresh Token Route (Get new access token)
router.post("/refresh", async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(401).json({ message: "Refresh token required" });
    if (!refreshTokens.includes(token)) return res.status(403).json({ message: "Invalid refresh token" });

    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        const accessToken = generateAccessToken(decoded.id);
        res.json({ accessToken });
    } catch (err) {
        console.error("Error refreshing token:", err);
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
});

// Logout (Invalidate Refresh Token)
router.post("/logout", async (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.json({ message: "Logged out successfully" });
});

export default router;
