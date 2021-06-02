/**
 * Validates a name.
 *
 * @param {string} name - The name to be validated.
 * @returns {boolean} Whether the name is valid or not.
 */
export const nameValidation = (name) => {
    const regex = /^.{1,}$/;
    return regex.test(name);
};
