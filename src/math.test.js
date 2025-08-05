import { describe, expect, it } from "@jest/globals"
const { mod, formatPlus, line, sum, average, variance } = await import("./math.js")

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

describe("line", () => {
  it("returns a function that produces y for given x on the line through two points", () => {
    const f = line([0, 0], [1, 1])
    expect(f(0)).toBe(0)
    expect(f(1)).toBe(1)
    expect(f(2)).toBe(2)
    expect(f(-1)).toBe(-1)
  })

  it("handles non-origin, non-unit slope", () => {
    const f = line([1, 2], [3, 6]) // slope 2, intercept 0
    expect(f(1)).toBe(2)
    expect(f(2)).toBe(4)
    expect(f(3)).toBe(6)
    expect(f(0)).toBe(0)
  })

  it("handles negative slope", () => {
    const f = line([0, 0], [2, -2]) // slope -1
    expect(f(1)).toBe(-1)
    expect(f(2)).toBe(-2)
    expect(f(-2)).toBe(2)
  })

  it("handles horizontal line", () => {
    const f = line([1, 5], [3, 5]) // slope 0
    expect(f(0)).toBe(5)
    expect(f(100)).toBe(5)
    expect(f(-100)).toBe(5)
  })

  it("handles vertical line by returning NaN", () => {
    const f = line([2, 1], [2, 5])
    expect(f(2)).toBeNaN()
    expect(f(3)).toBeNaN()
    expect(f(1)).toBeNaN()
  })

  it("works with negative coordinates", () => {
    const f = line([-1, -2], [1, 2]) // slope 2
    expect(f(-1)).toBe(-2)
    expect(f(0)).toBe(0)
    expect(f(1)).toBe(2)
  })
})

describe("sum", () => {
  it("returns 0 for an empty array", () => {
    expect(sum([])).toBe(0)
  })

  it("sums a simple array of numbers", () => {
    expect(sum([1, 2, 3])).toBe(6)
    expect(sum([-1, 1, 2])).toBe(2)
  })

  it("sums using a key function", () => {
    const arr = [{ v: 2 }, { v: 3 }, { v: 4 }]
    expect(sum(arr, { key: (el) => el.v })).toBe(9)
    expect(sum(arr, { key: (el, i) => el.v * i })).toBe(0 * 2 + 1 * 3 + 2 * 4) // 0 + 3 + 8 = 11
  })

  it("sums using a string key", () => {
    const arr = [{ v: 2 }, { v: 3 }, { v: 4 }]
    expect(sum(arr, { key: "v" })).toBe(9)
  })

  it("sums using a numeric key", () => {
    const arr = [[1], [2], [3]]
    expect(sum(arr, { key: 0 })).toBe(6)
  })

  it("handles array of numbers with undefined options", () => {
    expect(sum([5, 6, 7])).toBe(18)
    expect(sum([5, 6, 7], undefined)).toBe(18)
  })

  it("returns NaN if key is string/number and property is missing", () => {
    expect(sum([{ a: 1 }, {}], { key: "a" })).toBeNaN()
  })
})

describe("average", () => {
  it("computes the mean of a number array", () => {
    expect(average([1, 2, 3])).toBe(2)
    expect(average([1, 1, 1, 1])).toBe(1)
  })

  it("computes the mean using a key function", () => {
    const arr = [{ v: 2 }, { v: 4 }]
    expect(average(arr, { key: (el) => el.v })).toBe(3)
  })

  it("computes the mean using a string key", () => {
    const arr = [{ v: 2 }, { v: 4 }]
    expect(average(arr, { key: "v" })).toBe(3)
  })

  it("computes the mean using a numeric key", () => {
    const arr = [[2], [4]]
    expect(average(arr, { key: 0 })).toBe(3)
  })

  it("throws for empty array", () => {
    expect(() => average([])).toThrow("cannot compute average of empty array")
  })

  it("returns NaN if key is string/number and property is missing", () => {
    expect(average([{ a: 1 }, {}], { key: "a" })).toBeNaN()
  })
})

describe("variance", () => {
  it("computes the variance of a number array", () => {
    expect(variance([1, 2, 3])).toBeCloseTo(2 / 3)
    expect(variance([1, 1, 1, 1])).toBe(0)
  })

  it("computes the variance using a key function", () => {
    const arr = [{ v: 2 }, { v: 4 }]
    expect(variance(arr, { key: (el) => el.v })).toBe(1)
  })

  it("computes the variance using a string key", () => {
    const arr = [{ v: 2 }, { v: 4 }]
    expect(variance(arr, { key: "v" })).toBe(1)
  })

  it("computes the variance using a numeric key", () => {
    const arr = [[2], [4]]
    expect(variance(arr, { key: 0 })).toBe(1)
  })

  it("throws for empty array", () => {
    expect(() => variance([])).toThrow("cannot compute variance of empty array")
  })

  it("returns NaN if key is string/number and property is missing", () => {
    expect(variance([{ a: 1 }, {}], { key: "a" })).toBeNaN()
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
