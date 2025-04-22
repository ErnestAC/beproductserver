// src/dto/user.dto.js
export class UserDTO {
    constructor({ _id, username, email, first_name, last_name, dateOfBirth, role, cartId }) {
        this.id = _id;
        this.username = username;
        this.email = email;
        this.firstName = first_name;
        this.lastName = last_name;
        this.completeName = this.giveCompleName(first_name, last_name)
        this.role = role;
        this.cartId = cartId;
        this.age = dateOfBirth ? this.calculateAge(dateOfBirth) : null;
    }

    calculateAge(dateOfBirth) {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--; // hasn't had birthday yet this year
        }
        return age;
    }

    giveCompleName(first_name, last_name){
        return first_name + " " + last_name
    }
}
