import { mod } from "./math.js"

const myNow = () => new Date()

/**
 * A function that is called with no arguments and returns the "current date and time" via a Date instance: "now".
 * By default, the current date and time is given by the system.
 */
export let now = myNow

/**
 * Set a callback for "now". The callback will be called with no arguments and should return a Date instance.
 * This will be used by getEasternTime()/getLocalTime() functions instead of system time when needed.
 * This allows mocking the current date and time in non-testing environments.
 * @param {() => Date} callback
 */
export function setNow(callback) {
  if (typeof callback !== "function") {
    throw new Error("now must be a function")
  }
  now = callback
}

/**
 * Restore the callback for "now" to its original value.
 * getEasternTime()/getLocalTime() will subsequently use system time.
 */
export function resetNow() {
  now = myNow
}

/**
 * Gets various ways of representing the current time in EDT. Floors to nearest second by default.
 * @param {Object} $1
 * @param {number=} $1.timestamp Unix timestamp to use instead of now (in seconds).
 * @param {Date=} $1.dateInstance Alternative to specifying timestamp that is a Date instance.
 *  This can be used to specify UTC: `getEasternTime({ dateInstance: new Date(utc) })`.
 * @param {boolean=} $1.floorMinute If true, floors to the nearest minute. If false, floors to the nearest second (default).
 * @param {string=} $1.timeZone Time zone to use instead of Eastern time. A falsy, not-undefined value corresponds to local time.
 * @returns {Object} { timestamp, date: YYYY-MM-DD, time: HH:mm:ss }
 *  If invalid timestamp or dateInstance specified: { timestamp: NaN|Infinity, date: "Invalid date", time: undefined }
 */
export function getEasternTime({
  dateInstance = undefined,
  timestamp = (dateInstance ?? now()).getTime() / 1000,
  floorMinute = false,
  timeZone = "America/New_York",
} = {}) {
  if (floorMinute) {
    timestamp = Math.floor(timestamp / 60) * 60
  } else {
    timestamp = Math.floor(timestamp)
  }
  const flooredDateInstance = new Date(timestamp * 1000)
  // 'en-CA' (English - Canada) formats dates as YYYY-MM-DD and times in 24-hour format by default
  const string = flooredDateInstance.toLocaleString("en-CA", {
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
 * @param {number=} $1.timestamp Unix timestamp to use instead of now (in seconds).
 * @param {Date=} $1.dateInstance Alternative to specifying timestamp that is a Date instance.
 *  This can be used to specify UTC: `getEasternTime({ dateInstance: new Date(utc) })`.
 * @param {boolean=} $1.floorMinute If true, floors to the nearest minute. If false, floors to the nearest second.
 * @param {string=} $1.timeZone Time zone to use instead of local time. A falsy value corresponds to local time (default) .
 * @returns {Object} { timestamp, date: YYYY-MM-DD, time: HH:mm:ss }
 *  If invalid timestamp or dateInstance specified: { timestamp: NaN|Infinity, date: "Invalid date", time: undefined }
 */
export function getLocalTime({ timestamp, dateInstance, floorMinute, timeZone = false } = {}) {
  return getEasternTime({ timestamp, dateInstance, floorMinute, timeZone })
}

/**
 * Get Unix timestamp for a UTC date string.
 * @param {string} utc UTC date time: "YYYY-MM-DDTHH:mm:ssZ" or with UTC offset
 * @returns {number} Seconds since epoch
 */
export function getUnixTimestamp(utc) {
  if (typeof utc !== "string") {
    throw new Error("UTC date time is not a string")
  }
  const timestamp = Math.floor(new Date(utc).getTime() / 1000)
  return timestamp
}

/**
 * Get today's date in YYYY-MM-DD format using local time.
 * @returns {string}
 */
export function today() {
  return getLocalTime().date
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
 * @param {string} time HH:mm or HH:mm:ss
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
 * Checks if the string represents a valid HH:mm:ss time.
 * This will return false for times like "24:00:00".
 * Does not handle milliseconds.
 * @param {string} string
 * @returns {boolean}
 */
export function isTimeString(string) {
  return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/u.test(string)
}

/**
 * Checks if the string represents a valid date time string similar to YYYY-MM-DDTHH:mm:ss.
 * Does not handle milliseconds.
 * @param {string} string
 * @param {Object} $1
 * @param {string=} $1.separator Can specify a different string separator between date and time. Defaults to "T".
 * @returns {boolean}
 */
export function isDateTimeString(string, { separator = "T" } = {}) {
  const [date, time] = string.split(separator)
  return isDateString(date) && isTimeString(time)
}

/**
 * Checks if the string represents a valid UTC date time similar to YYYY-MM-DDTHH:mm:ssZ.
 * Does not handle milliseconds or UTC offsets.
 * @param {string} string
 * @returns {boolean}
 */
export function isUTCString(string) {
  if (!string.endsWith("Z")) {
    return false
  }
  const datetime = string.slice(0, string.length - 1)
  return isDateTimeString(datetime)
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

/**
 * Returns number of seconds from any combination of weeks, days, hours, and minutes.
 * @param {Object} $1
 * @param {number=} $1.weeks Default is 0
 * @param {number=} $1.days Default is 0
 * @param {number=} $1.hours Default is 0
 * @param {number=} $1.minutes Default is 0
 * @returns {number}
 */
export function convertToSeconds({ weeks = 0, days = 0, hours = 0, minutes = 0 }) {
  if (!(weeks >= 0) || !(days >= 0) || !(hours >= 0) || !(minutes >= 0)) {
    throw new Error("weeks, days, hours, and minutes must be nonnegative")
  }
  days += weeks * 7
  hours += days * 24
  minutes += hours * 60
  const seconds = minutes * 60
  return seconds
}
