import {
  findClosest,
  findClosestAbs,
  findClosestGT,
  findClosestGTE,
  findClosestLT,
  findClosestLTE,
} from "./find.js"

describe("findClosest", () => {
  it("returns the closest value by absolute difference (default comparator)", () => {
    expect(findClosest([1, 5, 10], 6)).toBe(5)
    expect(findClosest([1, 5, 10], 8)).toBe(10)
    expect(findClosest([1, 5, 10], 1)).toBe(1)
  })

  it("returns undefined if array is empty", () => {
    expect(findClosest([], 10)).toBeUndefined()
  })

  it("returns the closest object by key (abs)", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosest(arr, 6, { key: "v" })).toEqual({ v: 5 })
  })

  it("returns the closest value less than input (lt comparator)", () => {
    expect(findClosest([1, 3, 5, 7], 6, { comparator: "lt" })).toBe(5)
    expect(findClosest([1, 3, 5, 7], 1, { comparator: "lt" })).toBeUndefined()
  })

  it("returns the closest value less than or equal to input (lte comparator)", () => {
    expect(findClosest([1, 3, 5, 7], 5, { comparator: "lte" })).toBe(5)
    expect(findClosest([1, 3, 5, 7], 2, { comparator: "lte" })).toBe(1)
    expect(findClosest([1, 3, 5, 7], 0, { comparator: "lte" })).toBeUndefined()
  })

  it("returns the closest value greater than input (gt comparator)", () => {
    expect(findClosest([1, 3, 5, 7], 5, { comparator: "gt" })).toBe(7)
    expect(findClosest([1, 3, 5, 7], 7, { comparator: "gt" })).toBeUndefined()
  })

  it("returns the closest value greater than or equal to input (gte comparator)", () => {
    expect(findClosest([1, 3, 5, 7], 5, { comparator: "gte" })).toBe(5)
    expect(findClosest([1, 3, 5, 7], 6, { comparator: "gte" })).toBe(7)
    expect(findClosest([1, 3, 5, 7], 8, { comparator: "gte" })).toBeUndefined()
  })

  it("returns the closest object by key for lt/lte/gt/gte", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosest(arr, 6, { comparator: "lt", key: "v" })).toEqual({ v: 5 })
    expect(findClosest(arr, 6, { comparator: "lte", key: "v" })).toEqual({ v: 5 })
    expect(findClosest(arr, 6, { comparator: "gt", key: "v" })).toEqual({ v: 10 })
    expect(findClosest(arr, 10, { comparator: "gte", key: "v" })).toEqual({ v: 10 })
  })

  it("respects the threshold option for abs comparator", () => {
    expect(findClosest([1, 5, 10], 6, { threshold: 0.5 })).toBeUndefined()
    expect(findClosest([1, 5, 10], 6, { threshold: 2 })).toBe(5)
  })

  it("respects the threshold option for lt/lte/gt/gte", () => {
    expect(findClosest([1, 3, 5, 7], 6, { comparator: "lt", threshold: 4 })).toBe(5)
    expect(findClosest([1, 3, 5, 7], 6, { comparator: "lt", threshold: 5 })).toBeUndefined()
    expect(findClosest([1, 3, 5, 7], 6, { comparator: "gt", threshold: 7 })).toBeUndefined()
    expect(findClosest([1, 3, 5, 7], 6, { comparator: "gt", threshold: 10 })).toBe(7)
  })

  it("throws for unknown comparator", () => {
    expect(() => findClosest([1, 2, 3], 2, { comparator: "foo" })).toThrow(
      "Unknown comparator: foo"
    )
  })

  it("returns undefined if no element matches threshold/key criteria", () => {
    expect(
      findClosest([{ v: 1 }], 10, { comparator: "gt", key: "v", threshold: 1 })
    ).toBeUndefined()
    expect(
      findClosest([{ v: 1 }], 0, { comparator: "lt", key: "v", threshold: 1 })
    ).toBeUndefined()
  })

  it("works with negative numbers and zero", () => {
    expect(findClosest([-10, -5, 0, 5, 10], -7)).toBe(-5)
    expect(findClosest([-10, -5, 0, 5, 10], 0)).toBe(0)
    expect(findClosest([-10, -5, 0, 5, 10], 7)).toBe(5)
  })

  // ISSUE: findClosestAbs and related functions do not skip NaN values in key/map modes, only in value mode.
  it("skips NaN values in abs comparator", () => {
    expect(findClosest([1, NaN, 5], 4)).toBe(5)
  })

  it("skips objects missing the key in key-based comparators", () => {
    const arr = [{ v: 1 }, {}, { v: 5 }]
    expect(findClosest(arr, 2, { key: "v" })).toEqual({ v: 1 })
  })

  it("finds the closest string using abs comparator and a custom threshold/comparator", () => {
    // Since abs comparator expects numbers, we need to provide a custom comparator for strings.
    // We'll use threshold and comparator: "lt", "lte", "gt", "gte" for string comparisons.
    const arr = ["apple", "banana", "cherry", "date"]
    // Find the closest string less than "carrot" (alphabetically)
    expect(findClosest(arr, "carrot", { comparator: "lt", threshold: "" })).toBe("banana")
    // Find the closest string less than or equal to "banana"
    expect(findClosest(arr, "banana", { comparator: "lte", threshold: "" })).toBe("banana")
    // Find the closest string greater than "carrot"
    expect(findClosest(arr, "carrot", { comparator: "gt", threshold: "~" })).toBe("cherry")
    // Find the closest string greater than or equal to "date"
    expect(findClosest(arr, "date", { comparator: "gte", threshold: "~" })).toBe("date")
    // If nothing matches, returns undefined
    expect(findClosest(arr, "aardvark", { comparator: "lt", threshold: "" })).toBeUndefined()
    expect(findClosest(arr, "zebra", { comparator: "gt", threshold: "~" })).toBeUndefined()
  })

  it("finds the closest string by key in array of objects", () => {
    const arr = [{ name: "apple" }, { name: "banana" }, { name: "cherry" }]
    expect(
      findClosest(arr, "blueberry", { comparator: "lt", key: "name", threshold: "" })
    ).toEqual({
      name: "banana",
    })
    expect(
      findClosest(arr, "banana", { comparator: "lte", key: "name", threshold: "" })
    ).toEqual({
      name: "banana",
    })
    expect(
      findClosest(arr, "banana", { comparator: "gt", key: "name", threshold: "~" })
    ).toEqual({
      name: "cherry",
    })
    expect(
      findClosest(arr, "cherry", { comparator: "gte", key: "name", threshold: "~" })
    ).toEqual({
      name: "cherry",
    })
    expect(
      findClosest(arr, "aardvark", { comparator: "lt", key: "name", threshold: "" })
    ).toBeUndefined()
  })

  it("returns undefined if no string matches threshold/key criteria", () => {
    const arr = ["apple", "banana", "cherry"]
    expect(findClosest(arr, "apple", { comparator: "lt", threshold: "" })).toBeUndefined()
    expect(findClosest(arr, "cherry", { comparator: "gt" })).toBeUndefined()
  })

  it("can use abs comparator with string lengths", () => {
    // This is a reasonable use-case for abs: find string with length closest to 4
    const arr = ["a", "bb", "ccc", "dddd", "eeeee"]
    // Map to string lengths using key
    expect(findClosest(arr, 4, { comparator: "abs", key: "length" })).toEqual("dddd")
    // If threshold is set so no string length is close enough
    expect(
      findClosest(arr, 4, { comparator: "abs", key: "length", threshold: -1 })
    ).toBeUndefined()
  })

  it("uses transform as a function (same as map)", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    const mapFn = (el) => el.v
    expect(findClosest(arr, 6, { transform: mapFn })).toEqual({ v: 5 })
    // Should take precedence over key if both are present
    expect(findClosest(arr, 6, { key: "notUsed", transform: mapFn })).toEqual({ v: 5 })
  })

  it("uses transform as a string (same as key)", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosest(arr, 6, { transform: "v" })).toEqual({ v: 5 })
    // Should take precedence over key if both are present
    expect(findClosest(arr, 6, { key: "notUsed", transform: "v" })).toEqual({ v: 5 })
  })

  it("uses transform as a number (same as key)", () => {
    const arr = [[1], [5], [10]]
    expect(findClosest(arr, 6, { transform: 0 })).toEqual([5])
    // Should take precedence over key if both are present
    expect(findClosest(arr, 6, { key: "notUsed", transform: 0 })).toEqual([5])
  })

  it("transform does not override key if key is already present and transform is not provided", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosest(arr, 6, { key: "v" })).toEqual({ v: 5 })
  })

  it("transform is ignored if not a function, string, or number", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    // eslint-disable-next-line no-restricted-syntax
    expect(findClosest(arr, 6, { transform: null, key: "v" })).toEqual({ v: 5 })
    expect(findClosest(arr, 6, { transform: {}, key: "v" })).toEqual({ v: 5 })
  })
})

