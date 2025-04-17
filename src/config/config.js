// src/config/config.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  gmailUser: process.env.GMAIL_USER,
  gmailPass: process.env.GMAIL_PASS,
  jwtSecret: process.env.JWT_SECRET,
};
