import { describe, it, expect } from 'vitest'
import type { FeedbackItem } from '../../data/feedback'
import { FEEDBACK_ITEMS } from '../../data/feedback'
import {
  DEFAULT_FILTERS,
  isDefaultFilters,
  isDateBound,
  applyFilters,
} from './filter'
import type { FilterState } from './filter'

const FIXTURES: FeedbackItem[] = [
  { id: 'F1', date: '2026-01-01', theme: 'T', plan: 'Starter', source: 'Community', sentiment: 'positive', account: 'A', mrr: 10 },
  { id: 'F2', date: '2026-01-15', theme: 'T', plan: 'Business', source: 'Support ticket', sentiment: 'negative', account: 'B', mrr: 20 },
  { id: 'F3', date: '2026-02-01', theme: 'T', plan: 'Team', source: 'NPS survey', sentiment: 'neutral', account: 'C', mrr: 30 },
  { id: 'F4', date: '2026-01-15', theme: 'T', plan: 'Starter', source: 'Support ticket', sentiment: 'negative', account: 'D', mrr: 40 },
]

function filters(overrides: Partial<FilterState>): FilterState {
  return { ...DEFAULT_FILTERS, ...overrides }
}

describe('DEFAULT_FILTERS / isDefaultFilters', () => {
  it('has the documented defaults', () => {
    expect(DEFAULT_FILTERS).toEqual({
      plan: 'all',
      source: 'all',
      sentiment: 'all',
      from: null,
      to: null,
    })
  })

  it('isDefaultFilters is true for defaults and false once any dimension moves', () => {
    expect(isDefaultFilters(DEFAULT_FILTERS)).toBe(true)
    expect(isDefaultFilters(filters({ plan: 'Business' }))).toBe(false)
    expect(isDefaultFilters(filters({ source: 'Community' }))).toBe(false)
    expect(isDefaultFilters(filters({ sentiment: 'negative' }))).toBe(false)
    expect(isDefaultFilters(filters({ from: '2026-01-01' }))).toBe(false)
    expect(isDefaultFilters(filters({ to: '2026-01-31' }))).toBe(false)
  })
})

describe('isDateBound', () => {
  it('accepts a YYYY-MM-DD date', () => {
    expect(isDateBound('2026-07-01')).toBe(true)
  })

  it('rejects empty, unpadded, timestamped and prose values', () => {
    expect(isDateBound('')).toBe(false)
    expect(isDateBound('2026-7-1')).toBe(false)
    expect(isDateBound('2026-07-01T00:00:00Z')).toBe(false)
    expect(isDateBound('yesterday')).toBe(false)
  })
})

describe('applyFilters', () => {
  it('defaults leave all real feedback items untouched', () => {
    const result = applyFilters(FEEDBACK_ITEMS, DEFAULT_FILTERS)
    expect(FEEDBACK_ITEMS).toHaveLength(59)
    expect(result).toHaveLength(59)
    expect(result).toEqual(FEEDBACK_ITEMS)
  })

  it('narrows by plan', () => {
    const result = applyFilters(FIXTURES, filters({ plan: 'Business' }))
    expect(result).toHaveLength(1)
    expect(result.every((i) => i.plan === 'Business')).toBe(true)
  })

  it('narrows by source', () => {
    const result = applyFilters(FIXTURES, filters({ source: 'Support ticket' }))
    expect(result).toHaveLength(2)
    expect(result.every((i) => i.source === 'Support ticket')).toBe(true)
  })

  it('narrows by sentiment', () => {
    const result = applyFilters(FIXTURES, filters({ sentiment: 'negative' }))
    expect(result).toHaveLength(2)
    expect(result.every((i) => i.sentiment === 'negative')).toBe(true)
  })

  it('treats a date range as inclusive on both ends', () => {
    // 2026-07-05, 2026-07-09 and 2026-07-14 are all in range.
    const result = applyFilters(FEEDBACK_ITEMS, filters({ from: '2026-07-05', to: '2026-07-14' }))
    const ids = result.map((i) => i.id)
    expect(ids).toContain('SYN-20260002') // 2026-07-05
    expect(ids).toContain('SYN-20260003') // 2026-07-09
    expect(ids).toContain('SYN-20260004') // 2026-07-14
    expect(ids).not.toContain('SYN-20260026') // 2026-07-04, day before from
    expect(ids).not.toContain('SYN-20260017') // 2026-07-15, day after to
  })

  it('matches a single day when from equals to', () => {
    const result = applyFilters(FEEDBACK_ITEMS, filters({ from: '2026-07-01', to: '2026-07-01' }))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('SYN-20260001')
  })

  it('combines active dimensions as a conjunction and returns [] when contradictory', () => {
    const conjunction = applyFilters(
      FIXTURES,
      filters({ source: 'Support ticket', sentiment: 'negative' }),
    )
    expect(conjunction.map((i) => i.id)).toEqual(['F2', 'F4'])

    const contradictory = applyFilters(
      FIXTURES,
      filters({ plan: 'Business', sentiment: 'positive' }),
    )
    expect(contradictory).toEqual([])
  })

  it('swaps reversed bounds so the result matches the exchanged call', () => {
    const reversed = applyFilters(FEEDBACK_ITEMS, filters({ from: '2026-09-25', to: '2026-07-01' }))
    const ordered = applyFilters(FEEDBACK_ITEMS, filters({ from: '2026-07-01', to: '2026-09-25' }))
    expect(reversed.length).toBeGreaterThan(0)
    expect(reversed.length).toBe(ordered.length)
    expect(reversed).toEqual(ordered)
  })

  it('does not mutate the input array', () => {
    const before = FIXTURES.length
    applyFilters(FIXTURES, filters({ plan: 'Business' }))
    expect(FIXTURES).toHaveLength(before)
  })

  it('returns a new array even when nothing is filtered out', () => {
    const result = applyFilters(FIXTURES, DEFAULT_FILTERS)
    expect(result).not.toBe(FIXTURES)
  })
})
