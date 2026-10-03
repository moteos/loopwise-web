import type { Grain } from '../../data/feedback'

/** U+FEFF byte-order mark, emitted so Windows Excel reads the file as UTF-8. */
export const BOM: string = '\uFEFF'

/**
 * RFC 4180 field escaping. Values free of commas, double quotes, carriage
 * returns and newlines are returned unchanged; otherwise the value is wrapped
 * in double quotes with every internal double quote doubled.
 */
export function escapeField(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\r') ||
    value.includes('\n')
  ) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

/**
 * Serialises a header and rows to a CRLF-delimited RFC 4180 CSV document.
 * The result begins with the BOM and carries no trailing newline.
 */
export function buildCsv(header: string[], rows: (string | number)[][]): string {
  const lines: string[] = []

  if (header.length > 0 || rows.length > 0) {
    lines.push(header.map(escapeField).join(','))
    for (const row of rows) {
      lines.push(row.map((field) => escapeField(String(field))).join(','))
    }
  }

  return BOM + lines.join('\r\n')
}

/**
 * Builds the download filename for an export, using the supplied date's local
 * year, month and day zero-padded to two digits. Never reads the clock.
 */
export function buildFilename(grain: Grain, date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `loopwise-insights-${grain}-${year}-${month}-${day}.csv`
}
