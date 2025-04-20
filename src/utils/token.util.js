// src/utils/token.util.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "this_is_not_final"; // fallback default
const JWT_EXPIRES = process.env.JWT_EXPIRES || "30m"; // default expiration time

/**
 * Generates a fresh JWT token for a given user.
 * @param {Object} user - User object (must have _id, email, role at least).
 * @returns {String} Signed JWT token.
 */
export function generateToken(user) {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        cartId: user.cartId
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
