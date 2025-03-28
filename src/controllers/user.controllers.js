class UserControllers{
    async registerUser(req, res) {
        const { username, email, password, first_name, last_name, age, cartId, role } = req.body;
    
        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: "User already exists" });
    
            user = new User({ username, email, password, first_name, last_name, age, cartId, role });
            await user.save();
    
            res.json({ message: "User registered successfully" });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }
}

export const userController = new UserControllers();