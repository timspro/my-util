/**
 * Converts an array into an array of arrays, where each subarray has a maximum size of chunkSize.
 * Note the last subarray may have a length less than chunkSize.
 * @param {Array} array
 * @param {number=} chunkSize If not provided, defaults to the length of array, returning the input array as one chunk.
 * @returns {Array}
 */
export function chunk(array, chunkSize = array.length) {
  if (!array.length) {
    return []
  }
  if (chunkSize <= 0 || chunkSize % 1 !== 0) {
    throw new Error("chunkSize must be a positive integer")
  }
  const chunked = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunked.push(array.slice(i, i + chunkSize))
  }
  return chunked
}

/**
 * Shorthand for returning all unique elements in an array.
 * @param {Array} array
 * @returns {Array}
 */
export function unique(array) {
  return [...new Set(array)]
}

/**
 * Mutates the passed in object by calling callback on each of its values.
 * @param {Object} object
 * @param {Function} callback (value, key, object) => newValue // note if not changing value, should return value
 * @returns {Object}
 */
export function mutateValues(object, callback) {
  for (const key in object) {
    object[key] = callback(object[key], key, object)
  }
  return object
}

// sorts undefined and null to the end if applicable
function compareUndefinedNull(a, b) {
  if (b === undefined || b === null) {
    if (a === undefined || a === null) {
      return 0
    }
    return -1
  } else if (a === undefined || a === null) {
    return 1
  }
  return undefined
}

/**
 * Returns an "ascending" comparator, via "<", to be used to sort an array.
 * Undefined or null values are always sorted to the end.
 * @param {String=} key If sorting objects, can specify a key to use to compare.
 * @returns {Function}
 */
export function ascending(key) {
  if (!key) {
    return (a, b) => {
      return compareUndefinedNull(a, b) ?? (a < b ? -1 : b < a ? 1 : 0)
    }
  }
  return (a, b) => {
    return (
      compareUndefinedNull(a[key], b[key]) ?? (a[key] < b[key] ? -1 : b[key] < a[key] ? 1 : 0)
    )
  }
}

/**
 * Returns a "descending" comparator, via ">", to be used to sort an array.
 * Undefined or null values are always sorted to the end.
 * @param {String=} key If sorting objects, can specify a key to use to compare.
 * @returns {Function}
 */
export function descending(key) {
  if (!key) {
    return (a, b) => {
      return compareUndefinedNull(a, b) ?? (a > b ? -1 : b > a ? 1 : 0)
    }
  }
  return (a, b) => {
    return (
      compareUndefinedNull(a[key], b[key]) ?? (a[key] > b[key] ? -1 : b[key] > a[key] ? 1 : 0)
    )
  }
}

/**
 * Parse an integer in base 10. Safe to use for array.map() since it only takes one argument and ignores the rest.
 * @param {string} number
 * @returns {number} Integer
 */
export function parseIntSafe(number) {
  return parseInt(number, 10)
}

// not sure how far we want to go down "key" rabbit hole:
// export function sum(array, key) {}
// or maybe
// export function add(key) {
//  if(!key) return (acc, value) => acc + value
//  return (acc, obj) => acc + obj[key]
// }
