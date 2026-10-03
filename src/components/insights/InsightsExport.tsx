import { useRef } from 'react'
import type { Grain } from '../../data/feedback'
import {
  GRAIN_LABELS,
  THEME_SUMMARY_COLUMNS,
  FEEDBACK_ITEM_COLUMNS,
} from '../../lib/insights/columns'
import './InsightsExport.css'

export type ExportFeedback =
  | { kind: 'success'; filename: string }
  | { kind: 'empty'; filename: string }
  | { kind: 'error'; message: string }

interface InsightsExportProps {
  grain: Grain
  onGrainChange: (grain: Grain) => void
  selectedColumnKeys: string[]
  totalColumnCount: number
  onChooseColumns: () => void
  pickerOpen: boolean
  pickerId: string
  onExport: () => void
  rowCount: number
  feedback: ExportFeedback | null
}

const GRAIN_ORDER: Grain[] = ['theme-summary', 'feedback-items']

const GRAIN_HELP: Record<Grain, string> = {
  'theme-summary': 'one row per theme',
  'feedback-items': 'one row per feedback item',
}

export default function InsightsExport({
  grain,
  onGrainChange,
  selectedColumnKeys,
  totalColumnCount,
  onChooseColumns,
  pickerOpen,
  pickerId,
  onExport,
  rowCount,
  feedback,
}: InsightsExportProps) {
  const labelByKey: Record<string, string | undefined> =
    grain === 'theme-summary'
      ? Object.fromEntries(
          THEME_SUMMARY_COLUMNS.map((column) => [column.key, column.label]),
        )
      : Object.fromEntries(
          FEEDBACK_ITEM_COLUMNS.map((column) => [column.key, column.label]),
        )

  const selectedLabels = selectedColumnKeys
    .map((key) => labelByKey[key])
    .filter((label): label is string => Boolean(label))
  const columnSummary = selectedLabels.join(', ')

  // A download is produced in the same frame as the click, so re-clicks
  // within that frame are ignored (prototype 4.2.3, interaction 4).
  const exportInFlight = useRef(false)

  const handleExport = () => {
    if (exportInFlight.current) return
    exportInFlight.current = true
    window.requestAnimationFrame(() => {
      exportInFlight.current = false
    })
    onExport()
  }

  return (
    <div className="insights-export">
      <fieldset className="insights-export__grain">
        <legend className="insights-export__legend">Grain</legend>
        {GRAIN_ORDER.map((option) => (
          <label key={option} className="insights-export__grain-option">
            <input
              type="radio"
              name="grain"
              value={option}
              checked={grain === option}
              onChange={() => onGrainChange(option)}
            />
            <span className="insights-export__grain-text">
              <span className="insights-export__grain-name">
                {GRAIN_LABELS[option]}
              </span>
              <span className="insights-export__grain-help">
                {GRAIN_HELP[option]}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <p
        className="insights-export__columns"
        title={selectedLabels.length > 0 ? columnSummary : undefined}
      >
        Columns {selectedColumnKeys.length} of {totalColumnCount} selected
        {selectedLabels.length > 0 ? ` — ${columnSummary}` : ''}
      </p>

      <div className="insights-export__actions">
        <button
          type="button"
          className="btn btn--secondary"
          aria-expanded={pickerOpen}
          aria-controls={pickerId}
          onClick={onChooseColumns}
        >
          Choose columns
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleExport}
        >
          Export CSV
        </button>
        <span className="insights-export__rows">
          {rowCount} {rowCount === 1 ? 'row' : 'rows'} in this view
        </span>
      </div>

      {feedback ? (
        <p className="insights-export__feedback" role="status">
          {feedback.kind === 'success' && `Last export: ${feedback.filename}`}
          {feedback.kind === 'empty' && 'No feedback matched your filters.'}
          {feedback.kind === 'error' && feedback.message}
        </p>
      ) : null}
    </div>
  )
}
