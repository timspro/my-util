import { afterEach, describe, expect, test } from "@jest/globals"
import {
  addDays,
  addTime,
  convertToSeconds,
  getDateRange,
  getDayIndexInWeek,
  getEasternTime,
  getLocalTime,
  getMinute,
  getStartOfWeek,
  getTimeRange,
  getUnixTimestamp,
  isDateString,
  isDateTimeString,
  isTimeString,
  isUTCString,
  isUnixTimestamp,
  now,
  resetNow,
  setNow,
  today,
} from "./time.js"

// Exported functions and variables:
// now, setNow, resetNow, getEasternTime, getLocalTime, getUnixTimestamp, today, getDayIndexInWeek, getMinute,
// isDateString, isTimeString, isDateTimeString, isUTCString, isUnixTimestamp,
// addTime, getTimeRange, addDays, getDateRange, getStartOfWeek, convertToSeconds

afterEach(() => {
  // Ensure we don't leak a mocked now() into other tests
  resetNow()
})

describe("now/setNow/resetNow", () => {
  test("getEasternTime uses the injected now() when timestamp/dateInstance are not provided", () => {
    const fixed = new Date("2024-01-02T03:04:05.678Z")
    setNow(() => fixed)
    const r = getEasternTime({ timeZone: "UTC" })
    expect(r.date).toBe("2024-01-02")
    expect(r.time).toBe("03:04:05")
  })

  test("setNow validates that the callback is a function", () => {
    expect(() => setNow(123)).toThrow("now must be a function")
    expect(() => setNow(null)).toThrow("now must be a function")
  })

  test("resetNow restores now() to system time source", () => {
    setNow(() => new Date("1999-12-31T23:59:59.999Z"))
    resetNow()
    const t = now()
    expect(t).toBeInstanceOf(Date)
    // Allow a small delta from system clock
    expect(Math.abs(t.getTime() - Date.now())).toBeLessThan(10)
  })
})

