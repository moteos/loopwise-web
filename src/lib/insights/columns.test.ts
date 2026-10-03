import { describe, it, expect } from 'vitest'
import type { ColumnDef } from './columns'
import {
  GRAIN_LABELS,
  THEME_SUMMARY_COLUMNS,
  FEEDBACK_ITEM_COLUMNS,
  DEFAULT_THEME_SUMMARY_COLUMNS,
  DEFAULT_FEEDBACK_ITEM_COLUMNS,
  DEFAULT_COLUMN_SELECTION,
  defaultColumns,
  orderedColumns,
} from './columns'
import type { ThemeSummary } from '../../data/feedback'

const themeSummaryColumn = (key: string): ColumnDef<ThemeSummary> => {
  const column = THEME_SUMMARY_COLUMNS.find((c) => c.key === key)
  if (!column) throw new Error(`missing theme-summary column: ${key}`)
  return column
}

describe('column definitions', () => {
  it('has the exact default theme-summary selection', () => {
    expect(DEFAULT_THEME_SUMMARY_COLUMNS).toEqual([
      'theme',
      'mentions',
      'affected_arr',
      'sentiment',
    ])
    expect(defaultColumns('theme-summary')).toEqual(DEFAULT_THEME_SUMMARY_COLUMNS)
    expect(DEFAULT_COLUMN_SELECTION['theme-summary']).toEqual(DEFAULT_THEME_SUMMARY_COLUMNS)
  })

  it('has all seven default feedback-item keys in canonical order', () => {
    expect(DEFAULT_FEEDBACK_ITEM_COLUMNS).toEqual([
      'date',
      'source',
      'account',
      'plan',
      'account_mrr',
      'theme',
      'sentiment',
    ])
    expect(defaultColumns('feedback-items')).toEqual(DEFAULT_FEEDBACK_ITEM_COLUMNS)
    expect(DEFAULT_COLUMN_SELECTION['feedback-items']).toEqual(DEFAULT_FEEDBACK_ITEM_COLUMNS)
  })

  it('returns orderedColumns in canonical order when keys are shuffled', () => {
    const result = orderedColumns(THEME_SUMMARY_COLUMNS, ['sentiment', 'theme', 'mentions'])
    expect(result.map((c) => c.key)).toEqual(['theme', 'mentions', 'sentiment'])
  })

  it('ignores an unknown key silently', () => {
    const result = orderedColumns(THEME_SUMMARY_COLUMNS, ['theme', 'nope'])
    expect(result).toHaveLength(1)
    expect(result.map((c) => c.key)).toEqual(['theme'])
  })

  it('returns an empty array for no keys', () => {
    expect(orderedColumns(THEME_SUMMARY_COLUMNS, [])).toEqual([])
    expect(orderedColumns(FEEDBACK_ITEM_COLUMNS, [])).toEqual([])
  })

  it('uses unique lower_snake_case keys within each grain', () => {
    const pattern = /^[a-z][a-z0-9_]*$/
    for (const columns of [THEME_SUMMARY_COLUMNS, FEEDBACK_ITEM_COLUMNS]) {
      const keys = columns.map((c) => c.key)
      for (const key of keys) expect(key).toMatch(pattern)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it('formats the theme-summary sentiment value with the negative share', () => {
    const sentiment = themeSummaryColumn('sentiment')
    const negative: ThemeSummary = {
      theme: 'CSV export from Insights',
      mentions: 14,
      accountCount: 11,
      affectedArr: 5010,
      prevailingSentiment: 'negative',
      negativeShare: 79,
      planMix: '3 Business, 4 Team, 4 Starter',
    }
    expect(sentiment.value(negative)).toBe('negative (79% negative)')

    const zero: ThemeSummary = { ...negative, prevailingSentiment: 'positive', negativeShare: 0 }
    expect(zero.negativeShare).toBe(0)
    expect(sentiment.value(zero)).toBe('positive (0% negative)')
  })

  it('returns a fresh array from defaultColumns', () => {
    const first = defaultColumns('theme-summary')
    first.push('mutated')
    expect(defaultColumns('theme-summary')).toEqual(DEFAULT_THEME_SUMMARY_COLUMNS)
  })

  it('labels both grains', () => {
    expect(GRAIN_LABELS['theme-summary']).toBe('Theme summary')
    expect(GRAIN_LABELS['feedback-items']).toBe('Feedback items')
  })
})
