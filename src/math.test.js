import { describe, expect, it } from "@jest/globals"
const { mod, formatPlus } = await import("./math.js")

describe("mod", () => {
  it("returns n when n is less than m and n is non-negative", () => {
    expect(mod(2, 3)).toBe(2)
    expect(mod(0, 5)).toBe(0)
  })

  it("wraps negative n into the [0, m) range", () => {
    expect(mod(-1, 3)).toBe(2)
    expect(mod(-4, 3)).toBe(2)
    expect(mod(-2, 5)).toBe(3)
  })

  it("returns 0 when n is a multiple of m", () => {
    expect(mod(6, 3)).toBe(0)
    expect(mod(-6, 3)).toBe(0)
  })

  it("handles n greater than m", () => {
    expect(mod(7, 3)).toBe(1)
    expect(mod(14, 5)).toBe(4)
  })

  it("handles m = 1 (should always return 0)", () => {
    expect(mod(0, 1)).toBe(0)
    expect(mod(5, 1)).toBe(0)
    expect(mod(-3, 1)).toBe(0)
  })

  it("returns NaN when m is 0", () => {
    expect(mod(5, 0)).toBeNaN()
    expect(mod(0, 0)).toBeNaN()
    expect(mod(-3, 0)).toBeNaN()
  })

  // All sign combinations for number and modulus
  it("handles all sign combinations for number and modulus", () => {
    // number > 0, modulus > 0
    expect(mod(5, 3)).toBe(2)
    // number > 0, modulus < 0
    expect(mod(5, -3)).toBe(-1)
    // number < 0, modulus > 0
    expect(mod(-5, 3)).toBe(1)
    // number < 0, modulus < 0
    expect(mod(-5, -3)).toBe(-2)
    // number = 0, modulus > 0
    expect(mod(0, 3)).toBe(0)
    // number = 0, modulus < 0
    expect(mod(0, -3)).toBe(-0)
    // number > 0, modulus = 0
    expect(mod(5, 0)).toBeNaN()
    // number < 0, modulus = 0
    expect(mod(-5, 0)).toBeNaN()
    // number = 0, modulus = 0
    expect(mod(0, 0)).toBeNaN()
  })
})

describe("formatPlus", () => {
  it("prepends a plus for positive numbers", () => {
    expect(formatPlus(1)).toBe("+1")
    expect(formatPlus(123.45)).toBe("+123.45")
  })

  it("does not prepend a plus for negative numbers", () => {
    expect(formatPlus(-1)).toBe("-1")
    expect(formatPlus(-123.45)).toBe("-123.45")
  })

  it("does not prepend a plus for zero by default", () => {
    expect(formatPlus(0)).toBe("0")
  })

  it("prepends a plus for zero if zero option is true", () => {
    expect(formatPlus(0, { zero: true })).toBe("+0")
  })

  it("handles undefined options argument", () => {
    expect(formatPlus(5)).toBe("+5")
    expect(formatPlus(-5)).toBe("-5")
    expect(formatPlus(0)).toBe("0")
  })

  // String input cases
  it("prepends a plus for positive string numbers", () => {
    expect(formatPlus("5")).toBe("+5")
    expect(formatPlus("123.45")).toBe("+123.45")
  })

  it("does not prepend a plus for negative string numbers", () => {
    expect(formatPlus("-5")).toBe("-5")
    expect(formatPlus("-123.45")).toBe("-123.45")
  })

  it("prepends a plus for string zero if zero option is true", () => {
    expect(formatPlus("0", { zero: true })).toBe("+0")
  })

  it("does not prepend a plus for string zero if zero option is false", () => {
    expect(formatPlus("0")).toBe("0")
  })

  it("returns undefined for non-number, non-string input", () => {
    expect(formatPlus(undefined)).toBeUndefined()
    // eslint-disable-next-line no-restricted-syntax
    expect(formatPlus(null)).toBeUndefined()
    expect(formatPlus({})).toBeUndefined()
    expect(formatPlus([])).toBeUndefined()
    expect(formatPlus(true)).toBeUndefined()
    expect(formatPlus(Symbol("x"))).toBeUndefined()
    expect(formatPlus(NaN)).toBeUndefined()
  })
})
