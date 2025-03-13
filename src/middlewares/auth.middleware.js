const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "Not authorized, please log in" });
};
