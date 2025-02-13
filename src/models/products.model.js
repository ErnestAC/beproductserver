import { Schema, model } from "mongoose";

new Schema ({
    title: sting,
    handle: string,
    imageURL: string,
    description: string,
    stock: number,
    code: number,
    pid: {
        type: String,
        unque: true
    },
    price: number,
    category: string,
    pieces: number,
    active: boolean,
    lighting: boolean,
    wheelArrangement: string,
    thumbs: list,
})

export const ProductModel = model(productCollection, productSchema);