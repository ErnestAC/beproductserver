// src/utils/response.util.js
import { generateToken } from "./token.util.js";

/**
 * Sends a standard success JSON response with a fresh token.
 * @param {object} res - Express response object.
 * @param {object} data - Payload to send.
 * @param {object} user - Current user (req.user).
 */
export function sendSuccessResponse(res, data, user) {
    const newToken = generateToken(user);

    res.json({
        status: "success",
        token: newToken,
        ...data
    });
}

/**
 * Sends a standard error JSON response.
 * @param {object} res - Express response object.
 * @param {string} message - Error message.
 * @param {number} statusCode - HTTP status code (default 500).
 */
export function sendErrorResponse(res, message = "Internal server error", statusCode = 500) {
    res.status(statusCode).json({
        status: "error",
        message
    });
}
