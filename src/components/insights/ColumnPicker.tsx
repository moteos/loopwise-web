import { useEffect, useRef } from 'react'
import type { Grain } from '../../data/feedback'
import {
  GRAIN_LABELS,
  THEME_SUMMARY_COLUMNS,
  FEEDBACK_ITEM_COLUMNS,
  defaultColumns,
} from '../../lib/insights/columns'
import './ColumnPicker.css'

export interface ColumnPickerProps {
  open: boolean
  grain: Grain
  columns: Record<Grain, string[]>
  onToggle: (grain: Grain, key: string) => void
  onReset: () => void
  onClose: () => void
  id: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function sameSelection(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const wanted = new Set(b)
  return a.every((key) => wanted.has(key))
}

export default function ColumnPicker({
  open,
  grain,
  columns,
  onToggle,
  onReset,
  onClose,
  id,
}: ColumnPickerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const outside = active === null || active === dialog || !dialog.contains(active)

      if (event.shiftKey) {
        if (outside || active === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (outside || active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!open) return null

  const selected = columns[grain]
  const resettable = !sameSelection(selected, defaultColumns(grain))

  const renderGroup = (
    legend: string,
    groupGrain: Grain,
    definitions: readonly { key: string; label: string }[],
  ) => {
    const groupSelection = columns[groupGrain]
    const lastOne = groupSelection.length === 1

    return (
      <fieldset className="column-picker__group" key={groupGrain}>
        <legend className="column-picker__legend">{legend}</legend>
        <div className="column-picker__options">
          {definitions.map((definition) => {
            const checked = groupSelection.includes(definition.key)
            return (
              <label className="column-picker__option" key={definition.key}>
                <input
                  type="checkbox"
                  className="column-picker__checkbox"
                  value={definition.key}
                  checked={checked}
                  disabled={checked && lastOne}
                  onChange={() => onToggle(groupGrain, definition.key)}
                />
                <span className="column-picker__option-label">
                  {definition.label}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }

  return (
    <div
      className="column-picker__backdrop"
      data-testid="column-picker-backdrop"
      onClick={onClose}
    >
      <div
        className="column-picker__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Choose columns"
        id={id}
        ref={dialogRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="column-picker__header">
          <h2 className="column-picker__title">Choose columns</h2>
          <button
            type="button"
            className="column-picker__close"
            aria-label="Close"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p className="column-picker__count">
          {`${GRAIN_LABELS[grain]} grain: ${selected.length} columns selected.`}
        </p>

        <div className="column-picker__grid">
          {renderGroup('Theme summary columns', 'theme-summary', THEME_SUMMARY_COLUMNS)}
          {renderGroup('Feedback item columns', 'feedback-items', FEEDBACK_ITEM_COLUMNS)}
        </div>

        <p className="column-picker__guard">
          At least one column must stay selected.
        </p>

        <div className="column-picker__footer">
          <button
            type="button"
            className="btn btn--secondary column-picker__reset"
            onClick={onReset}
            disabled={!resettable}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
