import { useMemo, useState } from 'react'
import { loadFeedback } from '../data/feedback'
import type { FilterState } from '../lib/insights/filter'
import {
  DEFAULT_FILTERS,
  applyFilters,
  isDateBound,
} from '../lib/insights/filter'
import { summarizeByTheme } from '../lib/insights/summarize'
import FilterBar from '../components/insights/FilterBar'
import './Insights.css'

export default function Insights() {
  const loaded = useMemo(() => loadFeedback(), [])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
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
  }

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS)
    setDateError(null)
  }

  const caption =
    summaries.length > 0
      ? `The ${summaries.length} most-mentioned themes in this view.`
      : '0 items and 0 themes in this view.'

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
            </div>
          )}
        </div>

        <p className="insights__caption">{caption}</p>
      </div>
    </div>
  )
}
