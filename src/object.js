/**
 * Returns if the argument is an object.
 * @param {any} thing
 * @returns {boolean}
 */
export function isObject(thing) {
  return typeof thing === "object" && thing !== null
}

/**
 * Creates a new object with values created by calling callback on each of argument's values.
 * @param {Object} object
 * @param {Function} callback (value, key, object) => newValue
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
 * @param {Function} callback (value, key, object) => newValue
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
 * @param {string} key
 * @returns {Function}
 */
export function via(key) {
  return (object) => object[key]
}

/**
 * Creates a function that checks if the passed object contains the initial template.
 * This means for each key in the template, the passed object has the same (===) value.
 * @param {Object} template
 * @returns {Function}
 */
export function like(template) {
  const keys = Object.keys(template)
  return (object) => {
    for (const key of keys) {
      if (object[key] !== template[key]) {
        return false
      }
    }
    return true
  }
}

/**
 * Copies the source recursively.
 * Does not preserve constructors of source or constructors of its keys' values.
 * Preserves distinction between an array and an object i.e. `[1]` and `{"0": 1}`.
 * @template T
 * @param {T} source
 * @returns {T}
 */
export function deepCopy(source) {
  if (Array.isArray(source)) {
    return source.map(deepCopy)
  }
  if (isObject(source)) {
    return mapValues(source, deepCopy)
  }
  // primitive or function
  return source
}

/**
 * Deeply merges one or more source objects into a target object.
 * Specifically:
 *  If the target object has the key and the target's key's value is an non-array object AND
 *    the source object's value is a non-array object, recursively merges the source into the target.
 *  Otherwise, assigns source's key's value into the target's key.
 * This means that arrays are never merged into arrays or other objects.
 * @param {Object} target The target object that will receive the merged properties
 * @param {...Object} sources The source objects whose properties will be merged into the target
 * @returns {Object} The target object with the merged properties from all source objects
 */
export function deepMerge(target, ...sources) {
  for (const source of sources) {
    const keys = Object.keys(source)
    for (const key of keys) {
      if (!Object.hasOwn(source, key)) {
        continue
      }
      const targetValue = target[key]
      const sourceValue = source[key]
      if (Array.isArray(sourceValue)) {
        target[key] = sourceValue
      } else if (
        isObject(targetValue) &&
        isObject(sourceValue) &&
        !Array.isArray(targetValue)
      ) {
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
 * Deeply compares two values to determine if they are equal.
 * Objects and arrays are compared recursively by their properties and elements.
 * Primitives are compared with strict equality.
 * Caveats:
 *  Does not check class: `[1]` is considered equal to `{"0": 1}`.
 *  Any `Symbol` keys in the arguments are ignored (Object.keys only returns string keys).
 * @param {any} a The first value to compare
 * @param {any} b The second value to compare
 * @returns {boolean} True if the values are deeply equal, false otherwise
 */
export function deepEqual(a, b) {
  if (a === b) {
    return true
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
