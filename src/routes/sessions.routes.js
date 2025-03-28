import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../persistence/mongo/models/user.model.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { registerUserSchema, loginUserSchema } from "../schemas/user.schema.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";



router.post("/register", validateRequest(registerUserSchema), async (req, res) => {
    const { username, email, password, first_name, last_name, age, cartId, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ username, email, password, first_name, last_name, age, cartId, role });
        await user.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ========== SESSION-BASED ==========
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

router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logged out successfully" });
    });
});

// ✅ Use JWT strategy instead of req.isAuthenticated
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        return res.json({ user: req.user });
    }
);

// ========== JWT-BASED ==========

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

        res.json({
            message: "JWT issued",
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
