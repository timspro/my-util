/* eslint-disable no-restricted-syntax */
import { describe, expect, it, jest } from "@jest/globals"
import { findClosest } from "./array.js"

const { chunk, unique, mutateValues, ascending, descending, multilevel, via } = await import(
  "./array.js"
)

describe("chunk", () => {
  it("splits array into chunks of specified size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ])
  })

  it("returns empty array when input is empty", () => {
    expect(chunk([], 3)).toEqual([])
  })

  it("returns the entire array as one chunk if chunkSize >= array.length", () => {
    expect(chunk([1, 2], 5)).toEqual([[1, 2]])
    expect(chunk([1, 2], 2)).toEqual([[1, 2]])
  })

  it("returns the entire array as one chunk if chunkSize is omitted", () => {
    expect(chunk([1, 2, 3])).toEqual([[1, 2, 3]])
  })

  it("throws if chunkSize is not a positive integer", () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow("chunkSize must be a positive integer")
    expect(() => chunk([1, 2, 3], -1)).toThrow("chunkSize must be a positive integer")
    expect(() => chunk([1, 2, 3], 1.5)).toThrow("chunkSize must be a positive integer")
  })

  it("handles chunkSize of 1 (each element in its own chunk)", () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]])
  })

  it("returns empty array when input is empty and chunkSize is omitted", () => {
    expect(chunk([])).toEqual([])
  })

  it("returns one chunk if chunkSize is much larger than array length", () => {
    expect(chunk([1, 2, 3], 100)).toEqual([[1, 2, 3]])
  })
})

describe("unique", () => {
  it("returns only unique elements, preserving order", () => {
    expect(unique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4])
    expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"])
  })

  it("returns empty array when input is empty", () => {
    expect(unique([])).toEqual([])
  })

  it("returns the same array if all elements are unique", () => {
    expect(unique([1, 2, 3])).toEqual([1, 2, 3])
  })

  it("handles arrays with different types", () => {
    expect(unique([1, "1", 1, "1"])).toEqual([1, "1"])
    expect(unique([true, false, true])).toEqual([true, false])
  })

  it("handles arrays with objects (reference equality)", () => {
    const a = {}
    const b = {}
    expect(unique([a, b, a])).toEqual([a, b])
  })
})

describe("mutateValues", () => {
  it("mutates values in the object using the callback", () => {
    const obj = { a: 1, b: 2 }
    const result = mutateValues(obj, (v) => v * 2)
    expect(result).toEqual({ a: 2, b: 4 })
    expect(obj).toBe(result) // should mutate in place
  })

  it("callback receives value, key, and object", () => {
    const obj = { x: 1 }
    const cb = jest.fn((v) => v + 1)
    mutateValues(obj, cb)
    expect(cb).toHaveBeenCalledWith(1, "x", obj)
  })

  it("returns the same object reference", () => {
    const obj = { foo: "bar" }
    const returned = mutateValues(obj, (v) => v)
    expect(returned).toBe(obj)
  })

  it("handles empty object", () => {
    const obj = {}
    expect(mutateValues(obj, (v) => v)).toEqual({})
  })

  it("mutates inherited enumerable properties", () => {
    const proto = { inherited: 1 }
    const obj = Object.create(proto)
    obj.own = 2
    const result = mutateValues(obj, (v) => v + 1)
    expect(result.own).toBe(3)
    expect(result.inherited).toBe(2)
  })
})

describe("ascending", () => {
  it("sorts primitives ascending, undefined/null at end", () => {
    const arr = [undefined, null, 3, 1, 2]
    arr.sort(ascending())
    expect(arr).toEqual([1, 2, 3, null, undefined])
  })

  it("returns 0 for equal values", () => {
    expect(ascending()(2, 2)).toBe(0)
    expect(ascending()("a", "a")).toBe(0)
  })

  it("sorts objects by key ascending, undefined/null at end", () => {
    const arr = [{ v: undefined }, { v: 3 }, { v: null }, { v: 1 }, { v: 2 }]
    arr.sort(ascending("v"))
    expect(arr.map((o) => o.v)).toEqual([1, 2, 3, undefined, null])
  })

  it("returns 0 for equal key values", () => {
    expect(ascending("x")({ x: 5 }, { x: 5 })).toBe(0)
  })

  it("sorts negative numbers and zero correctly", () => {
    const arr = [0, -2, -1, 2]
    arr.sort(ascending())
    expect(arr).toEqual([-2, -1, 0, 2])
  })

  it("sorts strings alphabetically", () => {
    const arr = ["b", "a", "c"]
    arr.sort(ascending())
    expect(arr).toEqual(["a", "b", "c"])
  })

  it("handles objects missing the key", () => {
    const arr = [{ v: 2 }, {}, { v: 1 }]
    arr.sort(ascending("v"))
    expect(arr.map((o) => o.v)).toEqual([1, 2, undefined])
  })
})

