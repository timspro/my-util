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
