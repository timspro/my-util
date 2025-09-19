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
 * Returns all unique elements in an array, or alternatively by checking a key's value or function's result.
 * @param {Array} array
 * @param {Object} $1
 * @param {string|number|Function=} $1.key
 *  If a function, calls the provided function on an element to get the value to check for uniqueness.
 *  If a string or number, checks each element's value at key for uniqueness.
 * @returns {Array}
 */
export function unique(array, { key } = {}) {
  const seen = new Set()
  const result = []
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (!seen.has(value)) {
        seen.add(value)
        result.push(element)
      }
    }
  } else if (typeof key === "string" || typeof key === "number") {
    for (const element of array) {
      const value = element[key]
      if (!seen.has(value)) {
        seen.add(value)
        result.push(element)
      }
    }
  } else {
    return [...new Set(array)]
  }
  return result
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
 * @param {string|number|Function=} transform
 *  If a function, calls the provided function on an element to get the value to sort on.
 *  If a string or number, treats transform as a key and sorts on each element's value at key.
 * @returns {Function}
 */
export function ascending(transform) {
  if (typeof transform === "function") {
    return (a, b) => {
      a = transform(a)
      b = transform(b)
      return compareUndefinedNull(a, b) ?? (a < b ? -1 : b < a ? 1 : 0)
    }
  }
  if (typeof transform === "string" || typeof transform === "number") {
    return (a, b) => {
      const invalid = compareUndefinedNull(a[transform], b[transform])
      return (
        invalid ?? (a[transform] < b[transform] ? -1 : b[transform] < a[transform] ? 1 : 0)
      )
    }
  }
  return (a, b) => {
    return compareUndefinedNull(a, b) ?? (a < b ? -1 : b < a ? 1 : 0)
  }
}

/**
 * Returns a "descending" comparator, via ">", to be used to sort an array.
 * Undefined or null values are always sorted to the end.
 * @param {string|number|Function=} transform
 *  If a function, calls the provided function on an element to get the value to sort on.
 *  If a string or number, treats transform as a key and sorts on each element's value at key.
 * @returns {Function}
 */
export function descending(transform) {
  if (typeof transform === "function") {
    return (a, b) => {
      a = transform(a)
      b = transform(b)
      return compareUndefinedNull(a, b) ?? (a > b ? -1 : b > a ? 1 : 0)
    }
  }
  if (typeof transform === "string" || typeof transform === "number") {
    return (a, b) => {
      const invalid = compareUndefinedNull(a[transform], b[transform])
      return (
        invalid ?? (a[transform] > b[transform] ? -1 : b[transform] > a[transform] ? 1 : 0)
      )
    }
  }
  return (a, b) => {
    return compareUndefinedNull(a, b) ?? (a > b ? -1 : b > a ? 1 : 0)
  }
}

/**
 * Combines multiple ascending and descending comparators.
 * @param  {...Function} comparators
 * @returns {Function}
 */
export function multilevel(...comparators) {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b)
      if (result) {
        return result
      }
    }
    return 0
  }
}
