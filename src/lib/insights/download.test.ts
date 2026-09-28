import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv } from './download'

const originalCreate = URL.createObjectURL
const originalRevoke = URL.revokeObjectURL

type CreateMock = ReturnType<typeof vi.fn<(blob: Blob | MediaSource) => string>>
type RevokeMock = ReturnType<typeof vi.fn<(url: string) => void>>

let createMock: CreateMock
let revokeMock: RevokeMock

// jsdom ships neither URL.createObjectURL nor URL.revokeObjectURL, so both are
// stubbed. The revoke stub also keeps the scheduled timer from touching a
// missing real implementation after a test finishes.
function stubObjectUrls(url = 'blob:test'): void {
  createMock = vi.fn<(blob: Blob | MediaSource) => string>(() => url)
  revokeMock = vi.fn<(url: string) => void>()
  URL.createObjectURL = createMock
  URL.revokeObjectURL = revokeMock
}

afterEach(() => {
  URL.createObjectURL = originalCreate
  URL.revokeObjectURL = originalRevoke
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('downloadCsv', () => {
  it('clicks an attached anchor carrying the requested filename and url', () => {
    stubObjectUrls()
    // Firefox and Safari only start a programmatic download when the anchor is
    // in the document, so record the state that held at the moment of the
    // click rather than inspecting the (now detached) instance afterwards.
    let attachedAtClick: boolean | undefined
    let downloadAtClick: string | undefined
    let hrefAtClick: string | undefined
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        attachedAtClick = document.body.contains(this)
        downloadAtClick = this.download
        hrefAtClick = this.href
      })

    downloadCsv('loopwise-insights-theme-summary-2026-09-27.csv', 'a,b')

    expect(click).toHaveBeenCalledTimes(1)
    expect(attachedAtClick).toBe(true)
    expect(downloadAtClick).toBe('loopwise-insights-theme-summary-2026-09-27.csv')
    expect(hrefAtClick).toBe('blob:test')
  })

  it('builds the blob from the csv content', async () => {
    stubObjectUrls()

    downloadCsv('x.csv', 'a,b\n1,2')

    const blob = createMock.mock.calls[0][0] as Blob
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('text/csv;charset=utf-8')
    await expect(blob.text()).resolves.toBe('a,b\n1,2')
  })

  it('removes the temporary anchor from the document', () => {
    stubObjectUrls()

    downloadCsv('x.csv', 'a')

    expect(document.body.querySelector('a[download]')).toBeNull()
  })

  it('revokes the object URL after the browser has started the transfer', () => {
    vi.useFakeTimers()
    stubObjectUrls('blob:revoke-me')

    downloadCsv('x.csv', 'a')

    expect(revokeMock).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(revokeMock).toHaveBeenCalledTimes(1)
    expect(revokeMock).toHaveBeenCalledWith('blob:revoke-me')
  })

  it('does not revoke a URL that was never created', () => {
    vi.useFakeTimers()
    stubObjectUrls()
    createMock.mockImplementation(() => {
      throw new Error('createObjectURL is unavailable')
    })

    expect(() => downloadCsv('x.csv', 'a')).toThrowError(/x\.csv/)

    vi.advanceTimersByTime(1)
    expect(revokeMock).not.toHaveBeenCalled()
  })

  it('surfaces a preparation failure with the filename and the original cause', () => {
    stubObjectUrls()
    const failure = new Error('createObjectURL is unavailable')
    createMock.mockImplementation(() => {
      throw failure
    })

    let caught: unknown
    try {
      downloadCsv('x.csv', 'a')
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(Error)
    expect((caught as Error).message).toContain('x.csv')
    expect((caught as Error).cause).toBe(failure)
  })
})
