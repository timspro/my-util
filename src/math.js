/**
 * Module safe for negative numbers i.e. mod(-1, 3) === 2 (not -1 as in -1 % 3).
 * @param {number} n
 * @param {number} m If 0, returns NaN as does n % m.
 * @returns {number}
 */
export function mod(n, m) {
  return ((n % m) + m) % m
}
