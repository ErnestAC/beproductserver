import bcrypt from "bcryptjs";

// Hash the password
export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

// Passwprd comparison
export const comparePassword = (userPassword, receivedPassword) => {
    return  bcrypt.compareSync(receivedPassword, userPassword);
}
