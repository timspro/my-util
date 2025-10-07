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

/**
 * Returns groups of duplicate elements in an array.
 * Each group is an array of elements that share the same key or callback result.
 * Only groups with more than one element are returned. Returns an empty array if no duplicates.
 * @param {Array} array
 * @param {Object} $1
 * @param {string|number|Function=} $1.key
 *  If a function, calls the provided function on an element to get the value for grouping.
 *  If a string or number, uses element[key].
 *  If omitted, compares elements directly.
 * @returns {Array<Array>}
 */
export function duplicates(array, { key } = {}) {
  const groups = new Map()

  if (typeof key === "function") {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]
      const value = key(element, i, array)
      if (!groups.has(value)) {
        groups.set(value, [])
      }
      groups.get(value).push(element)
    }
  } else if (typeof key === "string" || typeof key === "number") {
    for (const element of array) {
      const value = element[key]
      if (!groups.has(value)) {
        groups.set(value, [])
      }
      groups.get(value).push(element)
    }
  } else {
    for (const element of array) {
      if (!groups.has(element)) {
        groups.set(element, [])
      }
      groups.get(element).push(element)
    }
  }
  const results = [...groups.values()].filter((group) => group.length > 1)
  return results
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

function siftDown(heap, i, compare, length) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const left = 2 * i + 1
    const right = left + 1
    let largest = i
    if (left < length && compare(heap[left], heap[largest]) > 0) {
      largest = left
    }
    if (right < length && compare(heap[right], heap[largest]) > 0) {
      largest = right
    }
    if (largest === i) {
      break
    }
    const swap = heap[largest]
    heap[largest] = heap[i]
    heap[i] = swap
    i = largest
  }
}

function maxHeapify(heap, compare, length) {
  // (heap.length >>> 1) is equivalent to Math.floor(heap.length / 2)
  // eslint-disable-next-line no-bitwise
  for (let i = (length >>> 1) - 1; i >= 0; i--) {
    siftDown(heap, i, compare, length)
  }
}

/**
 * Get the first N elements of the sorted array efficiently.
 * @template T
 * @param {Array<T>} array
 * @param {Object} $1
 * @param {number} $1.N Number of elements to return; must be a nonnegative integer
 * @param {Function=} $1.compare Sort function. Default is ascending sort.
 * @param {boolean=} $1.unsorted If true, returns the final result in heap order, not sorted order, as an optimization.
 *  Default is false.
 * @param {boolean=} $1.force If true, will force heap-based method for small N instead of more efficient "normal" way.
 *  Default is false.
 * @param {boolean=} $1.mutate If true, will mutate the original array rather than copy it.
 * @returns {Array<T>}
 */
export function sortN(
  array,
  { N, compare = ascending(), unsorted = false, force = false, mutate = false }
) {
  if (!(N >= 0) || N % 1 !== 0) {
    throw new Error("N must be a nonnegative integer")
  }
  if (N === 0) {
    if (mutate) {
      array.length = 0
      return array
    }
    return []
  }
  if (N >= array.length) {
    return (mutate ? array : [...array]).sort(compare)
  }
  if (!force && array.length <= 100 && N / array.length >= 0.1) {
    // seems to be faster to do it the "normal" way in this case
    const sorted = (mutate ? array : [...array]).sort(compare)
    sorted.length = N
    return sorted
  }
  const heap = mutate ? array : array.slice(0, N)
  maxHeapify(heap, compare, N)
  for (let i = N; i < array.length; i++) {
    const element = array[i]
    if (compare(element, heap[0]) < 0) {
      heap[0] = element
      siftDown(heap, 0, compare, N)
    }
  }
  if (mutate) {
    heap.length = N
  }
  if (unsorted) {
    return heap
  }
  return heap.sort(compare)
}
