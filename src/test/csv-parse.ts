/**
 * Shared CSV test helper.
 *
 * This parser is deliberately an independent implementation, written from
 * RFC 4180 rather than derived from `src/lib/insights/csv.ts`. It treats a
 * doubled double-quote inside a quoted field as one literal quote, allows
 * commas, CR and LF inside quoted fields, and splits records on CRLF. The
 * leading BOM is stripped before parsing. Because it shares no code with the
 * production serialiser, agreement between the two on a round trip is real
 * evidence about the escaping rules rather than a tautology.
 */

/** U+FEFF byte-order mark. Kept local so this helper imports no production code. */
const BOM = '\uFEFF'

/** Parses an RFC 4180 CSV document into a matrix of fields. */
export function parseCsv(text: string): string[][] {
  const input = text.startsWith(BOM) ? text.slice(BOM.length) : text
  const records: string[][] = []
  let record: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < input.length) {
    const ch = input[i]

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
        } else {
          inQuotes = false
          i += 1
        }
      } else {
        field += ch
        i += 1
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i += 1
    } else if (ch === ',') {
      record.push(field)
      field = ''
      i += 1
    } else if (ch === '\r' && input[i + 1] === '\n') {
      record.push(field)
      records.push(record)
      record = []
      field = ''
      i += 2
    } else {
      field += ch
      i += 1
    }
  }

  record.push(field)
  records.push(record)
  return records
}

/** Logical lines after dropping the BOM, split on CRLF. */
export function csvLines(text: string): string[] {
  const body = text.startsWith(BOM) ? text.slice(BOM.length) : text
  return body.split('\r\n')
}
