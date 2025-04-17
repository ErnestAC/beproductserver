import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../../../utils/hashPassword.util.js";

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        age: { type: Number, required: true },
        cartId: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    this.password = hashPassword(this.password);
    next();
});

// Compare passwords
UserSchema.methods.matchPassword = function (enteredPassword) {
    return comparePassword(this.password, enteredPassword);
};

export const User = mongoose.model("User", UserSchema);
