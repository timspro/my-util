/* eslint-disable no-restricted-syntax */
import { jest } from "@jest/globals"
import {
  deepEqual,
  deepMerge,
  deleteUndefinedValues,
  like,
  mutateValues,
  via,
} from "./object.js"

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

  it("does not mutate inherited enumerable properties", () => {
    const proto = { inherited: 1 }
    const obj = Object.create(proto)
    obj.own = 2
    const result = mutateValues(obj, (v) => v + 1)
    expect(result.own).toBe(3)
    expect(result.inherited).toBe(1)
  })
})

describe("deleteUndefinedValues", () => {
  it("removes keys with undefined values", () => {
    const obj = { a: 1, b: undefined, c: 3 }
    const result = deleteUndefinedValues(obj)
    expect(result).toEqual({ a: 1, c: 3 })
    expect(obj).toBe(result)
    expect("b" in result).toBe(false)
  })

  it("does not remove keys with null or falsy non-undefined values", () => {
    const obj = { a: null, b: 0, c: false, d: "", e: undefined }
    deleteUndefinedValues(obj)
    expect(obj).toEqual({ a: null, b: 0, c: false, d: "" })
  })

  it("does nothing if no undefined values are present", () => {
    const obj = { a: 1, b: 2 }
    const result = deleteUndefinedValues(obj)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it("handles empty object", () => {
    const obj = {}
    expect(deleteUndefinedValues(obj)).toEqual({})
  })

  it("removes own properties set to undefined but not inherited ones", () => {
    const proto = { inherited: undefined }
    const obj = Object.create(proto)
    obj.own = undefined
    deleteUndefinedValues(obj)
    expect("own" in obj).toBe(false)
    // inherited property remains accessible via prototype
    expect(obj.inherited).toBeUndefined()
    // but is not an own property
    expect(Object.hasOwn(obj, "inherited")).toBe(false)
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

describe("contains", () => {
  it("returns true when object contains all template keys with same values", () => {
    const template = { a: 1, b: 2 }
    const fn = like(template)
    expect(fn({ a: 1, b: 2, c: 3 })).toBe(true)
    expect(fn({ a: 1, b: 2 })).toBe(true)
  })

  it("returns false if any template key is missing", () => {
    const template = { a: 1, b: 2 }
    const fn = like(template)
    expect(fn({ a: 1 })).toBe(false)
    expect(fn({ b: 2 })).toBe(false)
    expect(fn({})).toBe(false)
  })

  it("returns false if any template key has a different value", () => {
    const template = { a: 1, b: 2 }
    const fn = like(template)
    expect(fn({ a: 1, b: 3 })).toBe(false)
    expect(fn({ a: 2, b: 2 })).toBe(false)
    expect(fn({ a: 2, b: 3 })).toBe(false)
  })

  it("works with empty template (always true)", () => {
    const fn = like({})
    expect(fn({})).toBe(true)
    expect(fn({ a: 1 })).toBe(true)
    expect(fn({ a: undefined })).toBe(true)
  })

  it("does not require object to have only template keys", () => {
    const template = { x: 5 }
    const fn = like(template)
    expect(fn({ x: 5, y: 10 })).toBe(true)
  })

  it("uses strict equality (===) for comparison", () => {
    const template = { a: 0 }
    const fn = like(template)
    expect(fn({ a: false })).toBe(false)
    expect(fn({ a: "0" })).toBe(false)
    expect(fn({ a: 0 })).toBe(true)
  })

  // ISSUE: contains() does not check for own properties only; it will match inherited properties.
  it("matches inherited properties in the object", () => {
    const template = { foo: 1 }
    const fn = like(template)
    const proto = { foo: 1 }
    const obj = Object.create(proto)
    expect(fn(obj)).toBe(true)
    obj.foo = 2
    expect(fn(obj)).toBe(false)
  })
})

describe("deepMerge", () => {
  it("merges flat objects", () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 })
    expect(target).toEqual({ a: 1, b: 3, c: 4 })
  })

  it("deeply merges nested objects", () => {
    const target = { a: { x: 1, y: 2 }, b: 2 }
    const source = { a: { y: 3, z: 4 }, b: 5 }
    expect(deepMerge(target, source)).toEqual({ a: { x: 1, y: 3, z: 4 }, b: 5 })
    expect(target).toEqual({ a: { x: 1, y: 3, z: 4 }, b: 5 })
  })

  it("overwrites arrays instead of merging them", () => {
    const target = { arr: [1, 2], a: 1 }
    const source = { arr: [3, 4] }
    expect(deepMerge(target, source)).toEqual({ arr: [3, 4], a: 1 })
  })

  it("merges multiple sources left-to-right", () => {
    const target = { a: 1 }
    const s1 = { b: 2 }
    const s2 = { a: 3, c: 4 }
    expect(deepMerge(target, s1, s2)).toEqual({ a: 3, b: 2, c: 4 })
  })

  it("does not merge non-object values, just assigns", () => {
    const target = { a: { x: 1 } }
    const source = { a: 2 }
    expect(deepMerge(target, source)).toEqual({ a: 2 })
  })

  it("handles empty sources", () => {
    const target = { a: 1 }
    expect(deepMerge(target)).toEqual({ a: 1 })
    expect(deepMerge(target, {})).toEqual({ a: 1 })
  })

  it("handles empty target", () => {
    const target = {}
    const source = { a: 1 }
    expect(deepMerge(target, source)).toEqual({ a: 1 })
  })

  it("does not merge inherited properties from sources", () => {
    const proto = { x: 1 }
    const source = Object.create(proto)
    source.a = 2
    const target = {}
    expect(deepMerge(target, source)).toEqual({ a: 2 })
    expect("x" in target).toBe(false)
  })

  it("merges deeply with multiple sources", () => {
    const target = { a: { x: 1 } }
    const s1 = { a: { y: 2 } }
    const s2 = { a: { z: 3 } }
    expect(deepMerge(target, s1, s2)).toEqual({ a: { x: 1, y: 2, z: 3 } })
  })

  it("does not merge if source value is null", () => {
    const target = { a: { x: 1 } }
    const source = { a: null }
    expect(deepMerge(target, source)).toEqual({ a: null })
  })

  it("does not merge if target value is null", () => {
    const target = { a: null }
    const source = { a: { x: 1 } }
    expect(deepMerge(target, source)).toEqual({ a: { x: 1 } })
  })

  it("does not merge arrays deeply", () => {
    const target = { a: [1, 2, 3] }
    const source = { a: [4, 5] }
    expect(deepMerge(target, source)).toEqual({ a: [4, 5] })
  })

  it("does not merge non-enumerable properties from source", () => {
    const target = {}
    const source = {}
    Object.defineProperty(source, "hidden", {
      value: 123,
      enumerable: false,
    })
    expect(deepMerge(target, source)).toEqual({})
    expect("hidden" in target).toBe(false)
  })

  it("returns the target object", () => {
    const target = { a: 1 }
    const result = deepMerge(target, { b: 2 })
    expect(result).toBe(target)
  })
})

describe("deepEqual", () => {
  it("returns true for strictly equal primitives", () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual("foo", "foo")).toBe(true)
    expect(deepEqual(true, true)).toBe(true)
    expect(deepEqual(null, null)).toBe(true)
    expect(deepEqual(undefined, undefined)).toBe(true)
  })

  it("returns false for different primitives", () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual("foo", "bar")).toBe(false)
    expect(deepEqual(true, false)).toBe(false)
    expect(deepEqual(null, undefined)).toBe(false)
  })

  it("returns true for deeply equal objects", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(deepEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true)
    expect(deepEqual({}, {})).toBe(true)
  })

  it("returns false for objects with different keys or values", () => {
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
    expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
    expect(deepEqual({ a: 1 }, {})).toBe(false)
    expect(deepEqual({}, { a: 1 })).toBe(false)
  })

  it("returns true for deeply equal arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEqual([], [])).toBe(true)
    expect(deepEqual([[1], [2]], [[1], [2]])).toBe(true)
  })

  it("returns false for arrays with different elements or lengths", () => {
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
    expect(deepEqual([1, 2, 3], [1, 2])).toBe(false)
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false)
  })

  it("returns true if one is array and one is object", () => {
    expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(true)
    expect(deepEqual({ 0: 1, 1: 2 }, [1, 2])).toBe(true)
  })

  it("returns true for objects with same keys in different order", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  })

  it("returns true for nested objects and arrays", () => {
    const a = { foo: [1, { bar: 2 }], baz: { qux: [3] } }
    const b = { foo: [1, { bar: 2 }], baz: { qux: [3] } }
    expect(deepEqual(a, b)).toBe(true)
  })

  it("returns false for nested difference", () => {
    const a = { foo: [1, { bar: 2 }], baz: { qux: [3] } }
    const b = { foo: [1, { bar: 3 }], baz: { qux: [3] } }
    expect(deepEqual(a, b)).toBe(false)
  })

  it("returns false if keys differ in nested objects", () => {
    expect(deepEqual({ a: { b: 1 } }, { a: { c: 1 } })).toBe(false)
  })

  it("returns false if one is null or undefined and the other is object", () => {
    expect(deepEqual(null, {})).toBe(false)
    expect(deepEqual({}, null)).toBe(false)
    expect(deepEqual(undefined, {})).toBe(false)
    expect(deepEqual({}, undefined)).toBe(false)
  })

  it("returns true for self-references (same object)", () => {
    const obj = { a: 1 }
    expect(deepEqual(obj, obj)).toBe(true)
    const arr = [1, 2]
    expect(deepEqual(arr, arr)).toBe(true)
  })

  it("returns false for objects with different number of keys", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  it("returns true if object keys match but values are objects of different types", () => {
    expect(deepEqual({ a: [1, 2] }, { a: { 0: 1, 1: 2 } })).toBe(true)
  })

  it("returns false for objects with missing keys", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
  })

  it("returns true for objects with undefined values if both have them", () => {
    expect(deepEqual({ a: undefined }, { a: undefined })).toBe(true)
  })

  it("returns false if one object has undefined key and the other doesn't", () => {
    expect(deepEqual({ a: undefined }, {})).toBe(false)
    expect(deepEqual({}, { a: undefined })).toBe(false)
  })
})
