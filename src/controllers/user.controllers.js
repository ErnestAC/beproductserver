// user.controllers.js
import { userDao } from "../persistence/mongo/dao/user.dao.js";
import { cartDao } from "../persistence/mongo/dao/cart.dao.js";

class UserControllers {
    async registerUser(req, res) {
        const { username, email, password, first_name, last_name, age, role } = req.body;

        try {
            const existingUser = await userDao.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Create a new cart and get its cid
            const newCart = await cartDao.addCart();
            const cartId = newCart.cid;

            const userData = {
                username,
                email,
                password,
                first_name,
                last_name,
                age,
                role,
                cartId
            };

            const newUser = await userDao.createUser(userData);

            res.json({ message: "User registered successfully", userId: newUser._id });
        } catch (err) {
            console.error("Error registering user:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
}

export const userController = new UserControllers();
