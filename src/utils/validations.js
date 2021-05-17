export const nameValidation = (name) => {
    const regex = /^.{1,}$/;
    return regex.test(name);
};
