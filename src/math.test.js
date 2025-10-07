import { describe, expect, it } from "@jest/globals"
// ISSUE: range JSDoc uses "step" but implementation uses "increment". These should be consistent.
const { mod, formatPlus, line, sum, average, variance, range, isNumber, deciles } =
  await import("./math.js")

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
    expect(formatPlus(null)).toBeUndefined()
    expect(formatPlus({})).toBeUndefined()
    expect(formatPlus([])).toBeUndefined()
    expect(formatPlus(true)).toBeUndefined()
    expect(formatPlus(Symbol("x"))).toBeUndefined()
    expect(formatPlus(NaN)).toBeUndefined()
  })
})

describe("range", () => {
  it("returns an empty array if start >= end", () => {
    expect(range(5, 5)).toEqual([])
    expect(range(10, 5)).toEqual([])
  })

  it("returns a sequence from start to end-1 with default increment 1", () => {
    expect(range(0, 3)).toEqual([0, 1, 2])
    expect(range(2, 6)).toEqual([2, 3, 4, 5])
  })

  it("returns a sequence with a custom positive increment", () => {
    expect(range(0, 5, 2)).toEqual([0, 2, 4])
    expect(range(1, 8, 3)).toEqual([1, 4, 7])
  })
  it("works with negative start and end", () => {
    expect(range(-3, 1)).toEqual([-3, -2, -1, 0])
    expect(range(-5, -2)).toEqual([-5, -4, -3])
  })

  it("returns an empty array if increment is zero", () => {
    expect(range(0, 5, 0)).toEqual([])
  })

  it("returns an empty array if increment is negative and start < end", () => {
    expect(range(0, 5, -1)).toEqual([])
    expect(range(2, 6, -2)).toEqual([])
  })

  it("returns an empty array if increment is negative and start > end", () => {
    expect(range(5, 0, -1)).toEqual([])
    expect(range(3, -2, -2)).toEqual([])
  })

  it("returns an empty array if increment is positive and start > end", () => {
    expect(range(5, 0, 1)).toEqual([])
    expect(range(2, -2, 2)).toEqual([])
  })

  it("handles floating point increments", () => {
    expect(range(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75])
  })
})

describe("isNumber", () => {
  it("returns true for finite numbers", () => {
    expect(isNumber(0)).toBe(true)
    expect(isNumber(42)).toBe(true)
    expect(isNumber(-3.14)).toBe(true)
    expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true)
    expect(isNumber(Number.MIN_SAFE_INTEGER)).toBe(true)
  })

  it("returns false for Infinity and -Infinity", () => {
    expect(isNumber(Infinity)).toBe(false)
    expect(isNumber(-Infinity)).toBe(false)
  })

  it("returns false for NaN", () => {
    expect(isNumber(NaN)).toBe(false)
  })

  it("returns false for non-number types", () => {
    expect(isNumber("123")).toBe(false)
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber(null)).toBe(false)
    expect(isNumber({})).toBe(false)
    expect(isNumber([])).toBe(false)
    expect(isNumber(true)).toBe(false)
    expect(isNumber(Symbol("x"))).toBe(false)
    expect(isNumber(() => 1)).toBe(false)
  })
})

describe("deciles", () => {
  it("maps 0..100 deciles for an already sorted array of length 11 (default rounding)", () => {
    const arr = Array.from({ length: 11 }, (_, i) => i)
    const result = deciles(arr)
    for (let i = 0; i <= 10; i++) {
      expect(result[i * 10]).toBe(i)
    }
  })

  it("sorts the input before selecting percentiles", () => {
    const arr = [9, 7, 5, 3, 1, 2, 4, 6, 8, 0, 10]
    const result = deciles(arr)
    for (let i = 0; i <= 10; i++) {
      expect(result[i * 10]).toBe(i)
    }
  })

  it("supports a string key to select values for percentile positions", () => {
    const arr = [
      { v: 9 },
      { v: 7 },
      { v: 5 },
      { v: 3 },
      { v: 1 },
      { v: 2 },
      { v: 4 },
      { v: 6 },
      { v: 8 },
      { v: 0 },
      { v: 10 },
    ]
    const result = deciles(arr, { key: "v" })
    for (let i = 0; i <= 10; i++) {
      expect(result[i * 10].v).toBe(i)
    }
  })

  it("supports a key function", () => {
    const arr = [
      { n: 90 },
      { n: 70 },
      { n: 50 },
      { n: 30 },
      { n: 10 },
      { n: 20 },
      { n: 40 },
      { n: 60 },
      { n: 80 },
      { n: 0 },
      { n: 100 },
    ]
    const result = deciles(arr, { key: (el) => el.n })
    for (let i = 0; i <= 10; i++) {
      expect(result[i * 10].n).toBe(i * 10)
    }
  })

  it("respects a custom method (Math.floor) for fractional indices", () => {
    const arr = Array.from({ length: 10 }, (_, i) => i) // 0..9
    const defaultResult = deciles(arr) // uses Math.round
    const floorResult = deciles(arr, { method: Math.floor })
    expect(defaultResult[50]).toBe(5) // round(0.5 * 9) = 5
    expect(floorResult[50]).toBe(4) // floor(0.5 * 9) = 4
  })

  it("handles arrays of length 1 by returning that element for all deciles", () => {
    const arr = [42]
    const result = deciles(arr)
    for (let i = 0; i <= 10; i++) {
      expect(result[i * 10]).toBe(42)
    }
  })
})
