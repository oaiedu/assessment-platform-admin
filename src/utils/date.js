/**
 * Gets an iso string of the current date and time.
 *
 * @returns {string} An iso string of the current date and time.
 */
export const getNowISOString = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const miliseconds = now.getMilliseconds().toString().padStart(3, '0');

    return `${year}-${month}-${day}T${time}.${miliseconds}Z`;
}

/**
 * Gets the first and last day of the week based on the given date.
 *
 * @param {Date} date - The date to be calculated.
 * @returns {[string, string]} An array of string dates in the format yyyy-mm-dd. The first and second positions are it's first and final day, respectively.
 */
export const getWeekInterval = (date) => {
    const firstDay = date.getDate() - date.getDay();
    const lastDay = firstDay + 6;

    const auxDate = new Date(date);

    const firstDayDate = new Date(date.setDate(firstDay));
    const lastDayDate = new Date(auxDate.setDate(lastDay));

    /**
     * Formats a number to 2 pads (00).
     *
     * @param {number} number - The number to format.
     * @returns {string} The formatted number.
     */
    const formatPad = (number) => {
        return number.toString().padStart(2, '0');
    }

    const firstMonth = formatPad(firstDayDate.getMonth() + 1);
    const firstDate = formatPad(firstDayDate.getDate());
    const lastMonth = formatPad(lastDayDate.getMonth() + 1);
    const lastDate = formatPad(lastDayDate.getDate());

    return [
        `${firstDayDate.getFullYear()}-${firstMonth}-${firstDate}`,
        `${lastDayDate.getFullYear()}-${lastMonth}-${lastDate}`
    ];
}
