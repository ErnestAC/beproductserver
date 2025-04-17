// src/dto/user.dto.js
export class UserDTO {
    constructor({ _id, username, email, first_name, last_name, age, role, cartId }) {
        this.id = _id; // Assuming MongoDB's default _id field
        this.username = username;
        this.email = email;
        this.firstName = first_name;
        this.lastName = last_name;
        this.age = age;
        this.role = role;
        this.cartId = cartId;
    }
}
