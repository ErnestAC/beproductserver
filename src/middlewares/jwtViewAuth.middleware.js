// jwtViewAuth.middlewares.js
import jwt from "jsonwebtoken";
import { User } from "../persistence/mongo/models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const jwtViewAuth = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).lean();

        if (user) {
            req.user = user;
            res.locals.user = user; // makes it accessible to views
        } else {
            res.locals.user = null;
        }
    } catch (err) {
        res.locals.user = null;
    }

    next();
};
