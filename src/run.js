import { pathToFileURL } from "url"

/**
 * Basically allows the file where this is called from to be run as a script.
 * @param {string} importMetaUrl Intended to be literally `import.meta.url`
 * @param {array} args Names for command line args that will be used to name keys in the object passed to callback
 * @param {Function} callback A (wrapper) function to execute the file.
 * @returns The result of the callback
 */
export function runnable(importMetaUrl, args, callback) {
  if (importMetaUrl === pathToFileURL(process.argv[1]).href) {
    // module was not imported but called directly
    const parameter = {}
    for (let i = 0; i < args.length; i++) {
      parameter[args[i]] = process.argv[i + 2]
    }
    console.log("starting", parameter)
    return callback(parameter).then((result) => {
      const formatted = JSON.stringify(JSON.parse(result.body), undefined, 2)
      console.log("complete", parameter, formatted)
    })
  }
  return undefined
}
