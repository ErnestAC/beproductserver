// src/services/cart.services.js
import { cartDao } from "../persistence/mongo/dao/cart.dao.js";
import { cartController } from "../controllers/cart.controllers.js";

class CartService {
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

    // Fixed version (corrected)
    async purchaseCart(cid) {
        return await cartDao.purchaseCart(cid);
    }
}

export const cartService = new CartService();
