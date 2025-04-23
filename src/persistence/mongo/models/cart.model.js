// src/persistence/mongo/models/cart.model.js

import { Schema, model, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cartSchema = new Schema(
    {
        cid: {
            type: String,
            unique: true,
        },
        products: [
            {
                pid: {
                    type: Types.ObjectId,       // use MongoDB ObjectId
                    ref: "products",            // reference the products collection
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

cartSchema.plugin(mongoosePaginate);

export const Cart = model("Cart", cartSchema);
