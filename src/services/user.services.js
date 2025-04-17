// src/services/user.services.js
import { userDao } from "../persistence/mongo/dao/user.dao.js";
import { cartService } from "./cart.services.js";
import { v4 as uuidv4 } from 'uuid';
import { UserDTO } from "../dto/user.dto.js";

class UserService {

    async getUserByEmail(email) {
        const user = await userDao.getUserByEmail(email);
        return user ? new UserDTO(user) : null;
    }

    async getUserById(id) {
        const user = await userDao.getUserById(id);
        return user ? new UserDTO(user) : null;
    }

    async getAllUsers() {
        const users = await userDao.getAllUsers();
        return users.map(user => new UserDTO(user));
    }

    async createUser(userData) {
        // Generate a new cart before creating user
        const cid = uuidv4();
        const newCart = await cartService.createCart(cid);

        const newUser = {
            ...userData,
            cartId: newCart.cid,
        };

        const created = await userDao.createUser(newUser);
        return new UserDTO(created);
    }

    async deleteUserById(id) {
        return await userDao.deleteUserById(id);
    }
}

export const userService = new UserService();
