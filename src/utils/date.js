/**
 * Gets an iso string of the current date and time.
 *
 * @returns An iso string of the current date and time.
 */
export function getNowISOString() {
  const now = new Date()

  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now
    .getDate()
    .toString()
    .padStart(2, '0')

  const time = now.toLocaleTimeString('pt-BR')
  const ms = now
    .getMilliseconds()
    .toString()
    .padStart(3, '0')

  return `${year}-${month}-${day}T${time}.${ms}Z`
}

/**
 * Turns a ISO string to a date.
 *
 * @usageNotes
 * This function must be used to convert dates that were gotten using the
 * `getNowISOString` function.
 *
 * @param {string} iso An ISO string that represents the date.
 * @returns a new date.
 */
export function isoToDate(iso) {
  const date = new Date(iso)
  date.setHours(date.getHours() + 3)

  return date
}

/**
 * Gets the first and last day of the week based on the given date.
 *
 * @param {Date} date The date to be calculated.
 * @returns An array of string dates in the format yyyy-mm-dd. The first and second positions are it's first and final days, respectively.
 */
export function getWeekInterval(date = new Date()) {
  const firstDay = date.getDate() - date.getDay()
  const lastDay = firstDay + 6

  const auxDate = new Date(date)

  const firstDayDate = new Date(date.setDate(firstDay))
  const lastDayDate = new Date(auxDate.setDate(lastDay))

  /**
   * Formats a number to 2 pads (00).
   *
   * @param {number} number The number to format.
   * @returns {string} The formatted number.
   */
  const formatPad = number => {
    return number.toString().padStart(2, '0')
  }

  const firstMonth = formatPad(firstDayDate.getMonth() + 1)
  const firstDate = formatPad(firstDayDate.getDate())

  const lastMonth = formatPad(lastDayDate.getMonth() + 1)
  const lastDate = formatPad(lastDayDate.getDate())

  return [
    `${firstDayDate.getFullYear()}-${firstMonth}-${firstDate}`,
    `${lastDayDate.getFullYear()}-${lastMonth}-${lastDate}`,
  ]
}

/**
 * Sorts the given intervals object by its dates.
 *
 * @param {Record<string, number>} intervals a list of week intervals.
 * @returns {Record<string, number>} an object with all week intervals sorted by date.
 */
export function sortWeekIntervals(intervals = {}) {
  return Object.fromEntries(
    Object.entries(intervals).sort((a, b) => (a[0] < b[0] ? -1 : 1)),
  )
}

/**
 * Defines an array of week days names.
 */
export const weekDays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

/**
 * Defines an array of months names.
 */
export const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]
