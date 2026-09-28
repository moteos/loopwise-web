import { useId } from 'react'
import type { Sentiment } from '../../data/feedback'
import { PLANS, SENTIMENTS, SOURCES } from '../../data/feedback'
import type { FilterState } from '../../lib/insights/filter'
import { isDefaultFilters } from '../../lib/insights/filter'
import './FilterBar.css'

interface FilterBarProps {
  filters: FilterState
  dateError: string | null
  onChange: (next: FilterState) => void
  onClear: () => void
}

const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
}

export default function FilterBar({
  filters,
  dateError,
  onChange,
  onClear,
}: FilterBarProps) {
  // One id base per instance keeps labels attached without risking a clash
  // between two FilterBars rendered on the same page.
  const baseId = useId()
  const planId = `${baseId}-plan`
  const sourceId = `${baseId}-source`
  const sentimentId = `${baseId}-sentiment`
  const fromId = `${baseId}-from`
  const toId = `${baseId}-to`

  const handleFrom = (value: string) => {
    onChange({ ...filters, from: value === '' ? null : value })
  }

  const handleTo = (value: string) => {
    onChange({ ...filters, to: value === '' ? null : value })
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar__field">
        <label className="filter-bar__label" htmlFor={planId}>
          Plan
        </label>
        <select
          id={planId}
          className="filter-bar__control"
          value={filters.plan}
          onChange={(event) =>
            onChange({
              ...filters,
              plan: event.target.value as FilterState['plan'],
            })
          }
        >
          <option value="all">All plans</option>
          {PLANS.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-bar__field">
        <label className="filter-bar__label" htmlFor={sourceId}>
          Source
        </label>
        <select
          id={sourceId}
          className="filter-bar__control"
          value={filters.source}
          onChange={(event) =>
            onChange({
              ...filters,
              source: event.target.value as FilterState['source'],
            })
          }
        >
          <option value="all">All sources</option>
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-bar__field">
        <label className="filter-bar__label" htmlFor={sentimentId}>
          Sentiment
        </label>
        <select
          id={sentimentId}
          className="filter-bar__control"
          value={filters.sentiment}
          onChange={(event) =>
            onChange({
              ...filters,
              sentiment: event.target.value as FilterState['sentiment'],
            })
          }
        >
          <option value="all">All sentiments</option>
          {SENTIMENTS.map((sentiment) => (
            <option key={sentiment} value={sentiment}>
              {SENTIMENT_LABELS[sentiment]}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-bar__field">
        <label className="filter-bar__label" htmlFor={fromId}>
          From
        </label>
        <input
          id={fromId}
          className="filter-bar__control"
          type="date"
          value={filters.from ?? ''}
          onChange={(event) => handleFrom(event.target.value)}
        />
      </div>

      <div className="filter-bar__field">
        <label className="filter-bar__label" htmlFor={toId}>
          To
        </label>
        <input
          id={toId}
          className="filter-bar__control"
          type="date"
          value={filters.to ?? ''}
          onChange={(event) => handleTo(event.target.value)}
        />
      </div>

      <div className="filter-bar__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onClear}
          disabled={isDefaultFilters(filters)}
        >
          Clear filters
        </button>
      </div>

      {dateError !== null && (
        <p className="filter-bar__error" role="alert">
          {dateError}
        </p>
      )}
    </div>
  )
}
