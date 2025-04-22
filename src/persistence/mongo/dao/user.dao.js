// src/persistence/mongo/dao/user.dao.js
import { User } from "../models/user.model.js";

class UserDao {
    async getUserByEmail(email) {
        return await User.findOne({ email });
    }

    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async getUserById(id) {
        return await User.findById(id);
    }

    async getAllUsers() {
        return await User.find();
    }

    async deleteUserById(id) {
        return await User.findByIdAndDelete(id);
    }

    async updateUser(id, updatedFields) {
        return await User.findByIdAndUpdate(id, updatedFields, { new: true });
    }
}

export const userDao = new UserDao();
