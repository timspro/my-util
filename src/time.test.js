import { describe, expect, test } from "@jest/globals"
import { getEasternTime } from "./time.js"

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