describe("getEasternTime", () => {
  test("returns correct structure and types", () => {
    const result = getEasternTime()
    expect(typeof result.timestamp).toBe("number")
    expect(typeof result.date).toBe("string")
    expect(typeof result.time).toBe("string")
    expect(result).not.toHaveProperty("minute")
    expect(result).not.toHaveProperty("datetime")
  })

  test("floors to minute if floorMinute is true", () => {
    const r1 = getEasternTime()
    const r2 = getEasternTime({ floorMinute: true })
    expect(r2.timestamp % 60).toBe(0)
    expect(r2.timestamp).toBeLessThanOrEqual(r1.timestamp)
  })

  test("uses provided timestamp and floors correctly", () => {
    // 2024-06-01T12:34:56Z (UTC) = 1717245296
    // EDT is UTC-4, so local time should be 08:34:56
    const ts = 1717245296
    const result = getEasternTime({ timestamp: ts })
    expect(result.timestamp).toBe(ts)
    expect(result.time.startsWith("08:34")).toBe(true)
    // floorMinute should zero out seconds
    const floored = getEasternTime({ timestamp: ts, floorMinute: true })
    expect(floored.timestamp % 60).toBe(0)
    expect(floored.time.endsWith(":00")).toBe(true)
  })

  test("accepts dateInstance and matches equivalent timestamp", () => {
    const ts = 1717245296 // 2024-06-01T12:34:56Z
    const di = new Date(ts * 1000)
    const a = getEasternTime({ dateInstance: di, timeZone: "UTC" })
    const b = getEasternTime({ timestamp: ts, timeZone: "UTC" })
    expect(a).toEqual(b)
  })

  test("dateInstance path respects floorMinute", () => {
    const ts = 1717245296 // ...:56
    const di = new Date(ts * 1000)
    const floored = getEasternTime({ dateInstance: di, floorMinute: true, timeZone: "UTC" })
    expect(floored.timestamp % 60).toBe(0)
    expect(floored.time).toBe("12:34:00")
  })

  test("default parameters yield consistent output", () => {
    const def = getEasternTime()
    const explicit = getEasternTime({ floorMinute: false })
    expect(def.date).toEqual(explicit.date)
    expect(def.time).toEqual(explicit.time)
    expect(def.timestamp).toEqual(explicit.timestamp)
  })

  test("respects timeZone parameter", () => {
    // 2024-06-01T12:34:56Z (UTC)
    const ts = 1717245296
    // New York (EDT, UTC-4)
    const eastern = getEasternTime({ timestamp: ts, timeZone: "America/New_York" })
    // Los Angeles (PDT, UTC-7)
    const pacific = getEasternTime({ timestamp: ts, timeZone: "America/Los_Angeles" })
    // UTC
    const utc = getEasternTime({ timestamp: ts, timeZone: "UTC" })
    expect(eastern.time).not.toBe(pacific.time)
    expect(eastern.time).not.toBe(utc.time)
    expect(pacific.time).not.toBe(utc.time)
    expect(eastern.time.startsWith("08:34")).toBe(true) // EDT
    expect(pacific.time.startsWith("05:34")).toBe(true) // PDT
    expect(utc.time.startsWith("12:34")).toBe(true) // UTC
  })

  test("returns local time if timeZone is empty string", () => {
    // If timeZone is falsy (""), should use local time zone
    // We'll compare to Date.toLocaleString with no timeZone option
    const ts = 1717245296
    const local = getEasternTime({ timestamp: ts, timeZone: "" })
    const expected = new Date(ts * 1000).toLocaleString("en-US", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const [, time] = expected.split(", ")
    const [month, day, year] = expected.split(", ")[0].split("/")
    const date = [year, month, day].join("-")
    expect(local.date).toBe(date)
    expect(local.time).toBe(time)
  })

  test("handles DST start (spring forward) correctly", () => {
    // In 2024, DST starts in US/Eastern at 2024-03-10 02:00:00 local time (clocks jump to 03:00:00)
    // 2024-03-10T06:59:59Z = 1:59:59 EST (should be 01:59:59)
    let ts = Date.UTC(2024, 2, 10, 6, 59, 59) / 1000
    let r = getEasternTime({ timestamp: ts })
    expect(r.date).toBe("2024-03-10")
    expect(r.time).toBe("01:59:59")
    // 2024-03-10T07:00:00Z = 3:00:00 EDT (should be 03:00:00)
    ts = Date.UTC(2024, 2, 10, 7, 0, 0) / 1000
    r = getEasternTime({ timestamp: ts })
    expect(r.date).toBe("2024-03-10")
    expect(r.time).toBe("03:00:00")
  })

  test("handles DST end (fall back) correctly", () => {
    // In 2024, DST ends in US/Eastern at 2024-11-03 02:00:00 local time (clocks go back to 01:00:00)
    // 2024-11-03T05:59:59Z = 01:59:59 EDT (should be 01:59:59)
    let ts = Date.UTC(2024, 10, 3, 5, 59, 59) / 1000
    let r = getEasternTime({ timestamp: ts })
    expect(r.date).toBe("2024-11-03")
    expect(r.time).toBe("01:59:59")
    // 2024-11-03T06:00:00Z = 01:00:00 EST (should be 01:00:00)
    ts = Date.UTC(2024, 10, 3, 6, 0, 0) / 1000
    r = getEasternTime({ timestamp: ts })
    expect(r.date).toBe("2024-11-03")
    expect(r.time).toBe("01:00:00")
    // 2024-11-03T06:59:59Z = 01:59:59 EST (should be 01:59:59)
    ts = Date.UTC(2024, 10, 3, 6, 59, 59) / 1000
    r = getEasternTime({ timestamp: ts })
    expect(r.date).toBe("2024-11-03")
    expect(r.time).toBe("01:59:59")
    // 2024-11-03T07:00:00Z = 02:00:00 EST (should be 02:00:00)
    ts = Date.UTC(2024, 10, 3, 7, 0, 0) / 1000
    r = getEasternTime({ timestamp: ts })
    expect(r.date).toBe("2024-11-03")
    expect(r.time).toBe("02:00:00")
  })
})

describe("getLocalTime", () => {
  test("returns same structure as getEasternTime", () => {
    const result = getLocalTime({})
    expect(typeof result.timestamp).toBe("number")
    expect(typeof result.date).toBe("string")
    expect(typeof result.time).toBe("string")
    expect(result).not.toHaveProperty("minute")
    expect(result).not.toHaveProperty("datetime")
  })

  test("defaults to local time if timeZone is not provided", () => {
    // getLocalTime({}) should use timeZone = false, which disables the timeZone option and uses local
    const ts = 1717245296
    const local = getLocalTime({ timestamp: ts })
    const expected = new Date(ts * 1000).toLocaleString("en-US", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const [, time] = expected.split(", ")
    const [month, day, year] = expected.split(", ")[0].split("/")
    const date = [year, month, day].join("-")
    expect(local.date).toBe(date)
    expect(local.time).toBe(time)
  })

  test("passes timeZone through to getEasternTime", () => {
    // Should match getEasternTime with same timeZone
    const ts = 1717245296
    const pacific = getLocalTime({ timestamp: ts, timeZone: "America/Los_Angeles" })
    const ref = getEasternTime({ timestamp: ts, timeZone: "America/Los_Angeles" })
    expect(pacific).toEqual(ref)
  })

  test("accepts dateInstance and matches equivalent timestamp", () => {
    const ts = 1717245296
    const di = new Date(ts * 1000)
    const a = getLocalTime({ dateInstance: di, timeZone: "UTC" })
    const b = getLocalTime({ timestamp: ts, timeZone: "UTC" })
    expect(a).toEqual(b)
  })

  test("floors to minute if floorMinute is true", () => {
    const ts = 1717245296
    const floored = getLocalTime({ timestamp: ts, floorMinute: true })
    expect(floored.timestamp % 60).toBe(0)
    expect(floored.time.endsWith(":00")).toBe(true)
  })
})

describe("getUnixTimestamp", () => {
  test("throws on invalid input", () => {
    expect(() => getUnixTimestamp()).toThrow("UTC date time is not a string")
    expect(() => getUnixTimestamp(1717245296000)).toThrow("UTC date time is not a string")
    expect(() => getUnixTimestamp(new Date())).toThrow("UTC date time is not a string")
  })

  test("parses Zulu (UTC) timestamp", () => {
    expect(getUnixTimestamp("2024-06-01T12:34:56Z")).toBe(1717245296)
  })

  test("parses timestamp with positive offset", () => {
    const expected = Date.UTC(2024, 5, 1, 10, 34, 56) / 1000 // 12:34:56+02:00 == 10:34:56Z
    expect(getUnixTimestamp("2024-06-01T12:34:56+02:00")).toBe(expected)
  })

  test("floors fractional seconds", () => {
    // 999ms floors down to the same second
    expect(getUnixTimestamp("1970-01-01T00:00:00.999Z")).toBe(0)
  })

  test("returns NaN for invalid date string", () => {
    expect(Number.isNaN(getUnixTimestamp("not-a-date"))).toBe(true)
  })
})

describe("today", () => {
  test("returns today's date in YYYY-MM-DD format", () => {
    const expected = getLocalTime().date
    expect(today()).toBe(expected)
    expect(/^\d{4}-\d{2}-\d{2}$/u.test(today())).toBe(true)
  })
})

describe("getDayIndexInWeek", () => {
  test("returns correct index for known dates", () => {
    expect(getDayIndexInWeek("2024-06-02")).toBe(0)
    expect(getDayIndexInWeek("2024-06-03")).toBe(1)
    expect(getDayIndexInWeek("2024-06-04")).toBe(2)
    expect(getDayIndexInWeek("2024-06-05")).toBe(3)
    expect(getDayIndexInWeek("2024-06-06")).toBe(4)
    expect(getDayIndexInWeek("2024-06-07")).toBe(5)
    expect(getDayIndexInWeek("2024-06-08")).toBe(6)
  })

  test("returns correct index for leap day", () => {
    // 2024-02-29 is Thursday (4)
    expect(getDayIndexInWeek("2024-02-29")).toBe(4)
  })

  test("defaults to today() if no argument is given", () => {
    const todayDate = today()
    expect(getDayIndexInWeek()).toBe(getDayIndexInWeek(todayDate))
  })

  test("throws on invalid date strings", () => {
    expect(() => getDayIndexInWeek("not-a-date")).toThrow(/invalid date/u)
    // don't worry about bad dates like the following; can be caught with isDateString()
    expect(getDayIndexInWeek("2024-02-31")).toBe(6)
  })
})

describe("getMinute", () => {
  test("extracts minute from HH:mm:ss", () => {
    expect(getMinute("12:34:56")).toBe(34)
    expect(getMinute("00:01:00")).toBe(1)
    expect(getMinute("23:59:59")).toBe(59)
  })

  test("extracts minute from HH:mm", () => {
    expect(getMinute("12:34")).toBe(34)
    expect(getMinute("00:01")).toBe(1)
    expect(getMinute("23:59")).toBe(59)
  })

  test("handles single-digit minutes", () => {
    expect(getMinute("12:07:00")).toBe(7)
    expect(getMinute("12:7:00")).toBe(7)
    expect(getMinute("12:7")).toBe(7)
  })
})

describe("isDateString", () => {
  test("validates correct dates", () => {
    expect(isDateString("2024-06-01")).toBe(true)
    expect(isDateString("1999-12-31")).toBe(true)
  })

  test("rejects invalid dates and formats", () => {
    expect(isDateString("2024-02-31")).toBe(false)
    expect(isDateString("2024/06/01")).toBe(false)
  })
})

describe("isTimeString", () => {
  test("validates correct times", () => {
    expect(isTimeString("00:00:00")).toBe(true)
    expect(isTimeString("23:59:59")).toBe(true)
  })

  test("rejects invalid times and formats", () => {
    expect(isTimeString("24:00:00")).toBe(false)
    expect(isTimeString("12:34")).toBe(false)
  })
})

describe("isDateTimeString", () => {
  test("valid with default T separator", () => {
    expect(isDateTimeString("2024-06-01T12:34:56")).toBe(true)
  })

  test("rejects invalid combinations", () => {
    expect(isDateTimeString("2024-06-01T12:34")).toBe(false) // missing seconds
    expect(isDateTimeString("2024-06-01T24:00:00")).toBe(false) // invalid hour
    expect(isDateTimeString("2024-02-31T12:00:00")).toBe(false) // invalid date
    expect(isDateTimeString("2024-06-01 12:34:56")).toBe(false) // wrong separator
  })

  test("supports custom separator", () => {
    expect(isDateTimeString("2024-06-01 12:34:56", { separator: " " })).toBe(true)
    expect(isDateTimeString("2024-06-01T12:34:56", { separator: " " })).toBe(false)
  })
})

describe("isUTCString", () => {
  test("validates proper Zulu UTC format", () => {
    expect(isUTCString("2024-06-01T12:34:56Z")).toBe(true)
  })

  test("rejects strings without trailing Z", () => {
    expect(isUTCString("2024-06-01T12:34:56")).toBe(false)
  })

  test("rejects invalid time/date and unsupported variants", () => {
    expect(isUTCString("2024-06-01T24:00:00Z")).toBe(false) // invalid hour
    expect(isUTCString("2024-02-31T12:00:00Z")).toBe(false) // invalid date
    expect(isUTCString("2024-06-01T12:34:56+00:00")).toBe(false) // offset not supported
    expect(isUTCString("2024-06-01T12:34:56.123Z")).toBe(false) // milliseconds not supported
    expect(isUTCString("2024-06-01 12:34:56Z")).toBe(false) // wrong separator
  })
})

describe("isUnixTimestamp", () => {
  test("returns true for valid unix timestamps in seconds", () => {
    expect(isUnixTimestamp(0)).toBe(true)
    expect(isUnixTimestamp(1700000000)).toBe(true)
    expect(isUnixTimestamp(9999999999)).toBe(true)
  })

  test("returns false for negative or non-integer or too large values", () => {
    expect(isUnixTimestamp(-1)).toBe(false)
    expect(isUnixTimestamp(1.5)).toBe(false)
    expect(isUnixTimestamp(10000000000)).toBe(false)
    expect(isUnixTimestamp(NaN)).toBe(false)
    expect(isUnixTimestamp(Infinity)).toBe(false)
  })

  test("respects custom max option", () => {
    expect(isUnixTimestamp(100, { max: 50 })).toBe(false)
    expect(isUnixTimestamp(50, { max: 50 })).toBe(true)
    expect(isUnixTimestamp(51, { max: 50 })).toBe(false)
  })
})

describe("addTime", () => {
  test("adds minutes within the same hour", () => {
    expect(addTime("12:30:00", { minutes: 15 })).toBe("12:45:00")
    expect(addTime("12:30", { minutes: 15 })).toBe("12:45:00")
  })

  test("adds minutes with hour rollover", () => {
    expect(addTime("12:50:00", { minutes: 15 })).toBe("13:05:00")
    expect(addTime("23:50:00", { minutes: 15 })).toBe("00:05:00")
  })

  test("subtracts minutes with hour underflow", () => {
    expect(addTime("12:10:00", { minutes: -15 })).toBe("11:55:00")
    expect(addTime("00:10:00", { minutes: -15 })).toBe("23:55:00")
  })

  test("adds hours with 24-hour rollover", () => {
    expect(addTime("22:15:00", { hours: 3 })).toBe("01:15:00")
    expect(addTime("00:00:00", { hours: 24 })).toBe("00:00:00")
    expect(addTime("23:59:59", { hours: 1 })).toBe("00:59:59")
  })

  test("subtracts hours with 24-hour underflow", () => {
    expect(addTime("01:15:00", { hours: -3 })).toBe("22:15:00")
    expect(addTime("00:00:00", { hours: -24 })).toBe("00:00:00")
    expect(addTime("00:59:59", { hours: -1 })).toBe("23:59:59")
  })

  test("handles both hours and minutes together", () => {
    expect(addTime("22:30:00", { hours: 2, minutes: 45 })).toBe("01:15:00")
    expect(addTime("01:15:00", { hours: -2, minutes: -30 })).toBe("22:45:00")
  })

  test("pads single digit hours, minutes, seconds", () => {
    expect(addTime("1:2:3", { hours: 0, minutes: 0 })).toBe("01:02:03")
    expect(addTime("9:8", { hours: 0, minutes: 0 })).toBe("09:08:00")
  })

  test("handles large negative minutes", () => {
    expect(addTime("05:10:00", { minutes: -130 })).toBe("03:00:00")
  })

  test("handles large positive minutes", () => {
    expect(addTime("05:10:00", { minutes: 130 })).toBe("07:20:00")
  })

  test("handles input with no seconds", () => {
    expect(addTime("12:34", { minutes: 0 })).toBe("12:34:00")
  })

  test("handles midnight", () => {
    expect(addTime("00:00:00", { hours: 0, minutes: 0 })).toBe("00:00:00")
  })

  test("handles missing options argument (all defaults)", () => {
    expect(addTime("12:34:56")).toBe("12:34:56")
    expect(addTime("05:10")).toBe("05:10:00")
  })
})

describe("getTimeRange", () => {
  test("returns all minutes between start and end inclusive", () => {
    expect(getTimeRange("12:00:00", "12:03:00")).toEqual([
      "12:00:00",
      "12:01:00",
      "12:02:00",
      "12:03:00",
    ])
  })

  test("works with times that cross the hour", () => {
    expect(getTimeRange("12:58:00", "13:01:00")).toEqual([
      "12:58:00",
      "12:59:00",
      "13:00:00",
      "13:01:00",
    ])
  })

  test("works with times with nonzero seconds", () => {
    expect(getTimeRange("12:00:30", "12:02:30")).toEqual(["12:00:30", "12:01:30", "12:02:30"])
  })

  test("returns single element if start equals end", () => {
    expect(getTimeRange("12:34:56", "12:34:56")).toEqual(["12:34:56"])
  })

  test("handles if start is greater or equal to end", () => {
    expect(getTimeRange("12:04:00", "12:03:00")).toEqual([])
    expect(getTimeRange("12:00:00", "12:00:00")).toEqual(["12:00:00"])
  })

  test("handles input with no seconds", () => {
    expect(getTimeRange("12:00", "12:02")).toEqual(["12:00:00", "12:01:00", "12:02:00"])
  })

  // ISSUE: getTimeRange allows a zero step, which would otherwise loop forever; it's capped internally at 1440 iterations.
  test("caps the number of results at MINUTES_IN_DAY when step is zero", () => {
    const result = getTimeRange("12:00:00", "12:00:00", { hours: 0, minutes: 0 })
    expect(result.length).toBe(24 * 60)
    expect(result[0]).toBe("12:00:00")
    expect(result[result.length - 1]).toBe("12:00:00")
  })
})

describe("addDays", () => {
  test("adds days within the same month (object param)", () => {
    expect(addDays("2024-06-01", { days: 5 })).toBe("2024-06-06")
    expect(addDays("2024-06-10", { days: 0 })).toBe("2024-06-10")
  })

  test("adds days with month rollover (object param)", () => {
    expect(addDays("2024-06-28", { days: 5 })).toBe("2024-07-03")
  })

  test("adds days with year rollover (object param)", () => {
    expect(addDays("2024-12-30", { days: 5 })).toBe("2025-01-04")
  })

  test("subtracts days (object param)", () => {
    expect(addDays("2024-06-10", { days: -10 })).toBe("2024-05-31")
  })

  test("handles leap years (object param)", () => {
    expect(addDays("2024-02-28", { days: 1 })).toBe("2024-02-29")
    expect(addDays("2024-02-28", { days: 2 })).toBe("2024-03-01")
    expect(addDays("2023-02-28", { days: 1 })).toBe("2023-03-01")
  })

  test("handles negative result across year boundary (object param)", () => {
    expect(addDays("2024-01-01", { days: -1 })).toBe("2023-12-31")
  })

  test("adds days across DST start (spring forward) (object param)", () => {
    expect(addDays("2024-03-09", { days: 1 })).toBe("2024-03-10")
    expect(addDays("2024-03-09", { days: 2 })).toBe("2024-03-11")
    expect(addDays("2024-03-10", { days: -1 })).toBe("2024-03-09")
  })

  test("adds days across DST end (fall back) (object param)", () => {
    expect(addDays("2024-11-02", { days: 1 })).toBe("2024-11-03")
    expect(addDays("2024-11-02", { days: 2 })).toBe("2024-11-04")
    expect(addDays("2024-11-03", { days: -1 })).toBe("2024-11-02")
  })

  test("accepts missing options argument (defaults to days = 0)", () => {
    expect(addDays("2024-06-10")).toBe("2024-06-10")
  })
})

describe("getDateRange", () => {
  test("returns all dates between start and end inclusive", () => {
    expect(getDateRange("2024-06-01", "2024-06-03")).toEqual([
      "2024-06-01",
      "2024-06-02",
      "2024-06-03",
    ])
  })

  test("returns just the start date if start equals end", () => {
    expect(getDateRange("2024-06-01", "2024-06-01")).toEqual(["2024-06-01"])
  })

  test("returns empty array if start > end", () => {
    expect(getDateRange("2024-06-03", "2024-06-01")).toEqual([])
  })

  test("respects limit option", () => {
    expect(getDateRange("2024-06-01", "2024-06-10", { limit: 3 })).toEqual([
      "2024-06-01",
      "2024-06-02",
      "2024-06-03",
    ])
  })

  test("returns at most 1000 dates by default", () => {
    const dates = getDateRange("2020-01-01", "2025-01-01")
    expect(dates.length).toBeLessThanOrEqual(1000)
    expect(dates[0]).toBe("2020-01-01")
  })

  test("can return more than 1000 dates if limit is raised", () => {
    const dates = getDateRange("2020-01-01", "2025-01-01", { limit: 2000 })
    expect(dates.length).toBeGreaterThan(1000)
    expect(dates[0]).toBe("2020-01-01")
    expect(dates[dates.length - 1]).toBe("2025-01-01")
  })

  // ISSUE: getDateRange does not validate that start/end are valid dates, so invalid input may yield unexpected results.
  test("handles invalid date input (returns empty array if start > end lexically)", () => {
    expect(getDateRange("not-a-date", "2024-01-01")).toEqual([])
  })
})

describe("getStartOfWeek", () => {
  test("returns same date if input is Sunday", () => {
    expect(getStartOfWeek("2024-06-02")).toBe("2024-06-02") // Sunday
    expect(getDayIndexInWeek("2024-06-02")).toBe(0)
  })

  test("returns previous Sunday for a weekday", () => {
    expect(getStartOfWeek("2024-06-05")).toBe("2024-06-02") // Wednesday -> previous Sunday
    expect(getStartOfWeek("2024-06-03")).toBe("2024-06-02") // Monday -> previous Sunday
    expect(getStartOfWeek("2024-06-08")).toBe("2024-06-02") // Saturday -> previous Sunday
  })

  test("works for leap day", () => {
    // 2024-02-29 is Thursday (4), so start of week should be 2024-02-25
    expect(getStartOfWeek("2024-02-29")).toBe("2024-02-25")
  })

  test("works for year boundary", () => {
    // 2023-01-01 is Sunday
    expect(getStartOfWeek("2023-01-01")).toBe("2023-01-01")
    // 2023-01-07 is Saturday, so start of week is 2023-01-01
    expect(getStartOfWeek("2023-01-07")).toBe("2023-01-01")
    // 2023-01-02 is Monday, so start of week is 2023-01-01
    expect(getStartOfWeek("2023-01-02")).toBe("2023-01-01")
  })
})

describe("convertToSeconds", () => {
  test("returns 0 for empty input object", () => {
    expect(convertToSeconds({})).toBe(0)
  })

  test("converts single units correctly", () => {
    expect(convertToSeconds({ minutes: 5 })).toBe(5 * 60)
    expect(convertToSeconds({ hours: 2 })).toBe(2 * 3600)
    expect(convertToSeconds({ days: 1 })).toBe(24 * 3600)
    expect(convertToSeconds({ weeks: 1 })).toBe(7 * 24 * 3600)
  })

  test("converts combined weeks, days, hours, and minutes", () => {
    // 1w + 2d + 3h + 4m = 788640 seconds
    expect(convertToSeconds({ weeks: 1, days: 2, hours: 3, minutes: 4 })).toBe(788640)
  })

  test("supports fractional values (minutes: 0.5 => 30 seconds)", () => {
    expect(convertToSeconds({ minutes: 0.5 })).toBe(30)
  })

  test("throws if any value is negative", () => {
    const cases = [{ weeks: -1 }, { days: -1 }, { hours: -1 }, { minutes: -1 }]
    for (const opts of cases) {
      expect(() => convertToSeconds(opts)).toThrow("must be nonnegative")
    }
  })
})
