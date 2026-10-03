import { describe, it, expect } from 'vitest'

import { BOM, escapeField, buildCsv, buildFilename } from './csv'
import { parseCsv } from '../../test/csv-parse'

describe('buildCsv', () => {
  it('starts with the BOM character', () => {
    const result = buildCsv(['a', 'b'], [['1', '2']])
    expect(result.charAt(0)).toBe(BOM)
    expect(result.charCodeAt(0)).toBe(0xfeff)
  })

  it('joins lines with CRLF', () => {
    const result = buildCsv(['a', 'b'], [['1', '2'], ['3', '4']])
    expect(result).toBe(BOM + 'a,b\r\n1,2\r\n3,4')
  })

  it('does not append a trailing newline', () => {
    const result = buildCsv(['h'], [['y']])
    expect(result.endsWith('\r\n')).toBe(false)
    expect(result.endsWith('\n')).toBe(false)
    expect(result.endsWith('y')).toBe(true)
    expect(result).toBe(BOM + 'h\r\ny')
  })

  it('still emits the header when there are zero rows', () => {
    expect(buildCsv(['a', 'b'], [])).toBe(BOM + 'a,b')
  })

  it('returns just the BOM for an empty header and no rows', () => {
    expect(buildCsv([], [])).toBe(BOM)
  })

  it('stringifies numbers without separators or currency symbols', () => {
    const result = buildCsv(['mrr'], [[12345]])
    expect(result).toBe(BOM + 'mrr\r\n12345')
    expect(result).not.toContain('12,345')
    expect(result).not.toContain('$')
  })
})

describe('escapeField', () => {
  it('leaves plain values unchanged', () => {
    expect(escapeField('plain')).toBe('plain')
    expect(escapeField('has space')).toBe('has space')
  })

  it('quotes a value containing a comma', () => {
    expect(escapeField('a,b')).toBe('"a,b"')
  })

  it('quotes and doubles a value containing a double quote', () => {
    expect(escapeField('say "hi"')).toBe('"say ""hi"""')
  })

  it('quotes values containing a newline or carriage return', () => {
    expect(escapeField('line\nbreak')).toBe('"line\nbreak"')
    expect(escapeField('car\rreturn')).toBe('"car\rreturn"')
  })
})

describe('round trip', () => {
  it('a real RFC 4180 parser recovers the original header and rows', () => {
    const header = ['theme', 'note']
    const rows: (string | number)[][] = [
      ['first', 'a, "b"\nc'],
      ['second', 'plain value'],
      ['third', 'has "quotes" and, a comma'],
    ]

    const parsed = parseCsv(buildCsv(header, rows))
    const expected: string[][] = [header, ...rows.map((row) => row.map(String))]
    expect(parsed).toEqual(expected)

    // The tricky field survives character-for-character.
    expect(parsed[1][1]).toBe('a, "b"\nc')
  })
})

describe('buildFilename', () => {
  it('produces the theme-summary filename', () => {
    expect(buildFilename('theme-summary', new Date(2026, 8, 27))).toBe(
      'loopwise-insights-theme-summary-2026-09-27.csv',
    )
  })

  it('produces the feedback-items filename', () => {
    expect(buildFilename('feedback-items', new Date(2026, 8, 27))).toBe(
      'loopwise-insights-feedback-items-2026-09-27.csv',
    )
  })

  it('zero-pads month and day and changes with the date', () => {
    const a = buildFilename('theme-summary', new Date(2026, 8, 27))
    const b = buildFilename('theme-summary', new Date(2026, 0, 5))
    expect(b).toBe('loopwise-insights-theme-summary-2026-01-05.csv')
    expect(a).not.toBe(b)
  })
})