describe("findClosestAbs", () => {
  it("returns closest value by absolute difference", () => {
    expect(findClosestAbs([1, 5, 10], 6)).toBe(5)
    expect(findClosestAbs([1, 5, 10], 8)).toBe(10)
    expect(findClosestAbs([1, 5, 10], 1)).toBe(1)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestAbs([], 10)).toBeUndefined()
  })

  it("returns closest object by key", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestAbs(arr, 6, { key: "v" })).toEqual({ v: 5 })
  })

  it("returns closest value by map", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestAbs(arr, 6, { map: (el) => el.v })).toEqual({ v: 5 })
  })

  it("respects threshold", () => {
    expect(findClosestAbs([1, 5, 10], 6, { threshold: 0.5 })).toBeUndefined()
    expect(findClosestAbs([1, 5, 10], 6, { threshold: 2 })).toBe(5)
  })

  it("skips NaN in value mode but not in key/map mode", () => {
    expect(findClosestAbs([1, NaN, 5], 4)).toBe(5)
    const arr = [{ v: 1 }, { v: NaN }, { v: 5 }]
    expect(findClosestAbs(arr, 2, { key: "v" })).toEqual({ v: 1 })
    expect(findClosestAbs(arr, 2, { map: (el) => el.v })).toEqual({ v: 1 })
  })
})

