/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-promise-reject-errors */
import { jest } from "@jest/globals"

import { alert, allSettled, poll, PollError, sleep, throwFirstReject, intervalLimiter } from "./promise.js"

describe("poll", () => {
  it("resolves immediately if callback returns a non-undefined/null/false value", async () => {
    const cb = jest.fn().mockReturnValue(42)
    const promise = poll({ ms: 1 }, cb)
    await expect(promise).resolves.toBe(42)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(0)
  })

  it("resolves after several attempts when callback returns undefined/null/false before a value", async () => {
    const cb = jest
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(0)
    const promise = poll({ ms: 2 }, cb)
    await expect(promise).resolves.toBe(0)
    expect(cb).toHaveBeenCalledTimes(4)
    expect(cb.mock.calls.map((args) => args[0])).toEqual([0, 1, 2, 3])
  })

  it('resolves if callback returns "" or NaN (should not treat as "keep polling")', async () => {
    const cb = jest.fn().mockReturnValueOnce("").mockReturnValueOnce(NaN)
    const promise1 = poll({ ms: 1 }, cb)
    await expect(promise1).resolves.toBe("")
    expect(cb).toHaveBeenCalledTimes(1)
    cb.mockClear()
    const promise2 = poll({ ms: 1 }, cb)
    await expect(promise2).resolves.toBe(NaN)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("rejects if callback throws", async () => {
    const error = new Error("fail")
    const cb = jest.fn().mockImplementation(() => {
      throw error
    })
    await expect(poll({ ms: 1 }, cb)).rejects.toBe(error)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("rejects if callback returns a rejected promise", async () => {
    const error = new Error("async fail")
    const cb = jest.fn().mockReturnValue(Promise.reject(error))
    const promise = poll({ ms: 1 }, cb)
    await expect(promise).rejects.toBe(error)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("waits before first call if wait=true", async () => {
    const cb = jest.fn().mockReturnValue(1)
    const promise = poll({ ms: 2, wait: true }, cb)
    // Wait a little longer than ms to ensure callback is called
    await sleep(3)
    await expect(promise).resolves.toBe(1)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("waits specified ms before first call if wait is a number", async () => {
    const cb = jest.fn().mockReturnValue(1)
    const promise = poll({ ms: 2, wait: 5 }, cb)
    await sleep(4)
    expect(cb).not.toHaveBeenCalled()
    await sleep(2)
    await expect(promise).resolves.toBe(1)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("rejects with PollError if attempts is reached", async () => {
    const cb = jest.fn().mockReturnValue(undefined)
    const promise = poll({ ms: 1, attempts: 3 }, cb)
    await expect(promise).rejects.toBeInstanceOf(PollError)
    await expect(promise).rejects.toThrow("max attempts reached")
    expect(cb).toHaveBeenCalledTimes(3)
    expect(cb.mock.calls.map((args) => args[0])).toEqual([0, 1, 2])
  })

  it("resolves if callback returns a value before reaching max attempts", async () => {
    const cb = jest
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(5)
    const promise = poll({ ms: 1, attempts: 5 }, cb)
    await expect(promise).resolves.toBe(5)
    expect(cb).toHaveBeenCalledTimes(3)
    expect(cb.mock.calls.map((args) => args[0])).toEqual([0, 1, 2])
  })
})

describe("sleep", () => {
  it("resolves after the specified milliseconds", async () => {
    const before = Date.now()
    const promise = sleep(5)
    await expect(promise).resolves.toBeUndefined()
    const after = Date.now()
    // Allow for some jitter
    expect(after - before).toBeGreaterThanOrEqual(5)
  })

  it("resolves immediately if ms is negative", async () => {
    const before = Date.now()
    const promise = sleep(-10)
    await expect(promise).resolves.toBeUndefined()
    const after = Date.now()
    expect(after - before).toBeLessThan(5)
  })
})

describe("allSettled", () => {
  it("returns correct structure for all fulfilled", async () => {
    const arr = [1, 2, 3]
    const cb = (x) => x * 2
    const result = await allSettled({ array: arr }, cb)
    expect(result.values).toEqual([2, 4, 6])
    expect(result.returned).toEqual([2, 4, 6])
    expect(result.errors).toEqual([])
    expect(result.results.every((r) => r.status === "fulfilled")).toBe(true)
  })

  it("handles rejected promises and collects errors", async () => {
    const arr = [1, 2, 3]
    const cb = (x) => (x === 2 ? Promise.reject("fail") : x + 1)
    const result = await allSettled({ array: arr }, cb)
    expect(result.values.length).toBe(3)
    expect(result.returned).toEqual([2, 4])
    expect(result.errors).toEqual(["fail"])
    expect(result.results[1].status).toBe("rejected")
  })

  it("respects limit and processes in chunks", async () => {
    const arr = [1, 2, 3, 4]
    const calls = []
    const cb = (x) => {
      calls.push(x)
      return x
    }
    const result = await allSettled({ array: arr, limit: 2 }, cb)
    expect(result.values).toEqual([1, 2, 3, 4])
    expect(calls).toEqual([1, 2, 3, 4])
  })

  it("flattens values and returned if flatten=true", async () => {
    const arr = [1, 2]
    const cb = (x) => [x, x + 1]
    const result = await allSettled({ array: arr, flatten: true }, cb)
    expect(result.values).toEqual([1, 2, 2, 3])
    expect(result.returned).toEqual([1, 2, 2, 3])
  })

  it("handles empty array", async () => {
    const result = await allSettled({ array: [] }, () => 1)
    expect(result.values).toEqual([])
    expect(result.returned).toEqual([])
    expect(result.errors).toEqual([])
    expect(result.results).toEqual([])
  })

  it("calls limiter after each chunk if provided", async () => {
    const arr = [1, 2, 3, 4, 5]
    const calls = []
    const limiterCalls = []
    const cb = (x) => {
      calls.push(x)
      return x
    }
    const limiter = jest.fn(async (n) => {
      limiterCalls.push(n)
      // simulate async delay
      await sleep(1)
    })
    const result = await allSettled({ array: arr, limit: 2, limiter }, cb)
    expect(result.values).toEqual([1, 2, 3, 4, 5])
    expect(calls).toEqual([1, 2, 3, 4, 5])
    expect(limiter).toHaveBeenCalledTimes(3)
    expect(limiterCalls).toEqual([2, 2, 1])
  })
})

describe("intervalLimiter", () => {
  it("does not delay until limit is reached", async () => {
    const limiter = intervalLimiter({ limit: 3, interval: 10 })
    const before = Date.now()
    await limiter(1)
    await limiter(1)
    await limiter(1) // should reach limit here, triggers wait
    const after = Date.now()
    expect(after - before).toBeGreaterThanOrEqual(10)
  })

  it("resets count and interval after waiting", async () => {
    const limiter = intervalLimiter({ limit: 2, interval: 5 })
    const before = Date.now()
    await limiter(1)
    await limiter(1) // triggers wait
    const afterFirst = Date.now()
    await limiter(1)
    await limiter(1) // triggers wait again
    const afterSecond = Date.now()
    expect(afterFirst - before).toBeGreaterThanOrEqual(5)
    expect(afterSecond - afterFirst).toBeGreaterThanOrEqual(5)
  })

  it("handles added < limit with no delay", async () => {
    const limiter = intervalLimiter({ limit: 10, interval: 5 })
    const before = Date.now()
    await limiter(3)
    await limiter(3)
    const after = Date.now()
    expect(after - before).toBeLessThan(5)
  })
})

describe("alert", () => {
  it("returns result if errors is empty or missing", () => {
    expect(alert({ errors: [] })).toEqual({ errors: [] })
    expect(alert({})).toEqual({})
    expect(alert(undefined)).toBeUndefined()
  })

  it("throws if errors is non-empty", () => {
    const errors = ["fail", "bad"]
    expect(() => alert({ errors })).toThrow(JSON.stringify(errors, undefined, 2))
  })
})

describe("throwFirstReject", () => {
  it("returns values and returned as same array for all fulfilled", async () => {
    const arr = [1, 2, 3]
    const cb = (x) => x * 3
    const result = await throwFirstReject({ array: arr }, cb)
    expect(result.values).toEqual([3, 6, 9])
    expect(result.returned).toEqual([3, 6, 9])
  })

  it("throws on first rejection", async () => {
    const arr = [1, 2, 3]
    const cb = (x) => (x === 2 ? Promise.reject("fail") : x)
    await expect(throwFirstReject({ array: arr }, cb)).rejects.toBe("fail")
  })

  it("respects limit and processes in chunks", async () => {
    const arr = [1, 2, 3, 4]
    const calls = []
    const cb = (x) => {
      calls.push(x)
      return x
    }
    const result = await throwFirstReject({ array: arr, limit: 2 }, cb)
    expect(result.values).toEqual([1, 2, 3, 4])
    expect(calls).toEqual([1, 2, 3, 4])
  })

  it("flattens values if flatten=true", async () => {
    const arr = [1, 2]
    const cb = (x) => [x, x + 1]
    const result = await throwFirstReject({ array: arr, flatten: true }, cb)
    expect(result.values).toEqual([1, 2, 2, 3])
    expect(result.returned).toEqual([1, 2, 2, 3])
  })

  it("handles empty array", async () => {
    const result = await throwFirstReject({ array: [] }, (x) => x)
    expect(result.values).toEqual([])
    expect(result.returned).toEqual([])
  })
})

describe("PollError", () => {
  it("is an Error subclass", () => {
    const err = new PollError("oops")
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(PollError)
    expect(err.message).toBe("oops")
  })
})
