// src/services/user.services.js
import { userDao } from "../persistence/mongo/dao/user.dao.js";
import { cartService } from "./cart.services.js";
import { v4 as uuidv4 } from 'uuid';

class UserService {

    async getUserByEmail(email) {
        return await userDao.getUserByEmail(email);
    }

    async getUserById(id) {
        return await userDao.getUserById(id);
    }

    async getAllUsers() {
        return await userDao.getAllUsers();
    }

    async createUser(userData) {
        // Before creating the user, let's generate a new cart for them.
        const cid = uuidv4();
        const newCart = await cartService.createCart(cid);

        const newUser = {
            ...userData,
            cartId: newCart.cid,
        };

        return await userDao.createUser(newUser);
    }

    async deleteUserById(id) {
        return await userDao.deleteUserById(id);
    }
}

export const userService = new UserService();
