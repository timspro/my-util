/**
 * Mutates the passed in object by calling callback on each of its values.
 * @param {Object} object
 * @param {Function} callback (value, key, object) => newValue // note if not changing value, should return value
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
 * Deeply merges one or more source objects into a target object.
 * If the property values are objects, they are merged recursively.
 * Non-object properties (including arrays) are directly assigned to the target.
 * @param {Object} target The target object that will receive the merged properties.
 * @param {...Object} sources The source objects whose properties will be merged into the target.
 * @returns {Object} The target object with the merged properties from all source objects.
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
        targetValue &&
        typeof targetValue === "object" &&
        sourceValue &&
        typeof sourceValue === "object"
      ) {
        deepMerge(targetValue, sourceValue)
      } else {
        target[key] = sourceValue
      }
    }
  }
  return target
}
