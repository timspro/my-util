/* eslint-disable no-restricted-syntax */
import { describe, expect, it, jest } from "@jest/globals"

const { chunk, unique, duplicates, ascending, descending, multilevel, sortN } = await import(
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

  it("returns unique elements by key (string)", () => {
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
      { id: 3, name: "d" },
      { id: 2, name: "e" },
    ]
    expect(unique(arr, { key: "id" })).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "d" },
    ])
  })

  it("returns unique elements by key (number)", () => {
    const arr = [
      { 0: "a", v: 1 },
      { 0: "b", v: 2 },
      { 0: "a", v: 3 },
      { 0: "c", v: 4 },
    ]
    expect(unique(arr, { key: 0 })).toEqual([
      { 0: "a", v: 1 },
      { 0: "b", v: 2 },
      { 0: "c", v: 4 },
    ])
  })

  it("returns unique elements by function", () => {
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
      { id: 3, name: "d" },
      { id: 2, name: "e" },
    ]
    expect(
      unique(arr, {
        key: (el) => el.id % 2, // group by odd/even id
      })
    ).toEqual([
      { id: 1, name: "a" }, // id % 2 === 1
      { id: 2, name: "b" }, // id % 2 === 0
    ])
  })

  it("returns unique elements by function using index and array", () => {
    const arr = ["a", "b", "c", "a"]
    expect(
      unique(arr, {
        key: (el, i, array) => array.indexOf(el), // only first occurrence is unique
      })
    ).toEqual(["a", "b", "c"])
  })

  it("returns unique elements by key when some elements lack the key", () => {
    const arr = [{ id: 1 }, {}, { id: 1 }, { id: 2 }, {}]
    expect(unique(arr, { key: "id" })).toEqual([{ id: 1 }, {}, { id: 2 }])
  })

  it("returns unique elements by function when function returns undefined/null", () => {
    const arr = [{ id: 1 }, {}, { id: 2 }, { id: null }, {}]
    expect(
      unique(arr, {
        key: (el) => el.id,
      })
    ).toEqual([{ id: 1 }, {}, { id: 2 }, { id: null }])
  })

  it("returns unique elements by key when key value is undefined/null", () => {
    const arr = [{ id: 1 }, { id: undefined }, { id: 2 }, { id: null }, { id: undefined }]
    expect(unique(arr, { key: "id" })).toEqual([
      { id: 1 },
      { id: undefined },
      { id: 2 },
      { id: null },
    ])
  })

  it("returns unique elements for primitive array if key is not provided", () => {
    expect(unique([1, 2, 2, 3], {})).toEqual([1, 2, 3])
    expect(unique([1, 2, 2, 3], { key: undefined })).toEqual([1, 2, 3])
  })

  it("returns unique elements for object array if key is not provided", () => {
    const a = { x: 1 }
    const b = { x: 2 }
    expect(unique([a, b, a], {})).toEqual([a, b])
    expect(unique([a, b, a], { key: undefined })).toEqual([a, b])
  })
})

