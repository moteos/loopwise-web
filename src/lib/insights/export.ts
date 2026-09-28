import type { FeedbackItem, Grain, ThemeSummary } from '../../data/feedback'
import type { FilterState } from './filter'
import { applyFilters } from './filter'
import { summarizeByTheme } from './summarize'
import {
  THEME_SUMMARY_COLUMNS,
  FEEDBACK_ITEM_COLUMNS,
  defaultColumns,
  orderedColumns,
} from './columns'
import { buildCsv, buildFilename } from './csv'

export interface ExportRequest {
  items: FeedbackItem[]
  filters: FilterState
  grain: Grain
  columnKeys: string[]
  now: Date
}

export interface ExportResult {
  filename: string
  content: string
}

/**
 * Pure CSV export seam: no I/O, no DOM. Applies the same filters the view uses,
 * resolves and canonically orders the requested columns for the grain, then
 * serialises the header and one row per summary/item.
 */
export function buildExport(request: ExportRequest): ExportResult {
  const filtered = applyFilters(request.items, request.filters)
  const keys =
    request.columnKeys.length === 0
      ? defaultColumns(request.grain)
      : request.columnKeys

  let header: string[]
  let rows: (string | number)[][]

  if (request.grain === 'theme-summary') {
    const columns = orderedColumns<ThemeSummary>(THEME_SUMMARY_COLUMNS, keys)
    header = columns.map((column) => column.key)
    rows = summarizeByTheme(filtered).map((summary) =>
      columns.map((column) => column.value(summary)),
    )
  } else {
    const columns = orderedColumns<FeedbackItem>(FEEDBACK_ITEM_COLUMNS, keys)
    header = columns.map((column) => column.key)
    rows = filtered.map((item) =>
      columns.map((column) => column.value(item)),
    )
  }

  return {
    filename: buildFilename(request.grain, request.now),
    content: buildCsv(header, rows),
  }
}
