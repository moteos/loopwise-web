import { useEffect, useMemo, useRef, useState } from 'react'
import type { Grain } from '../data/feedback'
import { loadFeedback } from '../data/feedback'
import type { FilterState } from '../lib/insights/filter'
import {
  DEFAULT_FILTERS,
  applyFilters,
  isDateBound,
} from '../lib/insights/filter'
import { summarizeByTheme } from '../lib/insights/summarize'
import {
  DEFAULT_COLUMN_SELECTION,
  FEEDBACK_ITEM_COLUMNS,
  THEME_SUMMARY_COLUMNS,
  defaultColumns,
} from '../lib/insights/columns'
import { buildExport } from '../lib/insights/export'
import { downloadCsv } from '../lib/insights/download'
import FilterBar from '../components/insights/FilterBar'
import InsightsExport from '../components/insights/InsightsExport'
import type { ExportFeedback } from '../components/insights/InsightsExport'
import ColumnPicker from '../components/insights/ColumnPicker'
import './Insights.css'

interface InsightsProps {
  onDownload?: (filename: string, content: string) => void
}

const PICKER_ID = 'insights-column-picker'

export default function Insights({ onDownload = downloadCsv }: InsightsProps) {
  const loaded = useMemo(() => loadFeedback(), [])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [grain, setGrain] = useState<Grain>('theme-summary')
  const [columns, setColumns] = useState(DEFAULT_COLUMN_SELECTION)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [feedback, setFeedback] = useState<ExportFeedback | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)

  const filtered = useMemo(
    () => applyFilters(loaded.items, filters),
    [loaded.items, filters],
  )
  const summaries = useMemo(() => summarizeByTheme(filtered), [filtered])

  const maxMentions = useMemo(
    () => summaries.reduce((max, summary) => Math.max(max, summary.mentions), 0),
    [summaries],
  )

  // Focus returns to the [Choose columns] trigger once the panel closes.
  const clusterRef = useRef<HTMLDivElement>(null)
  const wasPickerOpen = useRef(false)
  useEffect(() => {
    if (wasPickerOpen.current && !pickerOpen) {
      clusterRef.current
        ?.querySelector<HTMLButtonElement>(`[aria-controls="${PICKER_ID}"]`)
        ?.focus()
    }
    wasPickerOpen.current = pickerOpen
  }, [pickerOpen])

  const handleFiltersChange = (next: FilterState) => {
    // Date bounds are the only user input with a parse rule. A native date
    // input reports either '' or YYYY-MM-DD, but the guard is kept so a bad
    // value can never reach the filter state.
    if (next.from !== filters.from && next.from !== null && !isDateBound(next.from)) {
      setDateError('Enter the start date as YYYY-MM-DD.')
      return
    }
    if (next.to !== filters.to && next.to !== null && !isDateBound(next.to)) {
      setDateError('Enter the end date as YYYY-MM-DD.')
      return
    }
    setDateError(null)
    setFilters(next)
    // The export confirmation is a statement about the previous result set:
    // it persists until the next filter change or export (prototype 4.4.3).
    setFeedback(null)
  }

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS)
    setDateError(null)
    setFeedback(null)
  }

  const handleToggleColumn = (grainKey: Grain, key: string) => {
    // DEFAULT_COLUMN_SELECTION holds shared array references, so never mutate:
    // always hand back a fresh object and a fresh array.
    setColumns((previous) => {
      const current = previous[grainKey]
      const next = current.includes(key)
        ? current.filter((candidate) => candidate !== key)
        : [...current, key]
      return { ...previous, [grainKey]: next }
    })
  }

  const handleResetColumns = () => {
    setColumns((previous) => ({
      ...previous,
      [grain]: defaultColumns(grain),
    }))
  }

  const handleExport = () => {
    try {
      const result = buildExport({
        items: loaded.items,
        filters,
        grain,
        columnKeys: columns[grain],
        now: new Date(),
      })
      onDownload(result.filename, result.content)
      setFeedback(
        filtered.length === 0
          ? { kind: 'empty', filename: result.filename }
          : { kind: 'success', filename: result.filename },
      )
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Export failed.',
      })
    }
  }

  const caption =
    summaries.length > 0
      ? `The ${summaries.length} most-mentioned themes in this view.`
      : '0 items and 0 themes in this view.'

  const rowCount =
    grain === 'theme-summary' ? summaries.length : filtered.length
  const totalColumnCount =
    grain === 'theme-summary'
      ? THEME_SUMMARY_COLUMNS.length
      : FEEDBACK_ITEM_COLUMNS.length

  return (
    <div className="insights section">
      <div className="container">
        <div className="insights__head">
          <div>
            <h1 className="insights__title">Insights</h1>
            <p className="insights__lead">Top feedback themes</p>
          </div>
        </div>

        <FilterBar
          filters={filters}
          dateError={dateError}
          onChange={handleFiltersChange}
          onClear={handleClear}
        />

        {/* The export cluster follows the filter bar so the DOM order matches
            the declared focus order: filters, then grain and export. */}
        <div className="insights__export-row" ref={clusterRef}>
          <InsightsExport
            grain={grain}
            onGrainChange={setGrain}
            selectedColumnKeys={columns[grain]}
            totalColumnCount={totalColumnCount}
            onChooseColumns={() => setPickerOpen(true)}
            pickerOpen={pickerOpen}
            pickerId={PICKER_ID}
            onExport={handleExport}
            rowCount={rowCount}
            feedback={feedback}
          />
        </div>

        {loaded.dropped > 0 && (
          <p className="insights__notice">
            Some feedback items could not be read and were left out of this
            view.
          </p>
        )}

        <div className="insights__panel">
          {summaries.length > 0 && (
            <table className="themes-table">
              <caption className="visually-hidden">
                Top feedback themes by number of mentions
              </caption>
              <thead>
                <tr>
                  <th scope="col">Theme</th>
                  <th scope="col" className="themes-table__count">
                    Mentions
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((summary) => {
                  const width =
                    maxMentions > 0
                      ? `${Math.max(
                          4,
                          Math.round((summary.mentions / maxMentions) * 100),
                        )}%`
                      : '0%'
                  return (
                    <tr key={summary.theme}>
                      <th scope="row">{summary.theme}</th>
                      <td className="themes-table__count">
                        <span className="themes-table__cell">
                          <span
                            className="themes-table__bar"
                            style={{ width }}
                            aria-hidden="true"
                          />
                          <span className="themes-table__value">
                            {summary.mentions}
                          </span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {summaries.length === 0 && (
            <div className="insights__empty" role="status">
              <p>No feedback matched these filters.</p>
              <p>
                Widen the date range or clear a filter to see the themes again.
              </p>
              <p>An export now downloads a header row only.</p>
            </div>
          )}
        </div>

        <p className="insights__caption">{caption}</p>
      </div>

      <ColumnPicker
        open={pickerOpen}
        grain={grain}
        columns={columns}
        onToggle={handleToggleColumn}
        onReset={handleResetColumns}
        onClose={() => setPickerOpen(false)}
        id={PICKER_ID}
      />
    </div>
  )
}
