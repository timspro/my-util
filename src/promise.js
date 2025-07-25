import { chunk } from "./array.js"

/**
 * Calls a function immediately and then every X milliseconds until the function does not return undefined, null or false.
 * Note that other falsy values such as 0 or "" or NaN will resolve and be returned.
 * This will never resolve if callback always returns undefined, null, or false. I may add a "max attempt" or "timeout" option at some point.
 * @param {Function} callback
 * @param {number} milliseconds
 * @returns The result of the callback
 */
export function poll(callback, milliseconds) {
  return new Promise((resolve, reject) => {
    const resolver = async () => {
      try {
        const result = await callback()
        if (result !== undefined && result !== null && result !== false) {
          resolve(result)
        } else {
          setTimeout(resolver, milliseconds)
        }
      } catch (error) {
        reject(error)
      }
    }
    resolver()
  })
}

/**
 * Sleep for X milliseconds.
 * @param {number} milliseconds
 */
export async function sleep(milliseconds) {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

/**
 * Parallelize executions of a function using `Promise.allSettled()`.
 * This is useful because usually you want to set a limit to the number of parallel requests possible at once.
 * The output of this function contains the outcome of each call of the callback in a variety of formats.
 *  - "results": Essentially the return value from Promise.allSettled().
 *  - "values": The "value" property of each "result" object returned from allSettled(); this will be undefined if the associated promise rejects.
 *  - "returned": The "value" property for each "result" object where the "status" property has a value of fulfilled.
 *     This is arguably more useful than "values" unless you need to be able to index into the array based on the index of the promise.
 *  - "errors": The "reason" property for each "result" object that did not have a status of "fulfilled".
 * @param {Object} $1
 * @param {Array} $1.array
 * @param {number=} $1.limit If not provided, each call is done in parallel.
 * @param {boolean=} $1.flatten Flattens values before returning; useful if promises return arrays
 * @param {Function} callback
 * @returns {Object} {results, values, returned, errors}
 */
export async function allSettled({ array, limit, flatten = false }, callback) {
  const results = []
  let returned = []
  let values = []
  const errors = []
  const chunked = chunk(array, limit)
  for (const elements of chunked) {
    const promises = elements.map(callback)
    const _results = await Promise.allSettled(promises)
    for (const result of _results) {
      const { value, status, reason } = result
      results.push(result)
      values.push(value)
      if (status === "fulfilled") {
        returned.push(value)
      } else {
        errors.push(reason)
      }
    }
  }
  if (flatten) {
    values = values.flat()
    returned = returned.flat()
  }
  return { values, returned, errors, results }
}

/**
 * A convenience method to throw the result of allSettled().
 * Useful in testing contexts when simply propagating the error is enough.
 * @param {Object} result An object with an "errors" property i.e. awaited return value of allSettled()
 * @returns {Object} result
 */
export function alert(result) {
  const { errors } = result ?? {}
  if (errors && errors.length) {
    // coerce errors to strings since sometimes .stringify() won't do this for Error objects
    const strings = errors.map((error) => error.toString())
    throw new Error(JSON.stringify(strings, undefined, 2))
  }
  return result
}

/**
 * Parallelize executions of a function using `Promise.all()`.
 * This is useful because usually you want to set a limit to the number of parallel requests possible at once.
 * To maintain parity with allSettled(), this function provides both "values" and "returned" as output but they are the same array.
 * Since this function throws on the first error (same behavior as Promise.all()), there isn't a situation where this function returns but an individual call errored.
 * @param {Object} $1
 * @param {Array} $1.array
 * @param {number=} $1.limit If not provided, each call is done in parallel.
 * @param {boolean=} $1.flatten Flattens values before returning; useful if promises return arrays
 * @param {Function} callback
 * @returns {Object} {values, returned}
 */
export async function throwFirstReject({ array, limit, flatten = false }, callback) {
  let values = []
  const chunked = chunk(array, limit)
  for (const elements of chunked) {
    const promises = elements.map(callback)
    const _values = await Promise.all(promises)
    values = values.concat(_values)
  }
  if (flatten) {
    values = values.flat()
  }
  return { values, returned: values }
}
