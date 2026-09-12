# my-util

This library includes common util functions. It does not have any dependencies.

In combination with Object.groupBy (available when using Node 22), this should be sufficient for replacing the most useful functionality from lodash.

## First Time Setup

`npm install @tim-code/my-util`

## API

The default import path (`@tim-code/my-util`) re-exports everything in
**Array**, **Find**, **Math**, **Object**, **Promise**, and **Time**. `fs`
and `run` are Node-specific and are only available from their subpaths
(`@tim-code/my-util/fs`, `@tim-code/my-util/run`) — see each function's
JSDoc in `src/` for full parameter details.

### Array — `@tim-code/my-util/array`

| Function | Description |
| --- | --- |
| `chunk` | Splits an iterable into an array of chunks, each up to a max size. |
| `unique` | Returns the unique elements of an array, optionally by key or callback. |
| `duplicates` | Returns groups of elements that share the same value, key, or callback result. |
| `ascending` | Returns an ascending sort comparator, optionally on a key or callback. |
| `descending` | Returns a descending sort comparator, optionally on a key or callback. |
| `naturalAsc` | Returns an ascending "natural" string sort comparator (numbers sort by magnitude). |
| `naturalDesc` | Returns a descending "natural" string sort comparator. |
| `multilevel` | Combines multiple comparators into one, using each in order to break ties. |
| `sortN` | Efficiently returns the first N elements of a sorted array. |
| `toTop` | Returns a comparator that sorts elements matching a value to the front. |
| `toBottom` | Returns a comparator that sorts elements matching a value to the end. |

### Find — `@tim-code/my-util/find`

| Function | Description |
| --- | --- |
| `findClosest` | Finds the closest element to a value, with a selectable comparison mode (diff/lt/lte/gt/gte/eq). |
| `findMin` | Finds the minimum value or element in an array. |
| `findMax` | Finds the maximum value or element in an array. |
| `findTruthy` | Finds the first (or last, if reversed) truthy value in an array or index range. |

### Math — `@tim-code/my-util/math`

| Function | Description |
| --- | --- |
| `mod` | Computes a modulus that always takes the sign of the modulus (unlike `%`). |
| `line` | Returns a function that linearly interpolates/extrapolates y for a given x through two points. |
| `sum` | Sums the values in an array. |
| `average` | Computes the mean of values in an array. |
| `variance` | Computes the population variance of values in an array. |
| `formatPlus` | Prepends a `+` to a positive number or numeric string. |
| `range` | Creates an array of numbers from start up to, but excluding, end. |
| `between` | Creates an array of numbers from start up to and including end. |
| `isNumber` | Checks whether a value is a finite number. |
| `quantiles` | Computes N quantiles of an array's values. |

### Object — `@tim-code/my-util/object`

| Function | Description |
| --- | --- |
| `isObject` | Checks whether a value is a non-null object. |
| `isStatefulBuiltinObject` | Checks whether a value is an array, Date, RegExp, Map, or Set. |
| `isPlainObject` | Checks whether a value is an object other than an array, Date, RegExp, Map, or Set. |
| `mapValues` | Creates a new object by mapping each value through a callback. |
| `mutateValues` | Mutates an object in place by mapping each value through a callback. |
| `deleteUndefinedValues` | Mutates an object by removing keys whose value is `undefined`. |
| `via` | Creates a function that reads a given key from an object. |
| `like` | Creates a predicate function that checks an object matches a template's key/values. |
| `deepCopy` | Recursively deep-copies an array or object. |
| `deepMerge` | Recursively merges source objects into a target object. |
| `deepMergeCopy` | Deep-copies and merges source objects into a target without mutating the sources. |
| `deepEqual` | Recursively compares two values for deep equality. |
| `isArrayEqual` | Checks whether two values are equal arrays, given a value-comparator function. |
| `isDateEqual` | Checks whether two values are equal Dates, by `getTime()`. |
| `isRegExpEqual` | Checks whether two values are equal RegExps, by source and flags. |
| `isMapEqual` | Checks whether two values are equal Maps, given a value-comparator function. |
| `isSetEqual` | Checks whether two values are equal Sets, by size and membership. |
| `isClass` | Checks whether a function is a class declaration. |

### Promise — `@tim-code/my-util/promise`

| Function | Description |
| --- | --- |
| `poll` | Repeatedly calls a callback on an interval until it returns a non-null/undefined/false result. |
| `sleep` | Resolves after a given number of milliseconds. |
| `allSettled` | Runs promises with an optional concurrency limit, collecting results, values, and errors. |
| `allPatiently` | Like `Promise.all()`, but built on `allSettled()` and throws a combined error. |
| `intervalLimiter` | Creates a rate limiter for use as `allSettled()`'s limiter, capping throughput per interval. |
| `alert` | Throws a combined error if an `allSettled()` result contains errors. |
| `PollError` | Error thrown when `poll()` exceeds its attempt limit. |
| `PromiseAllError` | Error thrown by `allSettled()`/`allPatiently()` when combining multiple errors. |

### Time — `@tim-code/my-util/time`

| Function | Description |
| --- | --- |
| `now` | Returns the current date/time as a `Date`; mockable via `setNow()`. |
| `setNow` | Overrides (or resets) the clock used by `now()`. |
| `resetNow` | Alias for calling `setNow()` with no arguments - resets `now()` to the system clock. |
| `getEasternTime` | Gets timestamp/date/time strings for a moment, in Eastern time by default. |
| `getLocalTime` | Same as `getEasternTime`, but defaults to local time. |
| `getUnixTimestamp` | Converts a UTC date-time string to a Unix timestamp. |
| `today` | Returns today's date (`YYYY-MM-DD`) in local time. |
| `getDayIndexInWeek` | Returns the day-of-week index (0 = Sunday) for a date string. |
| `getMinute` | Extracts the minute component from a time string. |
| `isDateString` | Checks whether a string is a valid `YYYY-MM-DD` date. |
| `isTimeString` | Checks whether a string is a valid `HH:mm:ss` time. |
| `isDateTimeString` | Checks whether a string is a valid combined date-time string. |
| `isUTCString` | Checks whether a string is a valid UTC date-time string ending in `Z`. |
| `isUnixTimestamp` | Checks whether a number looks like a Unix timestamp (seconds, not milliseconds). |
| `addTime` | Adds hours/minutes to a time string, wrapping across 24 hours. |
| `getTimeRange` | Returns all times between two times at a given step. |
| `addDays` | Adds a number of days to a date string. |
| `getDateRange` | Returns all dates between two dates, up to a limit. |
| `getStartOfWeek` | Returns the date of the first day of the week containing a date. |
| `convertToSeconds` | Converts a combination of weeks/days/hours/minutes into seconds. |

### Fs — `@tim-code/my-util/fs`

| Function | Description |
| --- | --- |
| `readJSON` | Reads and parses a JSON file, auto-decompressing `.gz` paths. |
| `writeJSON` | Writes an object as JSON to a file, auto-compressing `.gz` paths. |
| `pathExists` | Checks whether a path exists (optionally within a max age), returning its stats. |

### Run — `@tim-code/my-util/run`

| Function | Description |
| --- | --- |
| `runnable` | Lets a module be run directly as a CLI script while remaining importable elsewhere. |
