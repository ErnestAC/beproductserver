export const requireRole = (role) => {
    return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== role) {
        return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
    }

    next();
    };
};

export const requireAdminOrOwner = (paramKey = "cid") => {
    return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role === "admin") return next(); // Allow admin

    // Allow user if the resource belongs to them
    if (req.user.cartId === req.params[paramKey]) {
        return next();
    }

    return res.status(403).json({ message: "Forbidden: Resource does not belong to user" });
    };
};
