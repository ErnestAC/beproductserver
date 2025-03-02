import { Schema, model } from "mongoose";

const cartSchema = new Schema({
    cid: {
        type: String,
        unique: true,
    },
    products: [
        {
            pid: {
                type: String,  // Change from ObjectId to String
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
}, { timestamps: true });

export const Cart = model("Cart", cartSchema);
