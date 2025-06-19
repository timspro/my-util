// src/array.test.js
import { describe, expect, it } from "@jest/globals"

const { chunk, unique } = await import("./array.js")

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
