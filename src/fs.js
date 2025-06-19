import { readFile, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { promisify } from "node:util"
import { gunzip as _gunzip } from "node:zlib"

const gunzip = promisify(_gunzip)

// the integration tests for this file are the s3-fs integration tests in lambda-integrations
// changes to this file should be tested against lambda-integrations' integration tests

/**
 * Get JSON from a path.
 * @param {string} path
 * @returns {Object|Array}
 */
export async function getJSON(path) {
  const buffer = await readFile(path)
  return JSON.parse(buffer.toString())
}

/**
 * Get gzipped JSON from a path.
 * @param {string} path
 * @returns {Object|Array}
 */
export async function getCompressedJSON(path) {
  const buffer = await readFile(path)
  const uncompressed = await gunzip(buffer)
  return JSON.parse(uncompressed.toString())
}

/**
 * Checks if the path exists using stat(). Returns stat() result if so.
 * @param {string} path
 * @param {Object} $1
 * @param {number=} $1.maxAge Max age to consider in milliseconds.
 * @param {boolean=} $1.throws Whether the function should throw or not if not found
 * @returns {Object|false}
 */
export async function pathExists(path, { maxAge = undefined, throws = false } = {}) {
  try {
    const stats = await stat(path)
    if (typeof maxAge === "number") {
      const age = Date.now() - stats.mtime.getTime()
      if (age <= maxAge) {
        return stats
      }
      return false
    }
    return stats
  } catch (error) {
    // if caller wants all errors or the error isn't related to the path not being found
    if (throws || error.code !== "ENOENT") {
      throw error
    }
  }
  return false
}

/**
 * Make a path to a temporary directory.
 * @returns {string}
 */
export function makeTempDirectory() {
  const path = tmpdir()
  return path
}
