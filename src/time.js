/**
 * Gets various ways of representing the current time in EDT. Floors to nearest second by default.
 * @param {Object} $1
 * @param {number} $1.days An offset in days to the current time
 * @param {boolean} $1.floorMinute If true, floors to the nearest minute. If false, floors to the nearest second.
 * @returns {Object} { timestamp, date, time, minute, datetime }
 */
export function getEasternTime({ days = 0, floorMinute = false } = {}) {
  const now = new Date()
  if (days) {
    now.setDate(now.getDate() + days)
  }
  const timestamp = floorMinute
    ? Math.floor(now.getTime() / 1000 / 60) * 60
    : Math.floor(now.getTime() / 1000)
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
