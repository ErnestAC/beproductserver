// src/dto/cart.dto.js

export class CartDTO {
    constructor(cart) {
        this.cid = cart.cid;
        this.products = cart.products.map(item => ({
            pid: typeof item.pid === "object" && item.pid._id ? item.pid._id.toString() : item.pid,
            title: item.pid.title || null,
            imageURL: item.pid.imageURL || null,
            category: item.pid.category || null,
            price: item.pid.price || null,
            stock: item.pid.stock || null,
            pieces: item.pid.pieces || null,
            quantity: item.quantity
        }));
    }
}
