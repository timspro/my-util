/* eslint-disable prefer-promise-reject-errors */
import { describe, expect, it, vi } from "vitest"

// Exported API under test:
// - classes: PollError, PromiseAllError
// - functions: poll, sleep, allSettled, allPatiently, intervalLimiter, alert

import {
  alert,
  allPatiently,
  allSettled,
  intervalLimiter,
  poll,
  PollError,
  PromiseAllError,
  sleep,
} from "./promise.js"

describe("poll", () => {
  it("resolves immediately if callback returns a non-undefined/null/false value", async () => {
    const cb = vi.fn().mockReturnValue(42)
    const promise = poll({ ms: 1 }, cb)
    await expect(promise).resolves.toBe(42)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(0)
  })

  it("resolves after several attempts when callback returns undefined/null/false before a value", async () => {
    const cb = vi
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
    const cb = vi.fn().mockReturnValueOnce("").mockReturnValueOnce(NaN)
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
    const cb = vi.fn().mockImplementation(() => {
      throw error
    })
    await expect(poll({ ms: 1 }, cb)).rejects.toBe(error)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("rejects if callback returns a rejected promise", async () => {
    const error = new Error("async fail")
    const cb = vi.fn().mockReturnValue(Promise.reject(error))
    const promise = poll({ ms: 1 }, cb)
    await expect(promise).rejects.toBe(error)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("waits before first call if wait=true", async () => {
    vi.useFakeTimers()
    try {
      const cb = vi.fn().mockReturnValue(1)
      const promise = poll({ ms: 2, wait: true }, cb)
      await vi.advanceTimersByTimeAsync(1)
      expect(cb).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      await expect(promise).resolves.toBe(1)
      expect(cb).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it("waits specified ms before first call if wait is a number", async () => {
    vi.useFakeTimers()
    try {
      const cb = vi.fn().mockReturnValue(1)
      const promise = poll({ ms: 2, wait: 5 }, cb)
      await vi.advanceTimersByTimeAsync(4)
      expect(cb).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      await expect(promise).resolves.toBe(1)
      expect(cb).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it("rejects with PollError if attempts is reached", async () => {
    const cb = vi.fn().mockReturnValue(undefined)
    const promise = poll({ ms: 1, attempts: 3 }, cb)
    await expect(promise).rejects.toBeInstanceOf(PollError)
    await expect(promise).rejects.toThrow("max attempts reached")
    expect(cb).toHaveBeenCalledTimes(3)
    expect(cb.mock.calls.map((args) => args[0])).toEqual([0, 1, 2])
  })

  it("resolves if callback returns a value before reaching max attempts", async () => {
    const cb = vi
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
  it("does not resolve before the specified milliseconds, and does resolve once they elapse", async () => {
    vi.useFakeTimers()
    try {
      let resolved = false
      sleep(5).then(() => {
        resolved = true
      })
      await vi.advanceTimersByTimeAsync(4)
      expect(resolved).toBe(false)
      await vi.advanceTimersByTimeAsync(1)
      expect(resolved).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("resolves immediately if ms is negative, without scheduling a timer", async () => {
    vi.useFakeTimers()
    try {
      const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")
      await expect(sleep(-10)).resolves.toBeUndefined()
      expect(setTimeoutSpy).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
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

  it("returns correct structure for all fulfilled", async () => {
    const arr = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
    const result = await allSettled({ array: arr })
    expect(result.values).toEqual([1, 2, 3])
    expect(result.returned).toEqual([1, 2, 3])
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

  it("passes through null/undefined when flatten=true", async () => {
    const arr = [0, 1, 2, 3]
    const cb = (x) => {
      if (x === 0) return [1, null]
      if (x === 1) return undefined
      if (x === 2) return [3]
      return null
    }
    const result = await allSettled({ array: arr, flatten: true }, cb)
    expect(result.values).toEqual([1, null, undefined, 3, null])
    expect(result.returned).toEqual([1, null, undefined, 3, null])
    expect(result.errors).toEqual([])
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
    const limiter = vi.fn(async (n) => {
      limiterCalls.push(n)
      await sleep(1)
    })
    const result = await allSettled({ array: arr, limit: 2, limiter }, cb)
    expect(result.values).toEqual([1, 2, 3, 4, 5])
    expect(calls).toEqual([1, 2, 3, 4, 5])
    expect(limiter).toHaveBeenCalledTimes(3)
    expect(limiterCalls).toEqual([2, 2, 1])
  })

  it("returns early if abort=true and any error occurs", async () => {
    const arr = [1, 2, 3, 4, 5, 6]
    const cb = vi
      .fn()
      .mockImplementation((x) => (x === 2 || x === 4 ? Promise.reject(`fail${x}`) : x))
    const result = await allSettled({ array: arr, limit: 2, abort: true }, cb)
    expect(result.values.length).toBe(2)
    expect(result.errors).toEqual(["fail2"])
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it("accepts non-Array iterable via iterable option (Map)", async () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ])
    const cb = ([k, v]) => `${k}:${v * 2}`
    const result = await allSettled({ iterable: map, limit: 2 }, cb)
    expect(result.values).toEqual(["a:2", "b:4", "c:6"])
    expect(result.returned).toEqual(["a:2", "b:4", "c:6"])
    expect(result.errors).toEqual([])
    expect(result.results.every((r) => r.status === "fulfilled")).toBe(true)
  })

  it("throws joined error message when throws=true and adopts stack from first error", async () => {
    const e1 = new Error("e1")
    const e2 = new Error("third")
    const arr = [1, 2, 3]
    const cb = (x) => {
      if (x === 1) return Promise.reject(e1)
      if (x === 2) return x // fulfilled
      return Promise.reject(e2)
    }
    let thrown
    try {
      await allSettled({ array: arr, throws: true }, cb)
    } catch (e) {
      thrown = e
    }
    expect(thrown).toBeInstanceOf(PromiseAllError)
    expect(thrown.message).toBe("e1; third")
    expect(thrown.stack).toBe(e1.stack)
  })

  it("passes callback an index and array relative to the current batch", async () => {
    const calls = []
    await allSettled(
      { array: ["a", "b", "c", "d", "e"], limit: 2 },
      async (element, index, batch) => {
        calls.push([element, index, [...batch]])
      }
    )
    expect(calls).toEqual([
      ["a", 0, ["a", "b"]],
      ["b", 1, ["a", "b"]],
      ["c", 0, ["c", "d"]],
      ["d", 1, ["c", "d"]],
      ["e", 0, ["e"]],
    ])
  })

  it("does not collect synchronous throws from a non-async callback", async () => {
    const cb = (x) => {
      if (x === 2) {
        throw new Error("sync")
      }
      return x
    }
    await expect(allSettled({ array: [1, 2, 3] }, cb)).rejects.toThrow("sync")
  })
})

describe("allPatiently", () => {
  it("returns flattened values when all promises resolve", async () => {
    const promises = [Promise.resolve([1]), Promise.resolve([2, 3])]
    const result = await allPatiently(promises, { flatten: true })
    expect(result).toEqual([1, 2, 3])
  })

  it("throws with joined messages when any promise rejects", async () => {
    const bad = new Error("bad")
    const promises = [Promise.resolve(1), Promise.reject(bad), Promise.reject("oops")]
    await expect(allPatiently(promises, { flatten: false })).rejects.toThrow("bad; oops")
  })
})

describe("intervalLimiter", () => {
  it("does not delay until limit is reached", async () => {
    vi.useFakeTimers()
    try {
      const limiter = intervalLimiter({ limit: 3, interval: 10 })
      const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")
      await limiter(1)
      await limiter(1)
      expect(setTimeoutSpy).not.toHaveBeenCalled()
      let resolved = false
      limiter(1).then(() => {
        resolved = true
      }) // should reach limit here, triggers wait
      await vi.advanceTimersByTimeAsync(9)
      expect(resolved).toBe(false)
      await vi.advanceTimersByTimeAsync(1)
      expect(resolved).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("resets count and interval after waiting", async () => {
    vi.useFakeTimers()
    try {
      const limiter = intervalLimiter({ limit: 2, interval: 5 })
      await limiter(1)
      let resolvedFirst = false
      limiter(1).then(() => {
        resolvedFirst = true
      }) // triggers wait
      await vi.advanceTimersByTimeAsync(4)
      expect(resolvedFirst).toBe(false)
      await vi.advanceTimersByTimeAsync(1)
      expect(resolvedFirst).toBe(true)

      await limiter(1)
      let resolvedSecond = false
      limiter(1).then(() => {
        resolvedSecond = true
      }) // triggers wait again
      await vi.advanceTimersByTimeAsync(4)
      expect(resolvedSecond).toBe(false)
      await vi.advanceTimersByTimeAsync(1)
      expect(resolvedSecond).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("handles added < limit with no delay", async () => {
    const limiter = intervalLimiter({ limit: 10, interval: 5 })
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")
    await limiter(3)
    await limiter(3)
    expect(setTimeoutSpy).not.toHaveBeenCalled()
    setTimeoutSpy.mockRestore()
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

describe("PollError", () => {
  it("is an Error subclass", () => {
    const err = new PollError("oops")
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(PollError)
    expect(err.message).toBe("oops")
  })
})