describe("findClosestLT", () => {
  it("returns closest value less than desired", () => {
    expect(findClosestLT([1, 3, 5, 7], 6)).toBe(5)
    expect(findClosestLT([1, 3, 5, 7], 1)).toBeUndefined()
  })

  it("returns closest object by key", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestLT(arr, 6, { key: "v" })).toEqual({ v: 5 })
  })

  it("returns closest object by map", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestLT(arr, 6, { map: (el) => el.v })).toEqual({ v: 5 })
  })

  it("respects threshold", () => {
    expect(findClosestLT([1, 3, 5, 7], 6, { threshold: 4 })).toBe(5)
    expect(findClosestLT([1, 3, 5, 7], 6, { threshold: 5 })).toBeUndefined()
  })

  it("returns undefined for empty array", () => {
    expect(findClosestLT([], 10)).toBeUndefined()
  })
})

describe("findClosestLTE", () => {
  it("returns closest value less than or equal to desired", () => {
    expect(findClosestLTE([1, 3, 5, 7], 5)).toBe(5)
    expect(findClosestLTE([1, 3, 5, 7], 2)).toBe(1)
    expect(findClosestLTE([1, 3, 5, 7], 0)).toBeUndefined()
  })

  it("returns closest object by key", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestLTE(arr, 6, { key: "v" })).toEqual({ v: 5 })
  })

  it("returns closest object by map", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestLTE(arr, 6, { map: (el) => el.v })).toEqual({ v: 5 })
  })

  it("respects threshold", () => {
    expect(findClosestLTE([1, 3, 5, 7], 6, { threshold: 4 })).toBe(5)
    expect(findClosestLTE([1, 3, 5, 7], 6, { threshold: 5 })).toBeUndefined()
  })

  it("returns undefined for empty array", () => {
    expect(findClosestLTE([], 10)).toBeUndefined()
  })
})

describe("findClosestGT", () => {
  it("returns closest value greater than desired", () => {
    expect(findClosestGT([1, 3, 5, 7], 5)).toBe(7)
    expect(findClosestGT([1, 3, 5, 7], 7)).toBeUndefined()
  })

  it("returns closest object by key", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestGT(arr, 6, { key: "v" })).toEqual({ v: 10 })
  })

  it("returns closest object by map", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestGT(arr, 6, { map: (el) => el.v })).toEqual({ v: 10 })
  })

  it("respects threshold", () => {
    expect(findClosestGT([1, 3, 5, 7], 6, { threshold: 7 })).toBeUndefined()
    expect(findClosestGT([1, 3, 5, 7], 6, { threshold: 10 })).toBe(7)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestGT([], 10)).toBeUndefined()
  })
})

describe("findClosestGTE", () => {
  it("returns closest value greater than or equal to desired", () => {
    expect(findClosestGTE([1, 3, 5, 7], 5)).toBe(5)
    expect(findClosestGTE([1, 3, 5, 7], 6)).toBe(7)
    expect(findClosestGTE([1, 3, 5, 7], 8)).toBeUndefined()
  })

  it("returns closest object by key", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestGTE(arr, 6, { key: "v" })).toEqual({ v: 10 })
    expect(findClosestGTE(arr, 10, { key: "v" })).toEqual({ v: 10 })
  })

  it("returns closest object by map", () => {
    const arr = [{ v: 1 }, { v: 5 }, { v: 10 }]
    expect(findClosestGTE(arr, 6, { map: (el) => el.v })).toEqual({ v: 10 })
    expect(findClosestGTE(arr, 10, { map: (el) => el.v })).toEqual({ v: 10 })
  })

  it("respects threshold", () => {
    expect(findClosestGTE([1, 3, 5, 7], 6, { threshold: 7 })).toBeUndefined()
    expect(findClosestGTE([1, 3, 5, 7], 6, { threshold: 10 })).toBe(7)
  })

  it("returns undefined for empty array", () => {
    expect(findClosestGTE([], 10)).toBeUndefined()
  })
})
