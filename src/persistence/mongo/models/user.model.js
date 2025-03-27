import mongoose from 'mongoose';
import { hashPassword, comparePassword } from '../../../utils/hashPassword.js';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

// 🔐 Hash password before saving (sync)
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = hashPassword(this.password);
    next();
});

// 🔐 Compare passwords (sync)
UserSchema.methods.matchPassword = function (enteredPassword) {
    return comparePassword(this.password, enteredPassword);
};

export const User = mongoose.model('User', UserSchema);
