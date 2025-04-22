import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../persistence/mongo/models/user.model.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { registerUserSchema, loginUserSchema } from "../schemas/user.schema.js";
import { userController } from "../controllers/user.controllers.js"
import { requireLoggedOutOrRole } from "../middlewares/role.middleware.js";
import { errorLog } from "../utils/errorLog.util.js";
import { UserDTO } from "../dto/user.dto.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_string";

router.post("/register", requireLoggedOutOrRole(), validateRequest(registerUserSchema), userController.registerUser);

router.post("/login", validateRequest(loginUserSchema), (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info.message });

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({
                message: "Logged in successfully",
                user: new UserDTO(user),
            });
        });
    })(req, res, next);
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logged out successfully" });
    });
});

router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    return res.json({ user: new UserDTO(req.user) });
});

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

        res
            .cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 30 * 60 * 1000,
            })
            .json({
                message: "JWT issued and stored in cookie",
                user: new UserDTO(user),
            });

    } catch (err) {
        errorLog(err);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;
