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

function findClosestAbs(array, value, { key, threshold = Infinity } = {}) {
  let closest
  if (key) {
    for (const element of array) {
      const _value = element[key]
      const diff = Math.abs(_value - value)
      if (diff < threshold) {
        closest = element
        threshold = diff
      }
    }
  } else {
    for (const _value of array) {
      const diff = Math.abs(_value - value)
      if (diff < threshold) {
        closest = _value
        threshold = diff
      }
    }
  }
  return closest
}

function findClosestLT(array, value, { key, threshold = -Infinity } = {}) {
  let closest
  if (key) {
    for (const element of array) {
      const _value = element[key]
      if (_value < value && _value > threshold) {
        closest = element
        threshold = _value
      }
    }
  } else {
    for (const _value of array) {
      if (_value < value && _value > threshold) {
        closest = _value
        threshold = _value
      }
    }
  }
  return closest
}

function findClosestLTE(array, value, { key, threshold = -Infinity } = {}) {
  let closest
  if (key) {
    for (const element of array) {
      const _value = element[key]
      if (_value <= value && _value > threshold) {
        closest = element
        threshold = _value
      }
    }
  } else {
    for (const _value of array) {
      if (_value <= value && _value > threshold) {
        closest = _value
        threshold = _value
      }
    }
  }
  return closest
}

function findClosestGT(array, value, { key, threshold = Infinity } = {}) {
  let closest
  if (key) {
    for (const element of array) {
      const _value = element[key]
      if (_value > value && _value < threshold) {
        closest = element
        threshold = _value
      }
    }
  } else {
    for (const _value of array) {
      if (_value > value && _value < threshold) {
        closest = _value
        threshold = _value
      }
    }
  }
  return closest
}

function findClosestGTE(array, value, { key, threshold = Infinity } = {}) {
  let closest
  if (key) {
    for (const element of array) {
      const _value = element[key]
      if (_value >= value && _value < threshold) {
        closest = element
        threshold = _value
      }
    }
  } else {
    for (const _value of array) {
      if (_value >= value && _value < threshold) {
        closest = _value
        threshold = _value
      }
    }
  }
  return closest
}

/**
 * Find the closest element in an array.
 * If using for strings, need to specify different values for "threshold" and "comparator".
 * "~" and "" are good threshold string values for gt/gte and lt/lte respectively.
 * @param {Array<T>} array
 * @param {T} value
 * @param {Object} options
 * @param {string=} options.key If specified, will consider the value for each element's key instead of the element itself.
 * @param {string=} options.comparator "abs", "lt", "lte", "gt", "gte", "abs". Default is "abs" which implies T is number.
 * @param {T=} options.threshold If specified, uses a different initial min/max/difference than positive or negative infinity.
 * @returns {T|undefined}
 */
export function findClosest(array, value, options = {}) {
  const { comparator = "abs" } = options
  switch (comparator) {
    case "lt":
      return findClosestLT(array, value, options)
    case "lte":
      return findClosestLTE(array, value, options)
    case "gt":
      return findClosestGT(array, value, options)
    case "gte":
      return findClosestGTE(array, value, options)
    case "abs":
      return findClosestAbs(array, value, options)
    default:
      throw new Error(`Unknown comparator: ${comparator}`)
  }
}
