// src/dto/product.dto.js

export class ProductDTO {
    constructor(product) {
        this._id = product._id?.toString(); // Ensure _id is available for Handlebars & frontend
        this.pid = product._id?.toString() || product.pid; // legacy compatibility if still used elsewhere
        this.title = product.title;
        this.imageURL = product.imageURL;
        this.category = product.category;
        this.price = product.price;
        this.stock = product.stock;
        this.pieces = product.pieces;
        this.code = product.code;
        this.motorizable = product.motorizable;
        this.lighting = product.lighting;
    }
}
