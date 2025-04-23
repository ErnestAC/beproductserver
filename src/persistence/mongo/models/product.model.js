// src/persistence/mongo/models/product.model.js

import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    handle: { type: String },
    imageURL: { type: String },
    description: { type: String },
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    category: { type: String },
    pieces: { type: Number },
    code: { type: String },
    motorizable: { type: Boolean, default: false },
    lighting: { type: Boolean, default: false },
    wheelArrangement: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual pid field for compatibility with old structure
productSchema.virtual("pid").get(function () {
  return this._id.toString();
});

productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

productSchema.plugin(mongoosePaginate);

export const ProductModel = mongoose.model("products", productSchema);
