/* eslint-disable no-empty-function */
import { describe, expect, it, vi } from "vitest"
import {
  deepCopy,
  deepEqual,
  deepMerge,
  deepMergeCopy,
  deleteUndefinedValues,
  isClass,
  isObject,
  isPlainObject,
  like,
  mapValues,
  mutateValues,
  via,
} from "./object.js"

// --- isObject ---
describe("isObject", () => {
  it("returns true for plain objects", () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  it("returns true for arrays", () => {
    expect(isObject([])).toBe(true)
    expect(isObject([1, 2])).toBe(true)
  })

  it("returns false for null", () => {
    expect(isObject(null)).toBe(false)
  })

  it("returns false for primitives", () => {
    expect(isObject(1)).toBe(false)
    expect(isObject("str")).toBe(false)
    expect(isObject(true)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject(Symbol("blah"))).toBe(false)
  })

  it("returns false for functions", () => {
    expect(isObject(() => {})).toBe(false)
    // eslint-disable-next-line func-names, prefer-arrow-callback
    expect(isObject(function () {})).toBe(false)
  })
})

// --- isPlainObject ---
describe("isPlainObject", () => {
  it("returns true for plain objects", () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
  })

  it("returns true for custom class instances", () => {
    class Foo {
      constructor() {
        this.x = 1
      }
    }
    expect(isPlainObject(new Foo())).toBe(true)
  })

  it("returns false for arrays", () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject([1, 2])).toBe(false)
  })

  it("returns false for Dates, RegExps, Maps, Sets, and Errors", () => {
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(/abc/u)).toBe(false)
    expect(isPlainObject(new Map())).toBe(false)
    expect(isPlainObject(new Set())).toBe(false)
    expect(isPlainObject(new Error("x"))).toBe(false)
    expect(isPlainObject(new TypeError("x"))).toBe(false)
  })

  it("returns false for null", () => {
    expect(isPlainObject(null)).toBe(false)
  })

  it("returns false for primitives and functions", () => {
    expect(isPlainObject(1)).toBe(false)
    expect(isPlainObject("str")).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(() => {})).toBe(false)
  })
})

// --- mapValues ---
describe("mapValues", () => {
  it("maps values in the object using the callback", () => {
    const obj = { a: 1, b: 2 }
    const result = mapValues(obj, (v) => v * 2)
    expect(result).toEqual({ a: 2, b: 4 })
    // original object is not mutated
    expect(obj).toEqual({ a: 1, b: 2 })
  })

  it("callback receives value, key, and object", () => {
    const obj = { x: 1 }
    const cb = vi.fn((v) => v + 1)
    mapValues(obj, cb)
    expect(cb).toHaveBeenCalledWith(1, "x", obj)
  })

  it("returns a new object", () => {
    const obj = { foo: "bar" }
    const returned = mapValues(obj, (v) => v)
    expect(returned).not.toBe(obj)
    expect(returned).toEqual(obj)
  })

  it("handles empty object", () => {
    const obj = {}
    expect(mapValues(obj, (v) => v)).toEqual({})
  })

  it("does not map inherited enumerable properties", () => {
    const proto = { inherited: 1 }
    const obj = Object.create(proto)
    obj.own = 2
    const result = mapValues(obj, (v) => v + 1)
    expect(result).toEqual({ own: 3 })
    expect(result.inherited).toBeUndefined()
  })
})

