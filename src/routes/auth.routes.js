import { Router } from "express";
import passport from "passport";
import { User } from "../persistence/mongo/models/user.model.js";
import { check, validationResult } from "express-validator";

const router = Router();

// ✅ Register a new user
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

// ✅ Login using Passport
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

// ✅ Logout and destroy session
router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logged out successfully" });
    });
});

// ✅ Check if user is authenticated
router.get("/me", (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ user: req.user });
    } else {
        return res.status(401).json({ message: "Not authenticated" });
    }
});

export default router;
