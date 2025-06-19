import { beforeEach, describe, expect, it, jest } from "@jest/globals"

const readFileMock = jest.fn()
const statMock = jest.fn()
const tmpdirMock = jest.fn()
const gunzipMock = jest.fn()
jest.unstable_mockModule("node:fs/promises", () => ({
  readFile: readFileMock,
  stat: statMock,
}))
jest.unstable_mockModule("node:os", () => ({
  tmpdir: tmpdirMock,
}))
jest.unstable_mockModule("node:zlib", () => ({
  gunzip: gunzipMock,
}))
jest.unstable_mockModule("node:util", () => ({
  promisify: (mock) => mock,
}))

// Now import the module under test
const mod = await import("./fs.js")
const { getJSON, getCompressedJSON, pathExists, makeTempDirectory } = mod

describe("getJSON", () => {
  beforeEach(() => jest.clearAllMocks())
  it("parses JSON from file", async () => {
    readFileMock.mockResolvedValue(Buffer.from('{"a":1}'))
    const result = await getJSON("foo.json")
    expect(result).toEqual({ a: 1 })
    expect(readFileMock).toHaveBeenCalledWith("foo.json")
  })
})

describe("getCompressedJSON", () => {
  beforeEach(() => jest.clearAllMocks())
  it("reads, decompresses, and parses JSON", async () => {
    readFileMock.mockResolvedValue(Buffer.from("gzipped"))
    gunzipMock.mockResolvedValue(Buffer.from('{"b":2}'))
    const result = await getCompressedJSON("bar.gz")
    expect(result).toEqual({ b: 2 })
    expect(readFileMock).toHaveBeenCalledWith("bar.gz")
    expect(gunzipMock).toHaveBeenCalled()
  })
})

describe("pathExists", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it("returns stats if file exists", async () => {
    const stats = { mtime: new Date(Date.now() - 1000) }
    statMock.mockResolvedValue(stats)
    const result = await pathExists("file.txt")
    expect(result).toBe(stats)
    expect(statMock).toHaveBeenCalledWith("file.txt")
  })
  it("returns false if file is too old for maxAge", async () => {
    const stats = { mtime: new Date(Date.now() - 2000) }
    statMock.mockResolvedValue(stats)
    const result = await pathExists("file.txt", { maxAge: 1000 })
    expect(result).toBe(false)
  })
  it("returns stats if file is within maxAge", async () => {
    const stats = { mtime: new Date(Date.now() - 500) }
    statMock.mockResolvedValue(stats)
    const result = await pathExists("file.txt", { maxAge: 1000 })
    expect(result).toBe(stats)
  })
  it("returns false if file does not exist and throws=false", async () => {
    const err = Object.assign(new Error("not found"), { code: "ENOENT" })
    statMock.mockRejectedValue(err)
    const result = await pathExists("nope.txt", { throws: false })
    expect(result).toBe(false)
  })
  it("throws if file does not exist and throws=true", async () => {
    const err = Object.assign(new Error("not found"), { code: "ENOENT" })
    statMock.mockRejectedValue(err)
    await expect(pathExists("nope.txt", { throws: true })).rejects.toThrow("not found")
  })
  it("throws if stat throws for other reasons", async () => {
    const err = Object.assign(new Error("bad"), { code: "EACCES" })
    statMock.mockRejectedValue(err)
    await expect(pathExists("bad.txt")).rejects.toThrow("bad")
  })
  it("returns stats if maxAge is undefined", async () => {
    const stats = { mtime: new Date(Date.now() - 999999) }
    statMock.mockResolvedValue(stats)
    const result = await pathExists("file.txt", {})
    expect(result).toBe(stats)
  })
})

describe("makeTempDirectory", () => {
  it("returns the temp directory", () => {
    tmpdirMock.mockReturnValue("/tmp")
    expect(makeTempDirectory()).toBe("/tmp")
    expect(tmpdirMock).toHaveBeenCalled()
  })
})
