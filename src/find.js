export function findClosestAbs(array, desired, { key, cutoff = Infinity } = {}) {
  let closest
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      const diff = Math.abs(value - desired)
      if (diff < cutoff) {
        closest = element
        cutoff = diff
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    for (const element of array) {
      const value = element[key]
      const diff = Math.abs(value - desired)
      if (diff < cutoff) {
        closest = element
        cutoff = diff
      }
    }
  } else {
    for (const value of array) {
      const diff = Math.abs(value - desired)
      if (diff < cutoff) {
        closest = value
        cutoff = diff
      }
    }
  }
  return closest
}

export function findClosestLT(array, desired, { key, cutoff = -Infinity } = {}) {
  let closest
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (value < desired && value > cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    for (const element of array) {
      const value = element[key]
      if (value < desired && value > cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else {
    for (const value of array) {
      if (value < desired && value > cutoff) {
        closest = value
        cutoff = value
      }
    }
  }
  return closest
}

export function findClosestLTE(array, desired, { key, cutoff = -Infinity } = {}) {
  let closest
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (value <= desired && value > cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    for (const element of array) {
      const value = element[key]
      if (value <= desired && value > cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else {
    for (const value of array) {
      if (value <= desired && value > cutoff) {
        closest = value
        cutoff = value
      }
    }
  }
  return closest
}

export function findClosestGT(array, desired, { key, cutoff = Infinity } = {}) {
  let closest
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (value > desired && value < cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    for (const element of array) {
      const value = element[key]
      if (value > desired && value < cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else {
    for (const value of array) {
      if (value > desired && value < cutoff) {
        closest = value
        cutoff = value
      }
    }
  }
  return closest
}

export function findClosestGTE(array, desired, { key, cutoff = Infinity } = {}) {
  let closest
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (value >= desired && value < cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    for (const element of array) {
      const value = element[key]
      if (value >= desired && value < cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else {
    for (const value of array) {
      if (value >= desired && value < cutoff) {
        closest = value
        cutoff = value
      }
    }
  }
  return closest
}

/**
 * Find the closest element in an array. If there is a tie, then returns the first matching element by order in the array.
 * If some values are undefined or null, they will be ignored. If no element is found, returns undefined.
 * If using for strings, need to specify different values for "cutoff" and "comparator".
 * "~" and "" are good cutoff string values for gt/gte and lt/lte respectively.
 * @template T, V
 * @param {Array<T>} array
 * @param {V} value The desired value to search for
 * @param {Object} options
 * @param {string|number|Function=} options.key
 *  If specified, will consider the value for each element's key instead of the element itself.
 *  If a function, called with the element, index and array (same as .map() callback) to produce the value to sort on.
 * @param {string=} options.comparator "abs", "lt", "lte", "gt", "gte", "abs". Default is "abs" which implies T is number.
 * @param {V=} options.cutoff If specified, sets a initial constraint on how close the found value must be.
 *  For example, if used with "lt", the found element would need to be greater than the cutoff but still less than the desired value.
 *  If used with "abs", the found element would need to have a difference with the desired value less than the cutoff.
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
      throw new Error(`unknown comparator: ${comparator}`)
  }
}

/**
 * Find the minimum value in an array.
 * @template T, V
 * @param {Array<T>} array
 * @param {Object} $1
 * @param {string|Function=} $1.key Specifies an alternative to using each element as the value.
 *  If string, then accesses each element at that key to get value.
 *  If function, then calls the callback on each element to get value.
 * @param {V=} $1.cutoff Only values below cutoff will be considered.
 * @returns {T}
 */
export function findMin(array, { key, cutoff = Infinity } = {}) {
  let closest
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (value < cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    for (const element of array) {
      const value = element[key]
      if (value < cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else {
    for (const value of array) {
      if (value < cutoff) {
        closest = value
        cutoff = value
      }
    }
  }
  return closest
}

/**
 * Find the maximum value in an array.
 * @template T, V
 * @param {Array<T>} array
 * @param {Object} $1
 * @param {string|Function=} $1.key Specifies an alternative to using each element as the value.
 *  If string, then accesses each element at that key to get value.
 *  If function, then calls the callback on each element to get value.
 * @param {V=} $1.cutoff Only values above cutoff will be considered.
 * @returns {T}
 */
export function findMax(array, { key, cutoff = -Infinity } = {}) {
  let closest
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (value > cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    for (const element of array) {
      const value = element[key]
      if (value > cutoff) {
        closest = element
        cutoff = value
      }
    }
  } else {
    for (const value of array) {
      if (value > cutoff) {
        closest = value
        cutoff = value
      }
    }
  }
  return closest
}

/**
 * Find the first truthy value in an array.
 * Supports "from" and "to"/"until" being reversed to "find last truthy" if "reverse" is true.
 * @template T
 * @param {Array<T>} array
 * @param {Object} $1
 * @param {string|Function=} $1.key Specifies an alternative to using each element as the value.
 *  If string, then accesses each element at that key to get value.
 *  If function, then calls the callback on each element to get value.
 * @param {number=} $1.from Numeric index to start from: inclusive, defaults to `0`
 * @param {number=} $1.until Numeric index to end at: exclusive, defaults to `array.length`
 * @param {number=} $1.to Numeric index to end at: inclusive, defaults to `array.length - 1`; takes precedence over "until"
 * @param {boolean=} $1.reverse If true, looks through the array in reverse. Default is false.
 *  When true, findTruthy() will still start from "from" and end at "to"/"until".
 *  When true, changes the default values of "from", "until", "to" to `array.length - 1`, `-1`, `0`.
 * @returns {T}
 */
// eslint-disable-next-line complexity
export function findTruthy(
  array,
  {
    key,
    reverse = false,
    from = reverse ? array.length - 1 : 0,
    until = reverse ? -1 : array.length,
    to = reverse ? until + 1 : until - 1,
  } = {}
) {
  if (typeof key === "function") {
    if (reverse) {
      for (let i = from; i >= to; i--) {
        const element = array[i]
        const value = key(element, i, array)
        if (value) {
          return element
        }
      }
    } else {
      for (let i = from; i <= to; i++) {
        const element = array[i]
        const value = key(element, i, array)
        if (value) {
          return element
        }
      }
    }
  } else if (typeof key === "number" || typeof key === "string") {
    if (reverse) {
      for (let i = from; i >= to; i--) {
        const element = array[i]
        const value = element[key]
        if (value) {
          return element
        }
      }
    } else {
      for (let i = from; i <= to; i++) {
        const element = array[i]
        const value = element[key]
        if (value) {
          return element
        }
      }
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (reverse) {
      for (let i = from; i >= to; i--) {
        const value = array[i]
        if (value) {
          return value
        }
      }
    } else {
      for (let i = from; i <= to; i++) {
        const value = array[i]
        if (value) {
          return value
        }
      }
    }
  }
  return undefined
}
