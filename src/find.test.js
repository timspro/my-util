/* eslint-disable no-restricted-syntax */
import { describe, expect, it } from "@jest/globals"

const {
  findClosestAbs,
  findClosestLT,
  findClosestLTE,
  findClosestGT,
  findClosestGTE,
  findClosest,
  findMin,
  findMax,
  findTruthy,
} = await import("./find.js")

describe("findClosestAbs", () => {
  it("returns the element closest in absolute value to desired", () => {
    expect(findClosestAbs([1, 5, 9], 6)).toBe(5)
    expect(findClosestAbs([1, 5, 9], 8)).toBe(9)
    expect(findClosestAbs([1, 5, 9], 1)).toBe(1)
  })

  it("returns the first element in case of tie", () => {
    expect(findClosestAbs([4, 8], 6)).toBe(4)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestAbs([], 10)).toBeUndefined()
  })

  it("supports key as function", () => {
    const arr = [{ v: 2 }, { v: 8 }]
    expect(findClosestAbs(arr, 5, { key: (e) => e.v })).toEqual({ v: 2 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 1 }, { x: 10 }]
    expect(findClosestAbs(arr, 8, { key: "x" })).toEqual({ x: 10 })
  })

  it("supports key as number", () => {
    const arr = [[2], [8]]
    expect(findClosestAbs(arr, 7, { key: 0 })).toEqual([8])
  })

  it("respects cutoff", () => {
    expect(findClosestAbs([1, 5, 9], 6, { cutoff: 2 })).toBe(5)
    expect(findClosestAbs([1, 5, 9], 6, { cutoff: 1 })).toBeUndefined()
  })
})

describe("findClosestLT", () => {
  it("returns the closest element less than desired", () => {
    expect(findClosestLT([1, 5, 9], 6)).toBe(5)
    expect(findClosestLT([1, 5, 9], 2)).toBe(1)
    expect(findClosestLT([1, 5, 9], 1)).toBeUndefined()
  })

  it("returns first match if tie", () => {
    expect(findClosestLT([2, 2, 1], 3)).toBe(2)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestLT([], 10)).toBeUndefined()
  })

  it("supports key as function", () => {
    const arr = [{ v: 2 }, { v: 8 }]
    expect(findClosestLT(arr, 8, { key: (e) => e.v })).toEqual({ v: 2 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 1 }, { x: 10 }]
    expect(findClosestLT(arr, 8, { key: "x" })).toEqual({ x: 1 })
  })

  it("supports key as number", () => {
    const arr = [[2], [8]]
    expect(findClosestLT(arr, 7, { key: 0 })).toEqual([2])
  })

  it("respects cutoff", () => {
    expect(findClosestLT([1, 5, 9], 6, { cutoff: 4 })).toBe(5)
    expect(findClosestLT([1, 5, 9], 6, { cutoff: 5 })).toBeUndefined()
  })
})

describe("findClosestLTE", () => {
  it("returns the closest element less than or equal to desired", () => {
    expect(findClosestLTE([1, 5, 9], 5)).toBe(5)
    expect(findClosestLTE([1, 5, 9], 6)).toBe(5)
    expect(findClosestLTE([1, 5, 9], 1)).toBe(1)
    expect(findClosestLTE([1, 5, 9], 0)).toBeUndefined()
  })

  it("returns first match if tie", () => {
    expect(findClosestLTE([2, 2, 1], 2)).toBe(2)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestLTE([], 10)).toBeUndefined()
  })

  it("supports key as function", () => {
    const arr = [{ v: 2 }, { v: 8 }]
    expect(findClosestLTE(arr, 8, { key: (e) => e.v })).toEqual({ v: 8 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 1 }, { x: 10 }]
    expect(findClosestLTE(arr, 8, { key: "x" })).toEqual({ x: 1 })
  })

  it("supports key as number", () => {
    const arr = [[2], [8]]
    expect(findClosestLTE(arr, 7, { key: 0 })).toEqual([2])
  })

  it("respects cutoff", () => {
    expect(findClosestLTE([1, 5, 9], 6, { cutoff: 4 })).toBe(5)
    expect(findClosestLTE([1, 5, 9], 6, { cutoff: 5 })).toBeUndefined()
  })
})

