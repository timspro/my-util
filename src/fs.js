import { readFile, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { promisify } from "node:util"
import { gunzip as _gunzip, gzip as _gzip } from "node:zlib"

const gunzip = promisify(_gunzip)
const gzip = promisify(_gzip)

// the integration tests for this file are the s3-fs integration tests in lambda-integrations
// changes to this file should be tested against lambda-integrations' integration tests

/**
 * Get JSON from a path. If path ends with .gz, will automatically decompress data.
 * @param {string} path
 * @returns {Object|Array}
 */
export async function readJSON(path) {
  let buffer = await readFile(path)
  if (path.endsWith(".gz")) {
    buffer = await gunzip(buffer)
  }
  return JSON.parse(buffer.toString())
}

/**
 * Write JSON to a path. If path ends with .gz, will automatically compress data.
 * @param {string} path
 * @param {Object|Array} object
 * @param {Object} $1
 * @param {number=} $1.indent Indent used to format JSON object. Default 2. If 0, does not indent object.
 */
export async function writeJSON(path, object, { indent = 2 } = {}) {
  let data = JSON.stringify(object, undefined, indent)
  if (path.endsWith(".gz")) {
    data = await gzip(data)
  }
  await writeFile(path, data)
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
