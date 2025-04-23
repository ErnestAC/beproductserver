// src/dto/cart.dto.js

export class CartDTO {
    constructor(cart) {
        this.cid = cart.cid;
        this.products = cart.products.map(item => ({
            pid: item.pid?.toString?.() ?? item.pid,  // make sure pid is string
            title: item.title || null,
            imageURL: item.imageURL || null,
            category: item.category || null,
            price: item.price || null,
            stock: item.stock || null,
            pieces: item.pieces || null,
            quantity: item.quantity,
            description: item.description || null,
            code: item.code || null
        }));
    }
}