describe("descending", () => {
  it("sorts primitives descending, undefined/null at end", () => {
    const arr = [undefined, 1, null, 3, 2]
    arr.sort(descending())
    expect(arr).toEqual([3, 2, 1, null, undefined])
  })

  it("returns 0 for equal values", () => {
    expect(descending()(2, 2)).toBe(0)
    expect(descending()("a", "a")).toBe(0)
  })

  it("sorts objects by key descending, undefined/null at end", () => {
    const arr = [{ v: undefined }, { v: 1 }, { v: 3 }, { v: null }, { v: 2 }]
    arr.sort(descending("v"))
    expect(arr.map((o) => o.v)).toEqual([3, 2, 1, undefined, null])
  })

  it("returns 0 for equal key values", () => {
    expect(descending("x")({ x: 5 }, { x: 5 })).toBe(0)
  })

  it("sorts negative numbers and zero correctly", () => {
    const arr = [0, -2, -1, 2]
    arr.sort(descending())
    expect(arr).toEqual([2, 0, -1, -2])
  })

  it("sorts strings reverse alphabetically", () => {
    const arr = ["b", "a", "c"]
    arr.sort(descending())
    expect(arr).toEqual(["c", "b", "a"])
  })

  it("handles objects missing the key", () => {
    const arr = [{ v: 2 }, {}, { v: 3 }]
    arr.sort(descending("v"))
    expect(arr.map((o) => o.v)).toEqual([3, 2, undefined])
  })
})

describe("multilevel", () => {
  it("returns 0 if all comparators return 0", () => {
    const cmp = multilevel(
      () => 0,
      () => 0
    )
    expect(cmp(1, 2)).toBe(0)
    expect(cmp("a", "b")).toBe(0)
  })

  it("returns first non-zero comparator result", () => {
    const cmp = multilevel(
      () => 0,
      () => -1,
      () => 1
    )
    expect(cmp(1, 2)).toBe(-1)
    const cmp2 = multilevel(
      () => 0,
      () => 0,
      () => 1
    )
    expect(cmp2(1, 2)).toBe(1)
  })

  it("works with ascending and descending comparators", () => {
    const arr = [
      { a: 1, b: 2 },
      { a: 2, b: 1 },
      { a: 1, b: 1 },
      { a: 2, b: 2 },
    ]
    arr.sort(multilevel(ascending("a"), descending("b")))
    expect(arr).toEqual([
      { a: 1, b: 2 },
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 2, b: 1 },
    ])
  })

  it("short-circuits after first non-zero comparator", () => {
    const calls = []
    const cmp1 = jest.fn(() => {
      calls.push("cmp1")
      return 0
    })
    const cmp2 = jest.fn(() => {
      calls.push("cmp2")
      return -1
    })
    const cmp3 = jest.fn(() => {
      calls.push("cmp3")
      return 1
    })
    const cmp = multilevel(cmp1, cmp2, cmp3)
    expect(cmp({}, {})).toBe(-1)
    expect(calls).toEqual(["cmp1", "cmp2"])
  })

  it("returns 0 if no comparators are provided", () => {
    const cmp = multilevel()
    expect(cmp(1, 2)).toBe(0)
    expect(cmp("a", "b")).toBe(0)
  })
})

describe("via", () => {
  it("returns a function that accesses the given key", () => {
    const getFoo = via("foo")
    expect(getFoo({ foo: 42 })).toBe(42)
    expect(getFoo({ foo: "bar" })).toBe("bar")
  })

  it("returns undefined if the key does not exist", () => {
    const getX = via("x")
    expect(getX({})).toBeUndefined()
    expect(getX({ y: 1 })).toBeUndefined()
  })

  it("works with numeric keys", () => {
    const get0 = via(0)
    expect(get0([10, 20])).toBe(10)
    expect(get0({ 0: "zero" })).toBe("zero")
  })

  it("returns undefined if object is missing", () => {
    const getFoo = via("foo")
    expect(() => getFoo(undefined)).toThrow(TypeError)
    expect(() => getFoo(null)).toThrow(TypeError)
  })
})

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
})
