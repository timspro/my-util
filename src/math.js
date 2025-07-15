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