describe("duplicates", () => {
  it("returns empty array if there are no duplicates", () => {
    expect(duplicates([1, 2, 3])).toEqual([])
    expect(duplicates([], {})).toEqual([])
  })

  it("returns groups of duplicate primitives", () => {
    expect(duplicates([1, 2, 1, 3, 2, 1])).toEqual([
      [1, 1, 1],
      [2, 2],
    ])
    expect(duplicates(["a", "b", "a", "c", "b"])).toEqual([
      ["a", "a"],
      ["b", "b"],
    ])
  })

  it("returns groups of duplicate objects by reference", () => {
    const a = {}
    const b = {}
    expect(duplicates([a, b, a, b, a])).toEqual([
      [a, a, a],
      [b, b],
    ])
  })

  it("returns groups of duplicates by key (string)", () => {
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
      { id: 3, name: "d" },
      { id: 2, name: "e" },
      { id: 1, name: "f" },
    ]
    expect(duplicates(arr, { key: "id" })).toEqual([
      [
        { id: 1, name: "a" },
        { id: 1, name: "c" },
        { id: 1, name: "f" },
      ],
      [
        { id: 2, name: "b" },
        { id: 2, name: "e" },
      ],
    ])
  })

  it("returns groups of duplicates by key (number)", () => {
    const arr = [
      { 0: "a", v: 1 },
      { 0: "b", v: 2 },
      { 0: "a", v: 3 },
      { 0: "c", v: 4 },
      { 0: "b", v: 5 },
    ]
    expect(duplicates(arr, { key: 0 })).toEqual([
      [
        { 0: "a", v: 1 },
        { 0: "a", v: 3 },
      ],
      [
        { 0: "b", v: 2 },
        { 0: "b", v: 5 },
      ],
    ])
  })

  it("returns groups of duplicates by function", () => {
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
      { id: 3, name: "d" },
      { id: 2, name: "e" },
      { id: 1, name: "f" },
    ]
    expect(
      duplicates(arr, {
        key: (el) => el.id % 2, // group by odd/even id
      })
    ).toEqual([
      [
        { id: 1, name: "a" },
        { id: 1, name: "c" },
        { id: 3, name: "d" },
        { id: 1, name: "f" },
      ],
      [
        { id: 2, name: "b" },
        { id: 2, name: "e" },
      ],
    ])
  })

  it("returns groups of duplicates by function using index and array", () => {
    const arr = ["a", "b", "c", "a", "c"]
    expect(
      duplicates(arr, {
        key: (el, i, array) => array.indexOf(el), // group by first occurrence index
      })
    ).toEqual([
      ["a", "a"],
      ["c", "c"],
    ])
  })

  it("returns groups of duplicates by key when some elements lack the key", () => {
    const arr = [{ id: 1 }, {}, { id: 1 }, { id: 2 }, {}, { id: 2 }]
    expect(duplicates(arr, { key: "id" })).toEqual([
      [{ id: 1 }, { id: 1 }],
      [{}, {}],
      [{ id: 2 }, { id: 2 }],
    ])
  })

  it("returns groups of duplicates by function when function returns undefined/null", () => {
    const arr = [{ id: 1 }, {}, { id: 2 }, { id: null }, {}, { id: null }]
    expect(
      duplicates(arr, {
        key: (el) => el.id,
      })
    ).toEqual([
      [{}, {}],
      [{ id: null }, { id: null }],
    ])
  })

  it("returns groups of duplicates by key when key value is undefined/null", () => {
    const arr = [
      { id: 1 },
      { id: undefined },
      { id: 2 },
      { id: null },
      { id: undefined },
      { id: null },
    ]
    expect(duplicates(arr, { key: "id" })).toEqual([
      [{ id: undefined }, { id: undefined }],
      [{ id: null }, { id: null }],
    ])
  })

  it("returns empty array if all elements are unique by key or function", () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(duplicates(arr, { key: "id" })).toEqual([])
    expect(
      duplicates(arr, {
        key: (el) => el.id,
      })
    ).toEqual([])
  })

  it("returns empty array for empty input with key or function", () => {
    expect(duplicates([], { key: "id" })).toEqual([])
    expect(
      duplicates([], {
        key: (el) => el,
      })
    ).toEqual([])
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

  it("sorts using a transform function", () => {
    const arr = [{ v: 2 }, { v: 1 }, { v: 3 }]
    arr.sort(ascending((o) => o.v))
    expect(arr.map((o) => o.v)).toEqual([1, 2, 3])
  })

  it("sorts using a numeric key", () => {
    const arr = [{ 0: 2 }, { 0: 1 }, { 0: 3 }]
    arr.sort(ascending(0))
    expect(arr.map((o) => o[0])).toEqual([1, 2, 3])
  })

  it("sorts using a function that returns undefined/null", () => {
    const arr = [{ v: 2 }, {}, { v: 1 }, { v: null }]
    arr.sort(ascending((o) => o.v))
    expect(arr.map((o) => o.v)).toEqual([1, 2, undefined, null])
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

  it("sorts using a transform function", () => {
    const arr = [{ v: 2 }, { v: 1 }, { v: 3 }]
    arr.sort(descending((o) => o.v))
    expect(arr.map((o) => o.v)).toEqual([3, 2, 1])
  })

  it("sorts using a numeric key", () => {
    const arr = [{ 0: 2 }, { 0: 1 }, { 0: 3 }]
    arr.sort(descending(0))
    expect(arr.map((o) => o[0])).toEqual([3, 2, 1])
  })

  it("sorts using a function that returns undefined/null", () => {
    const arr = [{ v: 2 }, {}, { v: 1 }, { v: null }]
    arr.sort(descending((o) => o.v))
    expect(arr.map((o) => o.v)).toEqual([2, 1, undefined, null])
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

describe("sortN", () => {
  it("returns empty array when N <= 0", () => {
    expect(sortN([1, 2, 3], 0)).toEqual([])
    expect(sortN([1, 2, 3], -5)).toEqual([])
  })

  it("returns the entire array sorted when N >= array.length and does not mutate original", () => {
    const arr = [3, 1, 2]
    const result = sortN(arr, 10)
    expect(result).toEqual([1, 2, 3])
    expect(arr).toEqual([3, 1, 2])
    expect(result).not.toBe(arr)
  })

  it("returns the first N smallest elements (default ascending comparator)", () => {
    expect(sortN([5, 1, 3, 2, 4], 3)).toEqual([1, 2, 3])
    expect(sortN([3, 1, 3, 2, 2], 4)).toEqual([1, 2, 2, 3])
  })

  it("respects a descending comparator (returns top N largest)", () => {
    const arr = [5, 1, 3, 2, 4]
    expect(sortN(arr, 2, descending())).toEqual([5, 4])
  })

  it("works with key-based comparator and defers undefined/null values to the end", () => {
    const arr = [{ v: 3 }, {}, { v: 1 }, { v: null }, { v: 2 }, { v: undefined }]
    const out = sortN(arr, 3, ascending("v"))
    expect(out.map((o) => o.v)).toEqual([1, 2, 3])
  })

  it("does not mutate the original array when N < array.length", () => {
    const arr = [5, 1, 3, 2, 4]
    const out = sortN(arr, 3)
    expect(out).toEqual([1, 2, 3])
    expect(arr).toEqual([5, 1, 3, 2, 4])
  })
})
