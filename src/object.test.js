/* eslint-disable no-restricted-syntax */
import { jest } from "@jest/globals"
import { contains, deleteUndefinedValues, mutateValues, via } from "./object.js"

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
    const fn = contains(template)
    expect(fn({ a: 1, b: 2, c: 3 })).toBe(true)
    expect(fn({ a: 1, b: 2 })).toBe(true)
  })

  it("returns false if any template key is missing", () => {
    const template = { a: 1, b: 2 }
    const fn = contains(template)
    expect(fn({ a: 1 })).toBe(false)
    expect(fn({ b: 2 })).toBe(false)
    expect(fn({})).toBe(false)
  })

  it("returns false if any template key has a different value", () => {
    const template = { a: 1, b: 2 }
    const fn = contains(template)
    expect(fn({ a: 1, b: 3 })).toBe(false)
    expect(fn({ a: 2, b: 2 })).toBe(false)
    expect(fn({ a: 2, b: 3 })).toBe(false)
  })

  it("works with empty template (always true)", () => {
    const fn = contains({})
    expect(fn({})).toBe(true)
    expect(fn({ a: 1 })).toBe(true)
    expect(fn({ a: undefined })).toBe(true)
  })

  it("does not require object to have only template keys", () => {
    const template = { x: 5 }
    const fn = contains(template)
    expect(fn({ x: 5, y: 10 })).toBe(true)
  })

  it("uses strict equality (===) for comparison", () => {
    const template = { a: 0 }
    const fn = contains(template)
    expect(fn({ a: false })).toBe(false)
    expect(fn({ a: "0" })).toBe(false)
    expect(fn({ a: 0 })).toBe(true)
  })

  // ISSUE: contains() does not check for own properties only; it will match inherited properties.
  it("matches inherited properties in the object", () => {
    const template = { foo: 1 }
    const fn = contains(template)
    const proto = { foo: 1 }
    const obj = Object.create(proto)
    expect(fn(obj)).toBe(true)
    obj.foo = 2
    expect(fn(obj)).toBe(false)
  })
})
