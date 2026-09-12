# Changelog

## [1.0.0]

### find.js

- Fixed a tie-breaking bug in `findClosest()`'s `diff`/`lt`/`lte`/`gt`/`gte`
  comparators: once a *falsy* value (e.g. `0`) became the current best
  match, a later tied element could incorrectly overwrite it, even though
  ties are documented to resolve to the first matching element by array
  order.
- `findEq`, `findSmallestDiff`, `findClosestLT`, `findClosestLTE`,
  `findClosestGT`, and `findClosestGTE` are no longer individually
  exported - they're internal implementation details of `findClosest()`.
  Use `findClosest(array, value, { comparator })` instead.

### fs.js

- Removed `makeTempDirectory` - it didn't actually create a temp
  directory, just returned `os.tmpdir()` (the same shared path every
  call).

### math.js

- `quantiles()`: when the default labeller's integer rounding causes two
  different percentiles to round to the same label (only possible once
  `N > 100`), the result no longer depends on incidental object key
  iteration order. Label `0` always keeps the true minimum, and every
  other label (including the top one) keeps the value from the
  highest-index percentile in its collision group - which for the top
  label is always the true maximum.
- `formatPlus()` no longer double-prepends a `+` to a string that already
  starts with one (`formatPlus("+5")` was `"++5"`, is now `"+5"`).
- `line()`'s behavior on degenerate input (vertical line, or two
  identical points) is now documented: it returns a function that always
  yields `NaN`.

### object.js

- `deepCopy()`, `deepMerge()`, and `deepEqual()` now handle `Date`,
  `RegExp`, `Map`, and `Set` with dedicated logic instead of the generic
  `Object.keys()`-based path used for plain objects. Previously,
  `deepEqual()` reported two different `Date` instances as equal (both
  have zero enumerable own keys), and `deepCopy()` turned any of these
  types into an empty plain object; `deepMerge()` had the analogous bug
  of silently discarding a new `Date`/`Map` value merged into a target
  that already held one.
- `deepEqual()` no longer treats an array as equal to a plain object with
  matching numeric keys (`deepEqual([1, 2], { 0: 1, 1: 2 })` was `true`,
  is now `false`). Arrays are compared only against other arrays.
- `like()` now only matches an object's own properties against the
  template; a template key the object only inherits via its prototype
  chain no longer counts as a match.
- Added `isPlainObject` and `isStatefulBuiltinObject`, the two predicates
  that classify a value as a plain object vs. an array/`Date`/`RegExp`/
  `Map`/`Set`.
- Added `isArrayEqual`, `isDateEqual`, `isRegExpEqual`, `isMapEqual`, and
  `isSetEqual` - the per-type equality checks that power `deepEqual()` -
  as their own exported functions. `isArrayEqual`/`isMapEqual` take an
  optional `compare` callback (default `Object.is`) for comparing
  elements/values.

### promise.js

- Removed `throwFirstReject` - dead code that was never part of the
  maintained API (its own comment called it "unused but included for
  reference").

### time.js

- `now` changed from an exported mutable `let` binding to a regular
  function backed by a module-private variable. Call sites (`now()`) are
  unchanged, but code that aliased or destructured the old `now` export
  (e.g. `const clock = { now }`) risked silently detaching from later
  `setNow()` calls; that risk is gone now that `now` is an ordinary
  stable function reference.
- Added `resetNow()`, an alias for calling `setNow()` with no arguments.
- `getTimeRange()` now throws an `Error` instead of silently stopping
  after 1440 iterations when the given step would cycle the range back
  to exactly its start time - covers a zero step, a step that evenly
  divides into 24 hours, and (per the function's documented caveat)
  ranges whose stepping crosses midnight.
