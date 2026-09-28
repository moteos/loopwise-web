import { describe, it, expect } from 'vitest'

import { FEEDBACK_ITEMS } from '../../data/feedback'
import { DEFAULT_FILTERS, applyFilters } from './filter'
import {
  DEFAULT_THEME_SUMMARY_COLUMNS,
  DEFAULT_FEEDBACK_ITEM_COLUMNS,
} from './columns'
import { buildExport } from './export'
import { parseCsv, csvLines } from '../../test/csv-parse'

const NOW = new Date(2026, 8, 27)

describe('buildExport — theme-summary grain defaults', () => {
  it('defaults the columns, filename and first theme row', () => {
    const result = buildExport({
      items: FEEDBACK_ITEMS,
      filters: DEFAULT_FILTERS,
      grain: 'theme-summary',
      columnKeys: DEFAULT_THEME_SUMMARY_COLUMNS,
      now: NOW,
    })

    expect(result.filename).toBe(
      'loopwise-insights-theme-summary-2026-09-27.csv',
    )

    const lines = csvLines(result.content)
    expect(lines).toHaveLength(9)

    const records = parseCsv(result.content)
    expect(records).toHaveLength(9)
    expect(records[0]).toEqual(['theme', 'mentions', 'affected_arr', 'sentiment'])
    expect(records[1]).toEqual([
      'CSV export from Insights',
      '14',
      '53964',
      'negative (79% negative)',
    ])
  })
})

describe('buildExport — feedback-items grain defaults', () => {
  it('defaults the columns, filename and row count', () => {
    const result = buildExport({
      items: FEEDBACK_ITEMS,
      filters: DEFAULT_FILTERS,
      grain: 'feedback-items',
      columnKeys: DEFAULT_FEEDBACK_ITEM_COLUMNS,
      now: NOW,
    })

    expect(result.filename.endsWith('-feedback-items-2026-09-27.csv')).toBe(true)

    const records = parseCsv(result.content)
    expect(records).toHaveLength(60)
    expect(records[0]).toEqual([
      'date',
      'source',
      'account',
      'plan',
      'account_mrr',
      'theme',
      'sentiment',
    ])
  })
})

describe('buildExport — a filter narrows both grains consistently', () => {
  it('matches the count derived from the raw items', () => {
    const filters = {
      plan: 'Business',
      source: 'all',
      sentiment: 'all',
      from: null,
      to: null,
    } as const

    const expectedItems = FEEDBACK_ITEMS.filter(
      (item) => item.plan === 'Business',
    )
    const distinctThemes = new Set(expectedItems.map((item) => item.theme)).size

    const itemsResult = buildExport({
      items: FEEDBACK_ITEMS,
      filters,
      grain: 'feedback-items',
      columnKeys: DEFAULT_FEEDBACK_ITEM_COLUMNS,
      now: NOW,
    })
    expect(parseCsv(itemsResult.content)).toHaveLength(expectedItems.length + 1)

    const themeResult = buildExport({
      items: FEEDBACK_ITEMS,
      filters,
      grain: 'theme-summary',
      columnKeys: DEFAULT_THEME_SUMMARY_COLUMNS,
      now: NOW,
    })
    expect(parseCsv(themeResult.content)).toHaveLength(distinctThemes + 1)
  })
})

describe('buildExport — column selection', () => {
  it('falls back to the grain default when columnKeys is empty', () => {
    const themeResult = buildExport({
      items: FEEDBACK_ITEMS,
      filters: DEFAULT_FILTERS,
      grain: 'theme-summary',
      columnKeys: [],
      now: NOW,
    })
    expect(parseCsv(themeResult.content)[0]).toEqual(
      DEFAULT_THEME_SUMMARY_COLUMNS,
    )

    const itemResult = buildExport({
      items: FEEDBACK_ITEMS,
      filters: DEFAULT_FILTERS,
      grain: 'feedback-items',
      columnKeys: [],
      now: NOW,
    })
    expect(parseCsv(itemResult.content)[0]).toEqual(
      DEFAULT_FEEDBACK_ITEM_COLUMNS,
    )
  })

  it('emits a shuffled subset in canonical order', () => {
    const result = buildExport({
      items: FEEDBACK_ITEMS,
      filters: DEFAULT_FILTERS,
      grain: 'theme-summary',
      columnKeys: ['sentiment', 'theme', 'mentions'],
      now: NOW,
    })
    expect(parseCsv(result.content)[0]).toEqual([
      'theme',
      'mentions',
      'sentiment',
    ])
  })
})

describe('buildExport — empty result set', () => {
  it('still produces a header-only file for both grains', () => {
    const filters = {
      plan: 'Business',
      sentiment: 'positive',
      source: 'all',
      from: '2026-09-01',
      to: '2026-09-15',
    } as const

    // Verify the combination really matches nothing before relying on it.
    expect(applyFilters(FEEDBACK_ITEMS, filters)).toHaveLength(0)

    const themeResult = buildExport({
      items: FEEDBACK_ITEMS,
      filters,
      grain: 'theme-summary',
      columnKeys: DEFAULT_THEME_SUMMARY_COLUMNS,
      now: NOW,
    })
    expect(parseCsv(themeResult.content)).toEqual([
      DEFAULT_THEME_SUMMARY_COLUMNS,
    ])

    const itemResult = buildExport({
      items: FEEDBACK_ITEMS,
      filters,
      grain: 'feedback-items',
      columnKeys: DEFAULT_FEEDBACK_ITEM_COLUMNS,
      now: NOW,
    })
    expect(parseCsv(itemResult.content)).toEqual([DEFAULT_FEEDBACK_ITEM_COLUMNS])
  })
})

describe('buildExport — row shape', () => {
  it('every data row has the same field count as the header', () => {
    const themeRecords = parseCsv(
      buildExport({
        items: FEEDBACK_ITEMS,
        filters: DEFAULT_FILTERS,
        grain: 'theme-summary',
        columnKeys: DEFAULT_THEME_SUMMARY_COLUMNS,
        now: NOW,
      }).content,
    )
    for (const row of themeRecords) {
      expect(row).toHaveLength(themeRecords[0].length)
    }

    const itemResult = buildExport({
      items: FEEDBACK_ITEMS,
      filters: DEFAULT_FILTERS,
      grain: 'feedback-items',
      columnKeys: ['plan', 'date', 'account_mrr'],
      now: NOW,
    })
    const itemRecords = parseCsv(itemResult.content)
    for (const row of itemRecords) {
      expect(row).toHaveLength(itemRecords[0].length)
    }
  })
})

describe('buildExport — now is the only clock', () => {
  it('changes the filename and nothing else when now changes', () => {
    const base = {
      items: FEEDBACK_ITEMS,
      filters: DEFAULT_FILTERS,
      grain: 'theme-summary' as const,
      columnKeys: DEFAULT_THEME_SUMMARY_COLUMNS,
    }

    const first = buildExport({ ...base, now: new Date(2026, 8, 27) })
    const second = buildExport({ ...base, now: new Date(2026, 0, 5) })

    expect(first.filename).toBe(
      'loopwise-insights-theme-summary-2026-09-27.csv',
    )
    expect(second.filename).toBe(
      'loopwise-insights-theme-summary-2026-01-05.csv',
    )
    expect(first.content).toBe(second.content)
  })
})
