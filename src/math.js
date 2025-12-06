import { ascending } from "./array.js"

/**
 * Gives the remainder when the number is divided by modulus.
 * The sign of the remainder is always the same as the modulus i.e. mod(-1, 3) === 2 (not -1 as in -1 % 3).
 * @param {number} number
 * @param {number} modulus If 0, returns NaN as does n % m.
 * @returns {number}
 */
export function mod(number, modulus) {
  return ((number % modulus) + modulus) % modulus
}

/**
 * Given two points, returns a function
 * This function, given an "x" value, returns a "y" value that is on the same line as the first two points.
 * @param {[number, number]} point1
 * @param {[number, number]} point2
 * @returns {Function}
 */
export function line([x1, y1], [x2, y2]) {
  const m = (y2 - y1) / (x2 - x1)
  // m * x1 + b = y1
  const b = y1 - m * x1
  return (x) => m * x + b
}

/**
 * Calculate the sum of values in an array.
 * @template T
 * @param {Array<T>} array
 * @param {Object} $1
 * @param {string|number|Function=} $1.key Can specify a key of the object or a function.
 * @returns {number}
 */
export function sum(array, { key } = {}) {
  let total = 0
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      total += key(array[i], i, array)
    }
  } else if (typeof key === "string" || typeof key === "number") {
    for (let i = 0; i < array.length; i++) {
      total += array[i][key]
    }
  } else {
    for (let i = 0; i < array.length; i++) {
      total += array[i]
    }
  }
  return total
}

/**
 * Calculate the average (mean) of values in an array.
 * @template T
 * @param {Array<T>} array
 * @param {Object} $1
 * @param {string|number|Function=} $1.key Can specify a key of the object or a function.
 * @returns {number}
 * @throws {Error} If the array is empty.
 */
export function average(array, { key } = {}) {
  if (array.length === 0) {
    throw new Error("cannot compute average of empty array")
  }
  return sum(array, { key }) / array.length
}

/**
 * Calculate the variance of values in an array.
 * @template T
 * @param {Array<T>} array
 * @param {Object} $1
 * @param {string|number|Function=} $1.key Can specify a key of the object or a function.
 * @returns {number}
 * @throws {Error} If the array is empty.
 */
export function variance(array, { key } = {}) {
  if (array.length === 0) {
    throw new Error("cannot compute variance of empty array")
  }
  const avg = average(array, { key })
  let total = 0
  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const value = key(array[i], i, array)
      const diff = value - avg
      total += diff * diff
    }
  } else if (typeof key === "string" || typeof key === "number") {
    for (let i = 0; i < array.length; i++) {
      const value = array[i][key]
      const diff = value - avg
      total += diff * diff
    }
  } else {
    for (let i = 0; i < array.length; i++) {
      const value = array[i]
      const diff = value - avg
      total += diff * diff
    }
  }
  return total / array.length
}

/**
 * Prepend a plus to a number or string if positive.
 * @param {number|string} number Or string
 * @param {Object} $1
 * @param {boolean=} $1.zero If true, prepends a plus to zero as well.
 * @returns {string|undefined} Returns undefined if number is not a number or string. NaN return undefined.
 */
export function formatPlus(number, { zero = false } = {}) {
  if (typeof number === "number" && !isNaN(number)) {
    if (number > 0 || (zero && number === 0)) {
      return `+${number}`
    }
    return `${number}`
  } else if (typeof number === "string") {
    if (number === "0" ? zero : number[0] !== "-") {
      return `+${number}`
    }
    return number
  }
  return undefined
}

/**
 * Create an array of numbers progressing from start up to, but not including, end.
 * @param {number} start
 * @param {number=} end
 * @param {number=} increment
 * @returns {number[]}
 */
export function range(start, end, increment = 1) {
  if (!(increment > 0)) {
    return []
  }
  const results = []
  for (let i = start; i < end; i += increment) {
    results.push(i)
  }
  return results
}

/**
 * Check if the argument is a number.
 * This excludes Infinity and NaN, but otherwise is equivalent to `typeof number === "number"`.
 * @param {any} number
 * @returns {boolean}
 */
export function isNumber(number) {
  return Number.isFinite(number)
}

/**
 * Returns an object mapping quantile labels ("0", "10", ..., "100" for N = 10)
 * to the corresponding element in the array at that percentile.
 * @template T
 * @param {T[]} array
 * @param {Object} $1
 * @param {number} $1.N How many quantiles
 * @param {string|number|Function=} $1.key Can specify a key of the object to sort on or a function.
 * @param {Function=} $1.method Method to use to choose which element when the percentile index is a fractional value.
 *  Default is Math.round.
 * @param {Function=} $.labeller Function that returns a quantile label given a fractional value (i.e. 33.3...).
 *  Default is Math.round.
 * @returns {Object|undefined} Returns undefined is array is empty
 */
export function quantiles(array, { N, key, method = Math.round, labeller = Math.round }) {
  if (!(N > 0) || !Number.isInteger(N)) {
    throw new Error("N must be a positive integer")
  }
  if (!array.length) {
    return undefined
  }
  const sorted = [...array].sort(ascending(key))
  const result = Object.create(null)
  for (let i = 0; i <= N; i++) {
    const percentile = i / N
    const percentileIndex = method(percentile * (sorted.length - 1))
    const label = labeller(i * (100 / N))
    result[label] = sorted[percentileIndex]
  }
  return result
}
