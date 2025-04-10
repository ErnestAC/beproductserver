// src/services/cart.services.js
import { cartDao } from "../persistence/mongo/dao/cart.dao.js";

class CartService {
    async createCart() {
        return await cartDao.addCart();
    }

    async getCartById(cid) {
        return await cartDao.getCartById(cid);
    }

    async addProductToCart(cid, pid) {
        return await cartDao.addProductToCart(cid, pid);
    }

    async removeProductFromCart(cid, pid) {
        return await cartDao.deleteProductFromCart(cid, pid);
    }

    async clearCart(cid) {
        return await cartDao.clearCartById(cid);
    }

    async mergeGuestCartIntoUserCart(userCartId, guestProducts) {
        for (const guestItem of guestProducts) {
            for (let i = 0; i < guestItem.quantity; i++) {
                await this.addProductToCart(userCartId, guestItem.pid);
            }
        }
        return await this.getCartById(userCartId);
    }
}

export const cartService = new CartService();
