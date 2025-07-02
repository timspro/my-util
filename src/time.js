import { mod } from "./math.js"

/**
 * Gets various ways of representing the current time in EDT. Floors to nearest second by default.
 * @param {Object} $1
 * @param {boolean=} $1.floorMinute If true, floors to the nearest minute. If false, floors to the nearest second.
 * @param {number=} $1.timestamp Unix timestamp to use instead of current time.
 * @returns {Object} { timestamp, date, time, minute, datetime }
 */
export function getEasternTime({ floorMinute = false, timestamp = undefined } = {}) {
  if (!timestamp) {
    timestamp = new Date().getTime() / 1000
  }
  timestamp = floorMinute ? Math.floor(timestamp / 60) * 60 : Math.floor(timestamp)
  const string = new Date(timestamp * 1000).toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const [americanDate, time] = string.split(", ")
  const [month, day, year] = americanDate.split("/")
  const date = [year, month, day].join("-")
  const minute = parseInt(time.split(":")[1], 10)
  const datetime = `${date} ${time}`
  return { timestamp, date, time, minute, datetime }
}

/**
 * Checks if the string represents a valid YYYY-MM-DD date.
 * This will return false for dates like "2024-02-31".
 * @param {string} string
 * @returns {boolean}
 */
export function isDate(string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/u.exec(string)
  if (!match) {
    return false
  }
  const [, year, month, day] = match.map(Number)
  const date = new Date(`${string}T00:00:00Z`)
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  )
}

/**
 * Checks if the string represent a valid HH:mm:ss time.
 * @param {string} string
 * @returns {boolean}
 */
export function isTime(string) {
  return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/u.test(string)
}

/**
 * Checks if a number is a Unix timestamp (i.e. in seconds).
 * Would not validate timestamps set very far into the future.
 * @param {number} ts
 * @param {Object} $1
 * @param {number} $1.max Maximum value for timestamp to allow - default is up to ~2286-11-20; this allows catching ms timestamps
 * @returns {boolean}
 */
export function isUnixTimestamp(ts, { max = 9999999999 } = {}) {
  return Number.isInteger(ts) && ts >= 0 && ts <= max
}

/**
 * Add an amount of time to a time string.
 * @param {string} timeString HH:mm:ss or HH:mm; parsable numbers separated by :
 * @param {Object} $1
 * @param {number} $1.hours Hours to add to time string
 * @param {number} $1.minutes Minutes to add to time string
 * @returns {string} HH:mm:ss
 */
export function addTime(timeString, { minutes = 0, hours = 0 }) {
  let [hour, minute, second = 0] = timeString.split(":").map(Number)
  hour = mod(hour + hours, 24)
  minute += minutes
  while (minute >= 60) {
    hour = mod(hour + 1, 24)
    minute -= 60
  }
  while (minute < 0) {
    hour = mod(hour - 1, 24)
    minute += 60
  }
  const newTime = [hour, minute, second]
    .map((number) => `${number}`.padStart(2, "0"))
    .join(":")
  return newTime
}

/**
 * Adds a number of days to a date string.
 * @param {string} dateString
 * @param {number} days
 * @returns {string}
 */
export function addDays(dateString, days = 0) {
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