describe("findClosestGT", () => {
  it("returns the closest element greater than desired", () => {
    expect(findClosestGT([1, 5, 9], 6)).toBe(9)
    expect(findClosestGT([1, 5, 9], 0)).toBe(1)
    expect(findClosestGT([1, 5, 9], 9)).toBeUndefined()
  })

  it("returns first match if tie", () => {
    expect(findClosestGT([8, 8, 10], 7)).toBe(8)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestGT([], 10)).toBeUndefined()
  })

  it("supports key as function", () => {
    const arr = [{ v: 2 }, { v: 8 }]
    expect(findClosestGT(arr, 2, { key: (e) => e.v })).toEqual({ v: 8 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 1 }, { x: 10 }]
    expect(findClosestGT(arr, 8, { key: "x" })).toEqual({ x: 10 })
  })

  it("supports key as number", () => {
    const arr = [[2], [8]]
    expect(findClosestGT(arr, 2, { key: 0 })).toEqual([8])
  })

  it("respects cutoff", () => {
    expect(findClosestGT([1, 5, 9], 6, { cutoff: 8 })).toBeUndefined()
    expect(findClosestGT([1, 5, 9], 4, { cutoff: 8 })).toBe(5)
  })
})

describe("findClosestGTE", () => {
  it("returns the closest element greater than or equal to desired", () => {
    expect(findClosestGTE([1, 5, 9], 5)).toBe(5)
    expect(findClosestGTE([1, 5, 9], 4)).toBe(5)
    expect(findClosestGTE([1, 5, 9], 10)).toBeUndefined()
  })

  it("returns first match if tie", () => {
    expect(findClosestGTE([8, 8, 10], 8)).toBe(8)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestGTE([], 10)).toBeUndefined()
  })

  it("supports key as function", () => {
    const arr = [{ v: 2 }, { v: 8 }]
    expect(findClosestGTE(arr, 2, { key: (e) => e.v })).toEqual({ v: 2 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 1 }, { x: 10 }]
    expect(findClosestGTE(arr, 8, { key: "x" })).toEqual({ x: 10 })
  })

  it("supports key as number", () => {
    const arr = [[2], [8]]
    expect(findClosestGTE(arr, 2, { key: 0 })).toEqual([2])
  })

  it("respects cutoff", () => {
    expect(findClosestGTE([1, 5, 9], 6, { cutoff: 8 })).toBeUndefined()
    expect(findClosestGTE([1, 5, 9], 4, { cutoff: 8 })).toBe(5)
  })
})

describe("findClosest", () => {
  it("defaults to abs comparator", () => {
    expect(findClosest([1, 5, 9], 6)).toBe(5)
  })

  it("calls correct comparator", () => {
    expect(findClosest([1, 5, 9], 6, { comparator: "lt" })).toBe(5)
    expect(findClosest([1, 5, 9], 6, { comparator: "lte" })).toBe(5)
    expect(findClosest([1, 5, 9], 6, { comparator: "gt" })).toBe(9)
    expect(findClosest([1, 5, 9], 6, { comparator: "gte" })).toBe(9)
    expect(findClosest([1, 5, 9], 6, { comparator: "abs" })).toBe(5)
  })

  it("throws on unknown comparator", () => {
    expect(() => findClosest([1, 5, 9], 6, { comparator: "foo" })).toThrow(
      "unknown comparator: foo"
    )
  })

  it("passes options to underlying function", () => {
    const arr = [{ x: 1 }, { x: 10 }]
    expect(findClosest(arr, 8, { comparator: "abs", key: "x" })).toEqual({ x: 10 })
  })
})

describe("findMin", () => {
  it("returns the minimum value in a numeric array", () => {
    expect(findMin([3, 1, 4, 2])).toBe(1)
  })

  it("returns undefined for empty array", () => {
    expect(findMin([])).toBeUndefined()
  })

  it("returns the first minimum if there are duplicates", () => {
    expect(findMin([2, 1, 1, 3])).toBe(1)
  })

  it("supports key as function", () => {
    const arr = [{ v: 5 }, { v: 2 }, { v: 8 }]
    expect(findMin(arr, { key: (e) => e.v })).toEqual({ v: 2 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 5 }, { x: 2 }, { x: 8 }]
    expect(findMin(arr, { key: "x" })).toEqual({ x: 2 })
  })

  it("supports key as number", () => {
    const arr = [[5], [2], [8]]
    expect(findMin(arr, { key: 0 })).toEqual([2])
  })

  it("respects cutoff", () => {
    expect(findMin([3, 1, 4, 2], { cutoff: 2 })).toBe(1)
    expect(findMin([3, 1, 4, 2], { cutoff: 1 })).toBeUndefined()
  })
})

