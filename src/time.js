import { mod } from "./math.js"

/**
 * Gets various ways of representing the current time in EDT. Floors to nearest second by default.
 * @param {Object} $1
 * @param {boolean=} $1.floorMinute If true, floors to the nearest minute. If false, floors to the nearest second.
 * @param {number=} $1.timestamp Unix timestamp to use instead of current time.
 * @param {string=} $1.timeZone Time zone to use instead of Eastern time. A falsy value corresponds to local time.
 * @returns {Object} { timestamp, date: YYYY-MM-DD, time: HH:mm:ss }
 */
export function getEasternTime({
  floorMinute = false,
  timestamp = undefined,
  timeZone = "America/New_York",
} = {}) {
  if (!timestamp) {
    timestamp = new Date().getTime() / 1000
  }
  timestamp = floorMinute ? Math.floor(timestamp / 60) * 60 : Math.floor(timestamp)
  // 'en-CA' (English - Canada) formats dates as YYYY-MM-DD and times in 24-hour format by default
  const string = new Date(timestamp * 1000).toLocaleString("en-CA", {
    ...(timeZone ? { timeZone } : {}),
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const [date, time] = string.split(", ")
  return { timestamp, date, time }
}

/**
 * Gets various ways of representing the current time in local timezone. Floors to nearest second by default.
 * @param {Object} $1
 * @param {boolean=} $1.floorMinute If true, floors to the nearest minute. If false, floors to the nearest second.
 * @param {number=} $1.timestamp Unix timestamp to use instead of current time.
 * @param {string=} $1.timeZone Time zone to use instead of local time. A falsy value (default) corresponds to local time.
 * @returns {Object} { timestamp, date, time, minute, datetime }
 */
export function getTime({ floorMinute, timestamp, timeZone = false } = {}) {
  return getEasternTime({ floorMinute, timestamp, timeZone })
}

/**
 * Get today's date in YYYY-MM-DD format.
 * @returns {string}
 */
export function today() {
  return getTime().date
}

/**
 * Get the day of the week index from a YYYY-MM-DD string.
 * @param {string=} string YYYY-MM-DD
 * @returns {string} 0, 1, 2, 3, 4, 5, 6; 0 is Sunday and, 1 is Monday, ... 6 is Saturday
 */
export function getDayIndexInWeek(string = today()) {
  const [year, month, day] = string.split("-").map(Number)
  const index = new Date(year, month - 1, day).getDay()
  if (isNaN(index)) {
    throw new Error(`invalid date: ${string}`)
  }
  return index
}

/**
 * Get the minute from a time string.
 * @param {string} time HH:mm or HH:mm::ss
 * @returns {number} Between 0 and 59 inclusive
 */
export function getMinute(time) {
  const minute = Number(time.split(":")[1])
  return minute
}

/**
 * Checks if the string represents a valid YYYY-MM-DD date.
 * This will return false for dates like "2024-02-31".
 * @param {string} string
 * @returns {boolean}
 */
export function isDateString(string) {
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
 * @deprecated Prefer isDateString()
 * @param {string} string
 * @returns {boolean}
 */
export function isDate(string) {
  return isDateString(string)
}

/**
 * Checks if the string represent a valid HH:mm:ss time.
 * @param {string} string
 * @returns {boolean}
 */
export function isTimeString(string) {
  return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/u.test(string)
}

/**
 * @deprecated Prefer isTimeString()
 * @param {string} string
 * @returns {boolean}
 */
export function isTime(string) {
  return isTimeString(string)
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
 * @param {string} timeString HH:mm:ss or HH:mm
 * @param {Object} $1
 * @param {number} $1.hours Hours to add to time string
 * @param {number} $1.minutes Minutes to add to time string
 * @returns {string} HH:mm:ss
 */
export function addTime(timeString, { minutes = 0, hours = 0 } = {}) {
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

const MINUTES_IN_DAY = 24 * 60
/**
 * Get all minutes between two times.
 * This does not work across day i.e 23:59:00 to 00:00:00.
 * @param {string} start HH:mm:ss or HH:mm
 * @param {string} end HH:mm:ss or HH:mm
 * @param {Object} $1
 * @param {number} $1.hours Hours to add to get next time in range. Default 0
 * @param {number} $1.minutes Minutes to add to get next time in range. Default 1
 * @returns {Array} times in HH:mm:ss
 */
export function getTimeRange(start, end, { hours = 0, minutes = 1 } = {}) {
  // coerce start and end to seconds
  start = addTime(start)
  end = addTime(end)
  const times = []
  let current = start
  while (current <= end) {
    times.push(current)
    current = addTime(current, { hours, minutes })
    if (times.length >= MINUTES_IN_DAY) {
      break
    }
  }
  return times
}

/**
 * Adds a number of days to a date string.
 * @param {string} dateString YYYY-MM-DD
 * @param {Object} $1
 * @param {number} $1.days
 * @returns {string}
 */
export function addDays(dateString, { days = 0 } = {}) {
  const [year, month, day] = dateString.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Get all dates between two dates, with limit.
 * @param {string} start YYYY-MM-DD
 * @param {string} end YYYY-MM-DD
 * @returns {Array}
 */
export function getDateRange(start, end, { limit = 1000 } = {}) {
  const dates = []
  while (start <= end) {
    dates.push(start)
    start = addDays(start, { days: 1 })
    if (dates.length >= limit) {
      break
    }
  }
  return dates
}

/**
 * Get the first date in the week containing the passed date string.
 * @param {string} dateString YYYY-MM-DD
 * @returns {string} YYYY-MM-DD
 */
export function getStartOfWeek(dateString) {
  const index = getDayIndexInWeek(dateString)
  const start = addDays(dateString, { days: -index })
  return start
}
