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
 * Convert a number to a string and prepend a plus if the number is positive.
 * @param {number} number
 * @param {Object} $1
 * @param {boolean=} $1.zero If true, prepends a plus to zero as well.
 * @param {number=} $1.decimals If a number, uses .toFixed(decimals) instead of .toString()
 * @returns {string}
 */
export function formatPlus(number, { zero = false, decimals = undefined } = {}) {
  const string = typeof decimals === "number" ? number.toFixed(decimals) : number.toString()
  if (number > 0 || (number === 0 && zero)) {
    return `+${string}`
  }
  return `${string}`
}