// --- mutateValues ---
describe("mutateValues", () => {
  it("mutates values in the object using the callback", () => {
    const obj = { a: 1, b: 2 }
    const result = mutateValues(obj, (v) => v * 2)
    expect(result).toEqual({ a: 2, b: 4 })
    expect(obj).toBe(result) // should mutate in place
  })

  it("callback receives value, key, and object", () => {
    const obj = { x: 1 }
    const cb = vi.fn((v) => v + 1)
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

// --- deleteUndefinedValues ---
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

// --- via ---
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

// --- like ---
describe("like", () => {
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

  it("does not match a template key that is only inherited, not own", () => {
    const template = { foo: 1 }
    const fn = like(template)
    const proto = { foo: 1 }
    const obj = Object.create(proto)
    expect(fn(obj)).toBe(false)
    obj.foo = 1
    expect(fn(obj)).toBe(true)
  })
})

// --- deepCopy ---
describe("deepCopy", () => {
  it("copies primitives as is", () => {
    expect(deepCopy(1)).toBe(1)
    expect(deepCopy("str")).toBe("str")
    expect(deepCopy(null)).toBe(null)
    expect(deepCopy(undefined)).toBe(undefined)
    const sym = Symbol("x")
    expect(deepCopy(sym)).toBe(sym)
  })

  it("copies arrays recursively", () => {
    const arr = [1, { a: 2 }, [3, 4]]
    const copy = deepCopy(arr)
    expect(copy).toEqual(arr)
    expect(copy).not.toBe(arr)
    expect(copy[1]).not.toBe(arr[1])
    expect(copy[2]).not.toBe(arr[2])
  })

  it("copies objects recursively", () => {
    const obj = { a: { b: 2 }, c: [1, 2] }
    const copy = deepCopy(obj)
    expect(copy).toEqual(obj)
    expect(copy).not.toBe(obj)
    expect(copy.a).not.toBe(obj.a)
    expect(copy.c).not.toBe(obj.c)
  })

  it("does not preserve constructors", () => {
    function Foo() {
      this.x = 1
    }
    const foo = new Foo()
    const copy = deepCopy(foo)
    expect(copy).toEqual({ x: 1 })
    // The constructor is not preserved
    expect(copy instanceof Foo).toBe(false)
  })

  it("copies empty object/array", () => {
    expect(deepCopy({})).toEqual({})
    expect(deepCopy([])).toEqual([])
  })

  it("copies nested structures", () => {
    const obj = { a: [{ b: 2 }, { c: [3] }] }
    const copy = deepCopy(obj)
    expect(copy).toEqual(obj)
    expect(copy.a[0]).not.toBe(obj.a[0])
    expect(copy.a[1].c).not.toBe(obj.a[1].c)
  })

  it("copies functions as is (does not clone)", () => {
    const fn = () => 42
    expect(deepCopy(fn)).toBe(fn)
  })

  it("returns stateful built-ins by reference", () => {
    const source = {
      date: new Date(2020, 1, 1),
      regex: /abc/giu,
      map: new Map([["a", { x: 1 }]]),
      set: new Set([{ x: 1 }]),
      error: new Error("x"),
    }
    const copy = deepCopy(source)
    expect(copy).not.toBe(source)
    expect(copy.date).toBe(source.date)
    expect(copy.regex).toBe(source.regex)
    expect(copy.map).toBe(source.map)
    expect(copy.set).toBe(source.set)
    expect(copy.error).toBe(source.error)
  })

  it("returns plain objects with null prototypes and arrays as regular arrays", () => {
    const copy = deepCopy({ a: { b: 1 }, c: [{ d: 2 }] })
    expect(Object.getPrototypeOf(copy)).toBe(null)
    expect(Object.getPrototypeOf(copy.a)).toBe(null)
    expect(Array.isArray(copy.c)).toBe(true)
    expect(Object.getPrototypeOf(copy.c[0])).toBe(null)
  })
})

// --- deepMerge ---
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

  it("shadows an inherited target property with an own property from the source", () => {
    const proto = { a: 1 }
    const target = Object.create(proto)
    const source = { a: 2 }
    deepMerge(target, source)
    expect(Object.hasOwn(target, "a")).toBe(true)
    expect(target.a).toBe(2)
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

  it("assigns object over array if source value is object and target value is array", () => {
    const target = { a: [1, 2] }
    const source = { a: { x: 3 } }
    expect(deepMerge(target, source)).toEqual({ a: { x: 3 } })
  })

  it("assigns array over object if source value is array and target value is object", () => {
    const target = { a: { x: 1 } }
    const source = { a: [2, 3] }
    expect(deepMerge(target, source)).toEqual({ a: [2, 3] })
  })

  it("recursively merges only non-array objects", () => {
    const target = { a: { b: 1 }, arr: { x: 1 } }
    const source = { a: { c: 2 }, arr: [1, 2] }
    expect(deepMerge(target, source)).toEqual({ a: { b: 1, c: 2 }, arr: [1, 2] })
  })

  it("replaces a target Date with the source Date instead of merging into it", () => {
    const target = { d: new Date(2020, 1, 1) }
    const newDate = new Date(2021, 1, 1)
    const source = { d: newDate }
    expect(deepMerge(target, source)).toEqual({ d: newDate })
    expect(target.d).toBe(newDate)
  })

  it("replaces a target Map with the source Map instead of merging into it", () => {
    const target = { m: new Map([["a", 1]]) }
    const newMap = new Map([["b", 2]])
    const source = { m: newMap }
    expect(deepMerge(target, source)).toEqual({ m: newMap })
    expect(target.m).toBe(newMap)
  })

  it("does not pollute Object.prototype via a __proto__ key", () => {
    try {
      deepMerge({}, JSON.parse('{"__proto__": {"polluted": "yes"}}'))
      deepMerge({ a: {} }, JSON.parse('{"a": {"__proto__": {"pollutedNested": "yes"}}}'))
      expect({}.polluted).toBeUndefined()
      expect({}.pollutedNested).toBeUndefined()
    } finally {
      delete Object.prototype.polluted
      delete Object.prototype.pollutedNested
    }
  })

  it("writes a __proto__ key as an own property instead of changing the target's prototype", () => {
    const withObject = deepMerge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'))
    expect(Object.getPrototypeOf(withObject)).toBe(Object.prototype)
    expect(withObject.isAdmin).toBeUndefined()
    expect(Object.hasOwn(withObject, "__proto__")).toBe(true)

    const withArray = deepMerge({}, JSON.parse('{"__proto__": [1, 2, 3]}'))
    expect(Object.getPrototypeOf(withArray)).toBe(Object.prototype)
    expect(withArray.length).toBeUndefined()

    const withNull = deepMerge({}, JSON.parse('{"__proto__": null}'))
    expect(Object.getPrototypeOf(withNull)).toBe(Object.prototype)
  })

  it("does not merge into a plain object inherited by the target", () => {
    const defaults = { settings: { color: "red" } }
    const target = Object.create(defaults)
    const other = Object.create(defaults)
    deepMerge(target, { settings: { size: 1 } })
    expect(defaults.settings).toEqual({ color: "red" })
    expect(other.settings).toEqual({ color: "red" })
    expect(Object.hasOwn(target, "settings")).toBe(true)
    expect(target.settings).toEqual({ size: 1 })
  })

  it("does not invoke setters on the target", () => {
    const set = vi.fn()
    const target = {}
    Object.defineProperty(target, "a", { set, configurable: true, enumerable: true })
    deepMerge(target, { a: 1 })
    expect(set).not.toHaveBeenCalled()
    expect(target.a).toBe(1)
  })

  it("can modify nested objects contributed by earlier sources", () => {
    const s1 = { a: { x: 1 } }
    const s2 = { a: { y: 2 } }
    const target = deepMerge({}, s1, s2)
    expect(target.a).toBe(s1.a)
    expect(s1).toEqual({ a: { x: 1, y: 2 } })
  })
})

// --- deepMergeCopy ---
describe("deepMergeCopy", () => {
  it("deeply merges deep copies of sources into the target", () => {
    const target = { a: { b: 1 } }
    const s1 = { a: { c: 2 } }
    const s2 = { a: { d: 3 } }
    const origTarget = JSON.stringify(target)
    const merged = deepMergeCopy(target, s1, s2)
    expect(merged).toEqual({ a: { b: 1, c: 2, d: 3 } })
    expect(merged).toBe(target)
    expect(merged.a).not.toBe(s1.a)
    expect(merged.a).not.toBe(s2.a)
    expect(JSON.stringify(target)).not.toBe(origTarget)
    expect(s1).toEqual({ a: { c: 2 } })
    expect(s2).toEqual({ a: { d: 3 } })
  })

  it("does not mutate source objects", () => {
    const target = { a: 1 }
    const s1 = { b: 2 }
    const s2 = { c: 3 }
    const orig1 = JSON.stringify(s1)
    const orig2 = JSON.stringify(s2)
    deepMergeCopy(target, s1, s2)
    expect(JSON.stringify(s1)).toBe(orig1)
    expect(JSON.stringify(s2)).toBe(orig2)
  })

  it("handles arrays and primitives in sources", () => {
    const target = { a: [1, 2] }
    const s1 = { a: [3, 4], b: 5 }
    expect(deepMergeCopy(target, s1)).toEqual({ a: [3, 4], b: 5 })
  })

  it("returns the target object", () => {
    const target = { x: 1 }
    const s1 = { y: 2 }
    expect(deepMergeCopy(target, s1)).toBe(target)
  })

  it("merges nothing if no sources provided (returns target as is)", () => {
    const target = { foo: 1 }
    expect(deepMergeCopy(target)).toBe(target)
    expect(target).toEqual({ foo: 1 })
  })

  it("returns target if called with no arguments", () => {
    expect(deepMergeCopy({})).toEqual({})
    expect(deepMergeCopy()).toEqual(undefined)
  })

  it("does not mutate the target if no sources are provided", () => {
    const target = { z: 9 }
    const result = deepMergeCopy(target)
    expect(result).toBe(target)
    expect(result).toEqual({ z: 9 })
  })

  it("does not merge inherited properties from sources", () => {
    const target = {}
    const proto = { x: 1 }
    const s1 = Object.create(proto)
    s1.a = 2
    deepMergeCopy(target, s1)
    expect(target).toEqual({ a: 2 })
    expect("x" in target).toBe(false)
  })

  it("does not pollute Object.prototype via a __proto__ key", () => {
    try {
      const target = deepMergeCopy({}, JSON.parse('{"__proto__": {"polluted": "yes"}}'))
      expect({}.polluted).toBeUndefined()
      expect(Object.getPrototypeOf(target)).toBe(Object.prototype)
    } finally {
      delete Object.prototype.polluted
    }
  })

  it("does not modify nested objects of earlier sources", () => {
    const s1 = { a: { x: 1 } }
    const s2 = { a: { y: 2 } }
    expect(deepMergeCopy({}, s1, s2)).toEqual({ a: { x: 1, y: 2 } })
    expect(s1).toEqual({ a: { x: 1 } })
  })
})

// --- deepEqual ---
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

  it("returns false if one is array and one is plain object, even with matching keys/values", () => {
    expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false)
    expect(deepEqual({ 0: 1, 1: 2 }, [1, 2])).toBe(false)
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

  it("returns false if a nested value is an array on one side and a plain object on the other", () => {
    expect(deepEqual({ a: [1, 2] }, { a: { 0: 1, 1: 2 } })).toBe(false)
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

  it("compares Dates by getTime(), not by enumerable keys", () => {
    expect(deepEqual(new Date(2020, 1, 1), new Date(2020, 1, 1))).toBe(true)
    expect(deepEqual(new Date(2020, 1, 1), new Date(2021, 1, 1))).toBe(false)
  })

  it("returns false when only one side is a Date", () => {
    expect(deepEqual(new Date(2020, 1, 1), {})).toBe(false)
    expect(deepEqual({}, new Date(2020, 1, 1))).toBe(false)
  })

  it("treats NaN as deeply equal to NaN", () => {
    expect(deepEqual(NaN, NaN)).toBe(true)
    expect(deepEqual([NaN], [NaN])).toBe(true)
    expect(deepEqual({ a: NaN }, { a: NaN })).toBe(true)
    expect(deepEqual(NaN, 0)).toBe(false)
  })

  it("compares Maps, Sets, RegExps, and Errors only by enumerable keys", () => {
    expect(deepEqual(new Map([["a", 1]]), new Map([["b", 2]]))).toBe(true)
    expect(deepEqual(new Set([1]), new Set([2]))).toBe(true)
    expect(deepEqual(/abc/u, /xyz/u)).toBe(true)
    expect(deepEqual(new Error("a"), new Error("b"))).toBe(true)
    expect(deepEqual(new Map(), {})).toBe(true)
  })
})

// --- isClass ---
describe("isClass", () => {
  it("returns true for class declarations and expressions", () => {
    class A {}
    const B = class {}
    expect(isClass(A)).toBe(true)
    expect(isClass(B)).toBe(true)
  })

  it("returns false for non-class functions", () => {
    function f() {}
    const g = () => {}
    async function af() {}
    function* gf() {}
    expect(isClass(f)).toBe(false)
    expect(isClass(g)).toBe(false)
    expect(isClass(af)).toBe(false)
    expect(isClass(gf)).toBe(false)
  })

  it("returns false for built-in constructors and non-functions", () => {
    // Built-ins typically stringify as 'function X() { [native code] }'
    expect(isClass(Date)).toBe(false)
    expect(isClass(Map)).toBe(false)
    expect(isClass(123)).toBe(false)
    expect(isClass({})).toBe(false)
    expect(isClass(null)).toBe(false)
  })
})
