/**
 * Returns if the argument is an object: `typeof thing === "object" && thing !== null`.
 * This includes built-in objects that store state outside enumerable keys such as Array and Date.
 * See isPlainObject() to exclude those.
 * @param {any} thing
 * @returns {boolean}
 */
export function isObject(thing) {
  return typeof thing === "object" && thing !== null
}

/**
 * Returns if the argument is a "plain" object: an object that stores its state in enumerable keys.
 * Specifically, this excludes: Array, Map, Set, RegExp, Error, Date.
 * @param {any} thing
 * @returns {boolean}
 */
export function isPlainObject(thing) {
  return (
    isObject(thing) &&
    !Array.isArray(thing) &&
    !(thing instanceof Map) &&
    !(thing instanceof Set) &&
    !(thing instanceof RegExp) &&
    !(thing instanceof Error) &&
    !(thing instanceof Date)
  )
}

/**
 * Creates a new null-prototyped object with values created by calling callback on each of argument's values.
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
 * Does not preserve constructors of source or constructors of its keys' values.
 * All returned plain objects have null prototypes. See isPlainObject() for more info.
 * Stateful built-ins and functions are copied by reference. Consider structuredClone() to handle stateful built-ins.
 * @template T
 * @param {T} source
 * @returns {T}
 */
export function deepCopy(source) {
  if (Array.isArray(source)) {
    // @ts-ignore Doesn't understand returned as T
    return source.map(deepCopy)
  }
  if (isPlainObject(source)) {
    return mapValues(source, deepCopy)
  }
  // primitive, function, stateful built-ins
  return source
}

/**
 * Deeply merges one or more source objects into a target object.
 * Specifically:
 *  For each enumerable key of a source object that is a direct property (not inherited),
 *    If the source key's values is a plain object and the target key's own value is a plain object (not inherited),
 *      recursively merge the two values. See isPlainObject() for more info.
 *    Otherwise, write the source key's value directly into target object (using defineProperty, skipping setters).
 * @param {Object} target The target object that will receive the merged properties
 * @param {...Object} sources The source objects whose properties will be merged into the target.
 *  Note that earlier sources can be modified by merging in later sources. Use deepMergeCopy() instead if that is an issue.
 * @returns {Object} The target object with the merged properties from all source objects
 */
export function deepMerge(target, ...sources) {
  for (const source of sources) {
    const keys = Object.keys(source)
    for (const key of keys) {
      // don't merge into inherited properties that are objects
      const targetValue = Object.hasOwn(target, key) ? target[key] : undefined
      const sourceValue = source[key]
      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        deepMerge(targetValue, sourceValue)
      } else {
        // always write directly to target (i.e. if key is "__proto__")
        Object.defineProperty(target, key, {
          value: sourceValue,
          writable: true,
          enumerable: true,
          configurable: true,
        })
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
 * Deeply compares two values to determine if they are equal.
 * Primitives are compared with strict equality. NaN can deeply equal NaN.
 * Date objects are compared explicitly based on .getTime().
 * All non-Date objects are simply compared recursively by their enumerable properties.
 * Additionally, arrays can only ever equal other arrays (i.e [] !== {}).
 * There is no exclusion of other stateful built-in classes such as Map, Set, RegExp, or Error.
 *  These will equal each other and {} since they don't have enumerable properties.
 * @param {any} a The first value to compare
 * @param {any} b The second value to compare
 * @returns {boolean} True if the values are deeply equal, false otherwise
 */
// eslint-disable-next-line complexity
export function deepEqual(a, b) {
  if (a === b) {
    return true
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
  }
  if (typeof a === "number" && typeof b === "number") {
    return isNaN(a) && isNaN(b)
  }
  if (!isObject(a) || !isObject(b)) {
    return false
  }
  if ((Array.isArray(a) && !Array.isArray(b)) || (Array.isArray(b) && !Array.isArray(a))) {
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
