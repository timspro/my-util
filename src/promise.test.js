/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-promise-reject-errors */
import { jest } from "@jest/globals"

const { poll, sleep, allSettled, alert, throwFirstReject } = await import("./promise.js")

describe("poll", () => {
  it("resolves immediately if callback returns a non-undefined/null/false value", async () => {
    const cb = jest.fn().mockReturnValue(42)
    const promise = poll(cb, 1000)
    await expect(promise).resolves.toBe(42)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("resolves after several attempts when callback returns undefined/null/false before a value", async () => {
    const cb = jest
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(0)
    const promise = poll(cb, 500)
    // Advance timers for 3 unsuccessful attempts (undefined, null, false)
    const before = Date.now()
    // The fourth call returns 0, which should resolve
    await expect(promise).resolves.toBe(0)
    const after = Date.now()
    expect((after - before) / 1000).toBeCloseTo(1.5, 1)
    expect(cb).toHaveBeenCalledTimes(4)
  })

  it('resolves if callback returns "" or NaN (should not treat as "keep polling")', async () => {
    const cb = jest.fn().mockReturnValueOnce("").mockReturnValueOnce(NaN)
    const promise1 = poll(cb, 100)
    await expect(promise1).resolves.toBe("")
    expect(cb).toHaveBeenCalledTimes(1)
    cb.mockClear()
    const promise2 = poll(cb, 100)
    await expect(promise2).resolves.toBe(NaN)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("rejects if callback throws", async () => {
    const error = new Error("fail")
    const cb = jest.fn().mockImplementation(() => {
      throw error
    })
    await expect(poll(cb, 100)).rejects.toBe(error)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it("rejects if callback returns a rejected promise", async () => {
    const error = new Error("async fail")
    const cb = jest.fn().mockReturnValue(Promise.reject(error))
    const promise = poll(cb, 100)
    await expect(promise).rejects.toBe(error)
    expect(cb).toHaveBeenCalledTimes(1)
  })
})

describe("sleep", () => {
  it("resolves after the specified milliseconds", async () => {
    const before = Date.now()
    const promise = sleep(500)
    await expect(promise).resolves.toBeUndefined()
    const after = Date.now()
    expect((after - before) / 1000).toBeCloseTo(0.5, 1)
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