describe("findMax", () => {
  it("returns the maximum value in a numeric array", () => {
    expect(findMax([3, 1, 4, 2])).toBe(4)
  })

  it("returns undefined for empty array", () => {
    expect(findMax([])).toBeUndefined()
  })

  it("returns the first maximum if there are duplicates", () => {
    expect(findMax([4, 2, 4, 1])).toBe(4)
  })

  it("supports key as function", () => {
    const arr = [{ v: 5 }, { v: 2 }, { v: 8 }]
    expect(findMax(arr, { key: (e) => e.v })).toEqual({ v: 8 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 5 }, { x: 2 }, { x: 8 }]
    expect(findMax(arr, { key: "x" })).toEqual({ x: 8 })
  })

  it("supports key as number", () => {
    const arr = [[5], [2], [8]]
    expect(findMax(arr, { key: 0 })).toEqual([8])
  })

  it("respects cutoff", () => {
    expect(findMax([3, 1, 4, 2], { cutoff: 2 })).toBe(4)
    expect(findMax([3, 1, 4, 2], { cutoff: 4 })).toBeUndefined()
  })
})

describe("findTruthy", () => {
  it("returns the first truthy value in array", () => {
    expect(findTruthy([0, null, false, 2, 3], {})).toBe(2)
  })

  it("returns undefined if no truthy value", () => {
    expect(findTruthy([0, null, false], {})).toBeUndefined()
  })

  it("supports key as function", () => {
    const arr = [{ v: 0 }, { v: 2 }, { v: 0 }]
    expect(findTruthy(arr, { key: (e) => e.v })).toEqual({ v: 2 })
  })

  it("supports key as string", () => {
    const arr = [{ x: 0 }, { x: 2 }, { x: 0 }]
    expect(findTruthy(arr, { key: "x" })).toEqual({ x: 2 })
  })

  it("supports key as number", () => {
    const arr = [[0], [2], [0]]
    expect(findTruthy(arr, { key: 0 })).toEqual([2])
  })

  it("respects from and until (forward)", () => {
    const arr = [0, 1, 2, 3]
    expect(findTruthy(arr, { from: 2, until: 4 })).toBe(2)
    expect(findTruthy(arr, { from: 1, until: 3 })).toBe(1)
    expect(findTruthy(arr, { from: 3, until: 4 })).toBe(3)
    expect(findTruthy(arr, { from: 3, until: 3 })).toBeUndefined()
  })

  it("returns undefined if from >= until", () => {
    expect(findTruthy([0, 1, 2], { from: 2, until: 2 })).toBeUndefined()
    expect(findTruthy([0, 1, 2], { from: 3, until: 2 })).toBeUndefined()
  })

  it("respects the new 'to' option (inclusive end)", () => {
    const arr = [0, 1, 2, 3]
    expect(findTruthy(arr, { from: 1, to: 2 })).toBe(1)
    expect(findTruthy(arr, { from: 2, to: 3 })).toBe(2)
    expect(findTruthy(arr, { from: 2, to: 2 })).toBe(2)
    expect(findTruthy(arr, { from: 2, to: 1 })).toBeUndefined()
    expect(findTruthy(arr, { from: 0, to: 0 })).toBeUndefined()
    expect(findTruthy(arr, { from: 1, to: 1 })).toBe(1)
  })

  it("prefers 'to' over 'until' if both are given", () => {
    const arr = [0, 1, 2, 3]
    // 'to' = 1, so only index 1 is checked, even though until=4
    expect(findTruthy(arr, { from: 1, until: 4, to: 1 })).toBe(1)
    // 'to' = 2, so indices 1 and 2 checked, even though until=2 (which would skip 2)
    expect(findTruthy(arr, { from: 1, until: 2, to: 2 })).toBe(1)
  })

  it("works with key as function and 'to'", () => {
    const arr = [{ v: 0 }, { v: 0 }, { v: 2 }, { v: 3 }]
    expect(findTruthy(arr, { key: (e) => e.v, from: 1, to: 2 })).toEqual({ v: 2 })
    expect(findTruthy(arr, { key: (e) => e.v, from: 1, to: 1 })).toBeUndefined()
  })

  it("works with key as string and 'to'", () => {
    const arr = [{ x: 0 }, { x: 2 }, { x: 0 }]
    expect(findTruthy(arr, { key: "x", from: 0, to: 1 })).toEqual({ x: 2 })
    expect(findTruthy(arr, { key: "x", from: 1, to: 1 })).toEqual({ x: 2 })
    expect(findTruthy(arr, { key: "x", from: 2, to: 1 })).toBeUndefined()
  })

  it("works with key as number and 'to'", () => {
    const arr = [[0], [2], [0]]
    expect(findTruthy(arr, { key: 0, from: 0, to: 1 })).toEqual([2])
    expect(findTruthy(arr, { key: 0, from: 1, to: 1 })).toEqual([2])
    expect(findTruthy(arr, { key: 0, from: 2, to: 1 })).toBeUndefined()
  })
})
