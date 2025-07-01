import { describe, expect, test } from "@jest/globals"
import { addTime, getEasternTime, isDate, isTime, isUnixTimestamp } from "./time.js"

describe("getEasternTime", () => {
  test("returns correct structure and types", () => {
    const result = getEasternTime()
    expect(typeof result.timestamp).toBe("number")
    expect(typeof result.date).toBe("string")
    expect(typeof result.time).toBe("string")
    expect(typeof result.minute).toBe("number")
    expect(typeof result.datetime).toBe("string")
  })

  test("floors to minute if floorMinute is true", () => {
    const r1 = getEasternTime()
    const r2 = getEasternTime({ floorMinute: true })
    expect(r2.timestamp % 60).toBe(0)
    expect(r2.timestamp).toBeLessThanOrEqual(r1.timestamp)
  })

  test("adds days offset", () => {
    const today = getEasternTime()
    const tomorrow = getEasternTime({ days: 1 })
    const [y, m, d] = today.date.split("-").map(Number)
    const [y2, m2, d2] = tomorrow.date.split("-").map(Number)
    expect(new Date(y2, m2 - 1, d2).getTime() - new Date(y, m - 1, d).getTime()).toBeCloseTo(
      24 * 60 * 60 * 1000,
      -2
    )
  })

  test("returns correct format for different days and floorMinute", () => {
    const base = getEasternTime()
    const plus2 = getEasternTime({ days: 2, floorMinute: true })
    expect(plus2.date).not.toEqual(base.date)
    expect(plus2.timestamp % 60).toBe(0)
  })

  // The following test ensures all code paths are covered, including when days=0 and floorMinute=false (the defaults).
  test("default parameters yield consistent output", () => {
    const def = getEasternTime()
    const explicit = getEasternTime({ days: 0, floorMinute: false })
    expect(def.date).toEqual(explicit.date)
    expect(def.time).toEqual(explicit.time)
    expect(def.timestamp).toEqual(explicit.timestamp)
    expect(def.datetime).toEqual(explicit.datetime)
  })
})

describe("isDate", () => {
  test("returns true for valid YYYY-MM-DD dates", () => {
    expect(isDate("2024-06-01")).toBe(true)
    expect(isDate("1999-12-31")).toBe(true)
  })

  test("returns false for invalid dates (e.g., 2024-02-31)", () => {
    expect(isDate("2024-02-31")).toBe(false)
    expect(isDate("2023-04-31")).toBe(false)
  })

  test("returns false for invalid formats", () => {
    expect(isDate("2024/06/01")).toBe(false)
    expect(isDate("06-01-2024")).toBe(false)
    expect(isDate("2024-6-1")).toBe(false)
    expect(isDate("20240601")).toBe(false)
    expect(isDate("abcd-ef-gh")).toBe(false)
  })

  test("returns false for impossible months and days", () => {
    expect(isDate("2024-00-10")).toBe(false)
    expect(isDate("2024-13-10")).toBe(false)
    expect(isDate("2024-01-00")).toBe(false)
    expect(isDate("2024-01-32")).toBe(false)
  })

  test("returns true for leap day", () => {
    expect(isDate("2024-02-29")).toBe(true)
    expect(isDate("2023-02-29")).toBe(false)
  })
})

describe("isTime", () => {
  test("returns true for valid HH:mm:ss times", () => {
    expect(isTime("00:00:00")).toBe(true)
    expect(isTime("23:59:59")).toBe(true)
    expect(isTime("12:34:56")).toBe(true)
  })

  test("returns false for invalid times", () => {
    expect(isTime("24:00:00")).toBe(false)
    expect(isTime("12:60:00")).toBe(false)
    expect(isTime("12:00:60")).toBe(false)
    expect(isTime("1:00:00")).toBe(false)
    expect(isTime("12:0:00")).toBe(false)
    expect(isTime("12:00:0")).toBe(false)
    expect(isTime("12:00")).toBe(false)
    expect(isTime("120000")).toBe(false)
    expect(isTime("ab:cd:ef")).toBe(false)
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

  // Edge case: negative minutes that require multiple hour underflows
  test("handles large negative minutes", () => {
    expect(addTime("05:10:00", { minutes: -130 })).toBe("03:00:00")
  })

  // Edge case: large positive minutes that require multiple hour rollovers
  test("handles large positive minutes", () => {
    expect(addTime("05:10:00", { minutes: 130 })).toBe("07:20:00")
  })

  // Edge case: input with seconds omitted
  test("handles input with no seconds", () => {
    expect(addTime("12:34", { minutes: 0 })).toBe("12:34:00")
  })

  // Edge case: input with all zeros
  test("handles midnight", () => {
    expect(addTime("00:00:00", { hours: 0, minutes: 0 })).toBe("00:00:00")
  })
})
