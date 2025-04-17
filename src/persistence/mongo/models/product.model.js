// product.model.js

import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productCollection = "products";

const productSchema = new Schema(
    {
    title: String,
    handle: String,
    imageURL: String, // Store the full URL of the uploaded image
    description: String,
    stock: Number,
    code: String,
    pid: {
        type: String,
        unique: true,
    },
    price: Number,
    category: String,
    pieces: Number,
    active: Boolean,
    lighting: Boolean,
    wheelArrangement: String,
    thumbs: [String],
    },
    { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

export const ProductModel = model(productCollection, productSchema);
