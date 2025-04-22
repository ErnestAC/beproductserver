// public/js/passwordValidator.js
export function validatePasswordDetailed(password, options = {}) {
    const {
        minLength = 8,
        minUppercase = 1,
        minNumbers = 1,
        minSpecialChars = 1
    } = options;

    const errors = [];

    if (typeof password !== "string") {
        errors.push("Password must be a string.");
        return errors;
    }

    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long.`);
    }

    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    if (uppercaseCount < minUppercase) {
        errors.push(`Password must contain at least ${minUppercase} uppercase letter(s).`);
    }

    const numberCount = (password.match(/[0-9]/g) || []).length;
    if (numberCount < minNumbers) {
        errors.push(`Password must contain at least ${minNumbers} number(s).`);
    }

    const specialCharCount = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
    if (specialCharCount < minSpecialChars) {
        errors.push(`Password must contain at least ${minSpecialChars} special character(s).`);
    }

    return errors;
}
