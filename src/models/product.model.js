import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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
}, { timestamps: true });

// Add pagination plugin
productSchema.plugin(mongoosePaginate);

// Add indexes for common sorting fields
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

export const ProductModel = model(productCollection, productSchema);
