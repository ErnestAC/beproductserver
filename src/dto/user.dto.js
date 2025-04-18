// src/dto/user.dto.js
export class UserDTO {
    constructor({ _id, username, email, first_name, last_name, dateOfBirth, gid, role, cartId }) {
        this.id = _id;
        this.username = username;
        this.email = email;
        this.firstName = first_name;
        this.lastName = last_name;
        this.dateOfBirth = dateOfBirth;
        this.gid = gid;
        this.role = role;
        this.cartId = cartId;
    }
}
