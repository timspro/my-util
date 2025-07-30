export function findClosestAbs(array, desired, { key, map, threshold = Infinity } = {}) {
  let closest
  if (map) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = map(element, i, array)
      const diff = Math.abs(value - desired)
      if (diff < threshold) {
        closest = element
        threshold = diff
      }
    }
  } else if (key) {
    for (const element of array) {
      const value = element[key]
      const diff = Math.abs(value - desired)
      if (diff < threshold) {
        closest = element
        threshold = diff
      }
    }
  } else {
    for (const value of array) {
      const diff = Math.abs(value - desired)
      if (diff < threshold) {
        closest = value
        threshold = diff
      }
    }
  }
  return closest
}

export function findClosestLT(array, desired, { key, map, threshold = -Infinity } = {}) {
  let closest
  if (map) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = map(element, i, array)
      if (value < desired && value > threshold) {
        closest = element
        threshold = value
      }
    }
  } else if (key) {
    for (const element of array) {
      const value = element[key]
      if (value < desired && value > threshold) {
        closest = element
        threshold = value
      }
    }
  } else {
    for (const value of array) {
      if (value < desired && value > threshold) {
        closest = value
        threshold = value
      }
    }
  }
  return closest
}

export function findClosestLTE(array, desired, { key, map, threshold = -Infinity } = {}) {
  let closest
  if (map) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = map(element, i, array)
      if (value <= desired && value > threshold) {
        closest = element
        threshold = value
      }
    }
  } else if (key) {
    for (const element of array) {
      const value = element[key]
      if (value <= desired && value > threshold) {
        closest = element
        threshold = value
      }
    }
  } else {
    for (const value of array) {
      if (value <= desired && value > threshold) {
        closest = value
        threshold = value
      }
    }
  }
  return closest
}

export function findClosestGT(array, desired, { key, map, threshold = Infinity } = {}) {
  let closest
  if (map) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = map(element, i, array)
      if (value > desired && value < threshold) {
        closest = element
        threshold = value
      }
    }
  } else if (key) {
    for (const element of array) {
      const value = element[key]
      if (value > desired && value < threshold) {
        closest = element
        threshold = value
      }
    }
  } else {
    for (const value of array) {
      if (value > desired && value < threshold) {
        closest = value
        threshold = value
      }
    }
  }
  return closest
}

export function findClosestGTE(array, desired, { key, map, threshold = Infinity } = {}) {
  let closest
  if (map) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = map(element, i, array)
      if (value >= desired && value < threshold) {
        closest = element
        threshold = value
      }
    }
  } else if (key) {
    for (const element of array) {
      const value = element[key]
      if (value >= desired && value < threshold) {
        closest = element
        threshold = value
      }
    }
  } else {
    for (const value of array) {
      if (value >= desired && value < threshold) {
        closest = value
        threshold = value
      }
    }
  }
  return closest
}

/**
 * Find the closest element in an array.
 * If using for strings, need to specify different values for "threshold" and "comparator".
 * "~" and "" are good threshold string values for gt/gte and lt/lte respectively.
 * @template T, V
 * @param {Array<T>} array
 * @param {V} value The desired value to search for
 * @param {Object} options
 * @param {string|number=} options.key If specified, will consider the value for each element's key instead of the element itself.
 * @param {Function=} options.map If specified, will compute value by calling provided function on the element. Takes precedence over key.
 * @param {string|number|Function=} options.transform Allows combining key and map as one parameter. Useful for piping in passed values.
 * @param {string=} options.comparator "abs", "lt", "lte", "gt", "gte", "abs". Default is "abs" which implies T is number.
 * @param {V=} options.threshold If specified, uses a different initial min/max/difference than positive or negative infinity.
 * @returns {T|undefined}
 */
export function findClosest(array, value, options = {}) {
  const { comparator = "abs", transform } = options
  if (typeof transform === "function") {
    options = { ...options, map: transform }
  } else if (typeof transform === "string" || typeof transform === "number") {
    options = { ...options, key: transform }
  }
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
