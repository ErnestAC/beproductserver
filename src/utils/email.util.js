// src/utils/email.util.js

import nodemailer from 'nodemailer';
import { config } from '../config/config.js';
import { errorLog } from './errorLog.util.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.gmailUser,
        pass: config.gmailPass,
    },
});

/**
 * Sends an email using the configured Gmail transporter
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML allowed)
 * @returns {Promise<Object>} - Nodemailer's sendMail response
 */
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to,
            subject,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent:", result.response);
        return result;
    } catch (error) {
        errorLog(error)
        throw error;
    }
};
