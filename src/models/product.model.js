import { Schema, model } from "mongoose";

const productCollection = "products";

const productSchema = new Schema({
    title: String,
    handle: String,
    imageURL: String,
    description: String,
    stock: Number,
    code: String, // Change to String
    pid: {
        type: String,
        unique: true
    },
    price: Number,
    category: String,
    pieces: Number,
    active: Boolean,
    lighting: Boolean,
    wheelArrangement: String,
    thumbs: [String],
});

export const ProductModel = model(productCollection, productSchema);