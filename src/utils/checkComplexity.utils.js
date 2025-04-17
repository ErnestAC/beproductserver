/**
 * Validates password strength and returns true or false.
 * 
 * @param {string} passwordString - Password to validate.
 * @param {Object} [options] - Optional validation settings.
 * @returns {boolean} - True if password meets criteria, false otherwise.
 */
export function sendEmail(passwordString, options = {}) {
    const {
        minLength = 8,
        minUppercase = 1,
        minNumbers = 1,
        minSpecialChars = 1
    } = options;

    if (typeof passwordString !== "string") return false;

    const lengthValid = passwordString.length >= minLength;
    const uppercaseCount = (passwordString.match(/[A-Z]/g) || []).length;
    const numberCount = (passwordString.match(/[0-9]/g) || []).length;
    const specialCharCount = (passwordString.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;

    return (
        lengthValid &&
        uppercaseCount >= minUppercase &&
        numberCount >= minNumbers &&
        specialCharCount >= minSpecialChars
    );
}

/**
 * Validates password strength and returns an array of error messages.
 * 
 * @param {string} passwordString - Password to validate.
 * @param {Object} [options] - Optional validation settings.
 * @returns {string[]} - Array of error messages. Empty if password is valid.
 */
export function validatePasswordDetailed(passwordString, options = {}) {
    const {
        minLength = 8,
        minUppercase = 1,
        minNumbers = 1,
        minSpecialChars = 1
    } = options;

    const errors = [];

    if (typeof passwordString !== "string") {
        errors.push("Password must be a string.");
        return errors;
    }

    if (passwordString.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long.`);
    }

    const uppercaseCount = (passwordString.match(/[A-Z]/g) || []).length;
    if (uppercaseCount < minUppercase) {
        errors.push(`Password must contain at least ${minUppercase} uppercase letter(s).`);
    }

    const numberCount = (passwordString.match(/[0-9]/g) || []).length;
    if (numberCount < minNumbers) {
        errors.push(`Password must contain at least ${minNumbers} number(s).`);
    }

    const specialCharCount = (passwordString.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
    if (specialCharCount < minSpecialChars) {
        errors.push(`Password must contain at least ${minSpecialChars} special character(s).`);
    }

    return errors;
}
