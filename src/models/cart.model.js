import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    cid: {
        type: String,
        required: true,
        unique: true,
    },
    products: [
        {
            pid: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
        },
    ],
});

export const Cart = mongoose.model("Cart", cartSchema);
