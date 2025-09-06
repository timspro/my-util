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
  findIndexFrom,
  findFrom,
  findLastIndexFrom,
  findLastFrom,
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

describe("findIndexFrom", () => {
  it("returns the index of the first matching element from fromIndex", () => {
    expect(findIndexFrom([1, 2, 3, 4], 1, (x) => x > 2)).toBe(2)
    expect(findIndexFrom([1, 2, 3, 4], 2, (x) => x > 2)).toBe(2)
    expect(findIndexFrom([1, 2, 3, 4], 3, (x) => x > 2)).toBe(3)
  })

  it("returns -1 if no element matches", () => {
    expect(findIndexFrom([1, 2, 3, 4], 2, (x) => x > 10)).toBe(-1)
  })

  it("returns -1 for empty array", () => {
    expect(findIndexFrom([], 0, () => true)).toBe(-1)
  })

  it("passes correct arguments to callback", () => {
    const arr = [10, 20, 30]
    const called = []
    findIndexFrom(arr, 1, (value, index, array) => {
      called.push([value, index, array])
      return false
    })
    expect(called[0][0]).toBe(20)
    expect(called[0][1]).toBe(1)
    expect(called[0][2]).toBe(arr)
  })
})

describe("findFrom", () => {
  it("returns the first matching element from fromIndex", () => {
    expect(findFrom([1, 2, 3, 4], 1, (x) => x > 2)).toBe(3)
    expect(findFrom([1, 2, 3, 4], 2, (x) => x > 2)).toBe(3)
    expect(findFrom([1, 2, 3, 4], 3, (x) => x > 2)).toBe(4)
  })

  it("returns undefined if no element matches", () => {
    expect(findFrom([1, 2, 3, 4], 2, (x) => x > 10)).toBeUndefined()
  })

  it("returns undefined for empty array", () => {
    expect(findFrom([], 0, () => true)).toBeUndefined()
  })

  it("passes correct arguments to callback", () => {
    const arr = [10, 20, 30]
    const called = []
    findFrom(arr, 1, (value, index, array) => {
      called.push([value, index, array])
      return false
    })
    expect(called[0][0]).toBe(20)
    expect(called[0][1]).toBe(1)
    expect(called[0][2]).toBe(arr)
  })
})

describe("findLastIndexFrom", () => {
  it("returns the index of the last matching element from fromIndex (backwards)", () => {
    expect(findLastIndexFrom([1, 2, 3, 4], 2, (x) => x < 3)).toBe(1)
    expect(findLastIndexFrom([1, 2, 3, 4], 3, (x) => x < 3)).toBe(1)
    expect(findLastIndexFrom([1, 2, 3, 4], 1, (x) => x < 3)).toBe(1)
    expect(findLastIndexFrom([1, 2, 3, 4], 0, (x) => x < 3)).toBe(0)
  })

  it("returns -1 if no element matches", () => {
    expect(findLastIndexFrom([1, 2, 3, 4], 3, (x) => x > 10)).toBe(-1)
  })

  it("returns -1 for empty array", () => {
    expect(findLastIndexFrom([], 0, () => true)).toBe(-1)
  })

  it("passes correct arguments to callback", () => {
    const arr = [10, 20, 30]
    const called = []
    findLastIndexFrom(arr, 2, (value, index, array) => {
      called.push([value, index, array])
      return false
    })
    expect(called[0][0]).toBe(30)
    expect(called[0][1]).toBe(2)
    expect(called[0][2]).toBe(arr)
  })
})

describe("findLastFrom", () => {
  it("returns the last matching element from fromIndex (backwards)", () => {
    expect(findLastFrom([1, 2, 3, 4], 2, (x) => x < 3)).toBe(2)
    expect(findLastFrom([1, 2, 3, 4], 3, (x) => x < 3)).toBe(2)
    expect(findLastFrom([1, 2, 3, 4], 1, (x) => x < 3)).toBe(2)
    expect(findLastFrom([1, 2, 3, 4], 0, (x) => x < 3)).toBe(1)
  })

  it("returns undefined if no element matches", () => {
    expect(findLastFrom([1, 2, 3, 4], 3, (x) => x > 10)).toBeUndefined()
  })

  it("returns undefined for empty array", () => {
    expect(findLastFrom([], 0, () => true)).toBeUndefined()
  })

  it("passes correct arguments to callback", () => {
    const arr = [10, 20, 30]
    const called = []
    findLastFrom(arr, 2, (value, index, array) => {
      called.push([value, index, array])
      return false
    })
    expect(called[0][0]).toBe(30)
    expect(called[0][1]).toBe(2)
    expect(called[0][2]).toBe(arr)
  })
})
