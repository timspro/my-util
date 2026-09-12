/**
 * Returns if the argument is an object: `typeof thing === "object" && thing !== null`.
 * This includes arrays as well as built-in objects that store state outside enumerable keys (Date, RegExp, Map, Set).
 * See isPlainObject() to exclude those.
 * @param {any} thing
 * @returns {boolean}
 */
export function isObject(thing) {
  return typeof thing === "object" && thing !== null
}

/**
 * Checks if the argument is a built-in object that has state outside of enumerable keys.
 * Within standard JS, this would be a: Array, Date, RegExp, Map, or Set.
 * Stateful built-in objects generally do not work cleanly with "Object" static methods such as Object.keys() or Object.assign().
 * @param {any} thing
 * @returns {boolean}
 */
export function isStatefulBuiltinObject(thing) {
  return (
    Array.isArray(thing) ||
    thing instanceof Date ||
    thing instanceof RegExp ||
    thing instanceof Map ||
    thing instanceof Set
  )
}

/**
 * Returns if the argument is a "plain" object: a non-array object that stores its state in enumerable keys.
 * See isStatefulObject() for explanation of objects that aren't plain objects.
 * @param {any} thing
 * @returns {boolean}
 */
export function isPlainObject(thing) {
  return isObject(thing) && !isStatefulBuiltinObject(thing)
}

/**
 * Creates a new object with values created by calling callback on each of argument's values.
 * @param {Object} object
 * @param {MyUtil.ObjectMapper} callback
 *  Note if not changing value, should return value.
 * @returns {Object}
 */
export function mapValues(object, callback) {
  const result = Object.create(null)
  const keys = Object.keys(object)
  for (const key of keys) {
    result[key] = callback(object[key], key, object)
  }
  return result
}

/**
 * Mutates the passed in object by calling callback on each of its values.
 * @param {Object} object
 * @param {MyUtil.ObjectMapper} callback
 *  Note if not changing value, should return value.
 * @returns {Object}
 */
export function mutateValues(object, callback) {
  const keys = Object.keys(object)
  for (const key of keys) {
    object[key] = callback(object[key], key, object)
  }
  return object
}

/**
 * Mutates the passed object by removing any keys (`key in object`) that have a value of undefined.
 * This is useful when the presence of a key alone causes something else to happen, but an undefined value is unexpected.
 * In general, having objects with undefined values should not be encouraged but can happen as a byproduct of a code flow.
 * @param {Object} object
 * @returns {Object}
 */
export function deleteUndefinedValues(object) {
  const keys = Object.keys(object)
  for (const key of keys) {
    if (key in object && object[key] === undefined) {
      delete object[key]
    }
  }
  return object
}

/**
 * Creates a function that accesses an object's value at key.
 * @template T
 * @param {keyof T} key
 * @returns {(_: T) => T[keyof T]}
 */
export function via(key) {
  return (object) => object[key]
}

/**
 * Creates a function that checks if the passed object contains the initial template.
 * This means for each key in the template, the passed object has its own same (===) value (not inherited).
 * @template T
 * @param {Partial<T>} template
 * @returns {(_: T) => boolean}
 */
export function like(template) {
  const keys = Object.keys(template)
  return (object) => {
    for (const key of keys) {
      // @ts-ignore Doesn't understand that T is an object
      if (object[key] !== template[key] || !Object.hasOwn(object, key)) {
        return false
      }
    }
    return true
  }
}

/**
 * Copies the source recursively.
 * Does not preserve constructors of source or constructors of its keys' values,
 *   except for stateful built-ins, which are copied into equivalent new instances (see isStatefulBuiltinObject).
 * @template T
 * @param {T} source
 * @returns {T}
 */
export function deepCopy(source) {
  // check for stateful built-ins first
  if (Array.isArray(source)) {
    // @ts-ignore Doesn't understand returned as T
    return source.map(deepCopy)
  }
  if (source instanceof Date) {
    // @ts-ignore Doesn't understand returned as T
    return new Date(source.getTime())
  }
  if (source instanceof RegExp) {
    // @ts-ignore Doesn't understand returned as T
    return new RegExp(source.source, source.flags)
  }
  if (source instanceof Map) {
    // @ts-ignore Doesn't understand returned as T
    return new Map([...source].map(([key, value]) => [deepCopy(key), deepCopy(value)]))
  }
  if (source instanceof Set) {
    // @ts-ignore Doesn't understand returned as T
    return new Set([...source].map(deepCopy))
  }
  if (isPlainObject(source)) {
    // custom class instances land here too (walked by key, losing their constructor - see above)
    return mapValues(source, deepCopy)
  }
  // primitive or function
  return source
}

