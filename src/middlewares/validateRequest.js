export const validateRequest = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body); // ✅ throws if invalid
        next();
    } catch (err) {
        return res.status(400).json({
            status: "error",
            message: "Validation error",
            errors: err.errors || err.message,
            });
    }
};  