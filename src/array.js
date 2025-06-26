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
 * Get the largest element in an array using > operator.
 * @param {Array} array
 * @param {Function=} callback If specified, uses the result of calling the callback on the element for comparison instead.
 *  (element, index, array) => comparable
 * @param {any} element Largest element
 */
export function largest(array, callback = (_) => _) {
  let found
  for (let i = 0; i < array.length; i++) {
    const element = array[i]
    const result = callback(element, i, array)
    if (found === undefined || found < result) {
      found = result
    }
  }
  return found
}