/**
 * Deeply merges one or more source objects into a target object.
 * Specifically:
 *  For each enumerable key of a source object that is a direct property (not inherited),
 *    If the source key's values is a plain object and the target key's value is a plain object,
 *      recursively merge the two values.
 * Stateful built-in objects (including arrays) are never merged; they always replace the target's key's value outright.
 * @param {Object} target The target object that will receive the merged properties
 * @param {...Object} sources The source objects whose properties will be merged into the target
 * @returns {Object} The target object with the merged properties from all source objects
 */
export function deepMerge(target, ...sources) {
  for (const source of sources) {
    const keys = Object.keys(source)
    for (const key of keys) {
      const targetValue = target[key]
      const sourceValue = source[key]
      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        deepMerge(targetValue, sourceValue)
      } else {
        target[key] = sourceValue
      }
    }
  }
  return target
}

/**
 * Merges a deep copy of each source object into target. See deepCopy() and deepMerge() documentation for caveats.
 * @param {Object} target The target object that will receive the merged properties
 * @param {...Object} sources The source objects whose properties will be merged into the returned object
 * @returns {Object}
 */
export function deepMergeCopy(target, ...sources) {
  const copies = sources.map(deepCopy)
  const result = deepMerge(target, ...copies)
  return result
}

/**
 * Checks if two arrays are equal: same size and same keys and values. Assumes both arguments are arrays.
 * @param {Array} a
 * @param {Array} b
 * @param {(_a: any, _b: any) => boolean} compare Determines equality of values.
 *  By default, uses `Object.is` for a reference/primitive comparison.
 * @returns {boolean}
 */
export function isArrayEqual(a, b, compare = Object.is) {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (!compare(a[i], b[i])) {
      return false
    }
  }
  return true
}

/**
 * Checks if two Dates are equal, by getTime(). Assumes both arguments are Dates.
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 */
export function isDateEqual(a, b) {
  return a.getTime() === b.getTime()
}

/**
 * Checks if two RegExps are equal, by source and flags. Assumes both arguments are RegExps.
 * @param {RegExp} a
 * @param {RegExp} b
 * @returns {boolean}
 */
export function isRegExpEqual(a, b) {
  return a.source === b.source && a.flags === b.flags
}

/**
 * Checks if two Maps are equal: same size and same keys and values. Assumes both arguments are Maps.
 * @param {Map} a
 * @param {Map} b
 * @param {(_a: any, _b: any) => boolean} compare Determines equality of values.
 *  By default, uses `Object.is` for a reference/primitive comparison.
 * @returns {boolean}
 */
export function isMapEqual(a, b, compare = Object.is) {
  if (a.size !== b.size) {
    return false
  }
  for (const [key, value] of a) {
    if (!b.has(key) || !compare(value, b.get(key))) {
      return false
    }
  }
  return true
}

/**
 * Checks if two Sets are equal: same size and membership. Assumes both arguments are Sets.
 * @param {Set} a
 * @param {Set} b
 * @returns {boolean}
 */
export function isSetEqual(a, b) {
  if (a.size !== b.size) {
    return false
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false
    }
  }
  return true
}

/**
 * Deeply compares two values to determine if they are equal.
 * Objects compared recursively by their properties and elements.
 * Stateful built-ins are compared with bespoke isXXXEqual() logic (see isStatefulBuiltinObject).
 * Primitives are compared with strict equality.
 * Caveats:
 *  Any `Symbol` keys in the arguments are ignored (Object.keys only returns string keys).
 * @param {any} a The first value to compare
 * @param {any} b The second value to compare
 * @returns {boolean} True if the values are deeply equal, false otherwise
 */
// eslint-disable-next-line complexity
export function deepEqual(a, b) {
  if (a === b) {
    return true
  }
  // check for stateful built-ins first
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && isArrayEqual(a, b, deepEqual)
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && isDateEqual(a, b)
  }
  if (a instanceof RegExp || b instanceof RegExp) {
    return a instanceof RegExp && b instanceof RegExp && isRegExpEqual(a, b)
  }
  if (a instanceof Map || b instanceof Map) {
    return a instanceof Map && b instanceof Map && isMapEqual(a, b, deepEqual)
  }
  if (a instanceof Set || b instanceof Set) {
    return a instanceof Set && b instanceof Set && isSetEqual(a, b)
  }
  if (!isObject(a) || !isObject(b)) {
    return false
  }
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) {
    return false
  }
  for (const key of keysA) {
    if (!Object.hasOwn(b, key)) {
      return false
    }
    if (!deepEqual(a[key], b[key])) {
      return false
    }
  }
  return true
}

/**
 * Checks if the argument is a class.
 * Example: `isClass(class {})`
 * Returns: true
 * In general, this will only work for third-party or user-defined classes, not built-ins.
 * @param {any} thing
 * @returns {boolean}
 */
export function isClass(thing) {
  if (typeof thing !== "function") {
    return false
  }
  const stringified = Function.prototype.toString.call(thing)
  const result = /^class\s/u.test(stringified)
  return result
}
