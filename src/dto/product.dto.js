// src/dto/product.dto.js

export class ProductDTO {
    constructor(product) {
        this.pid = product.pid;
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
