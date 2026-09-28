import { describe, it, expect } from 'vitest'
import type { FeedbackItem } from '../../data/feedback'
import { FEEDBACK_ITEMS } from '../../data/feedback'
import { summarizeByTheme } from './summarize'

function item(overrides: Partial<FeedbackItem>): FeedbackItem {
  return {
    id: 'X',
    date: '2026-01-01',
    theme: 'Theme',
    plan: 'Starter',
    source: 'Community',
    sentiment: 'neutral',
    account: 'Acct',
    mrr: 10,
    ...overrides,
  }
}

function byTheme(list: FeedbackItem[], theme: string) {
  const found = summarizeByTheme(list).find((s) => s.theme === theme)
  if (!found) throw new Error(`theme not found: ${theme}`)
  return found
}

describe('summarizeByTheme — real dataset headline numbers', () => {
  it('summarizes "CSV export from Insights" with the documented figures', () => {
    const summary = byTheme(FEEDBACK_ITEMS, 'CSV export from Insights')
    expect(summary).toEqual({
      theme: 'CSV export from Insights',
      mentions: 14,
      accountCount: 13,
      affectedArr: 53964,
      prevailingSentiment: 'negative',
      negativeShare: 79,
      planMix: 'Starter:4;Team:5;Business:5',
    })
  })

  it('summarizes "Slack notifications" with the documented figures', () => {
    const summary = byTheme(FEEDBACK_ITEMS, 'Slack notifications')
    expect(summary).toEqual({
      theme: 'Slack notifications',
      mentions: 11,
      accountCount: 11,
      affectedArr: 48348,
      prevailingSentiment: 'negative',
      negativeShare: 73,
      planMix: 'Starter:3;Team:4;Business:4',
    })
  })

  it('returns 8 themes ordered by mentions desc with the documented counts', () => {
    const result = summarizeByTheme(FEEDBACK_ITEMS)
    expect(result).toHaveLength(8)
    expect(result[0]?.theme).toBe('CSV export from Insights')
    expect(result[0]?.mentions).toBe(14)
    expect(result[1]?.theme).toBe('Slack notifications')
    expect(result[1]?.mentions).toBe(11)
    expect(result.map((s) => s.mentions)).toEqual([14, 11, 9, 7, 6, 5, 4, 3])
  })
})

describe('summarizeByTheme — counting rules', () => {
  it('counts an account once in accountCount and once in affectedArr', () => {
    const list = [
      item({ id: 'A1', theme: 'T', account: 'Acme', mrr: 100 }),
      item({ id: 'A2', theme: 'T', account: 'Acme', mrr: 100 }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.mentions).toBe(2)
    expect(summary.accountCount).toBe(1)
    expect(summary.affectedArr).toBe(1200)
  })

  it('uses MRR times twelve for a single contributing account', () => {
    const summary = byTheme([item({ theme: 'Solo', mrr: 250 })], 'Solo')
    expect(summary.accountCount).toBe(1)
    expect(summary.affectedArr).toBe(3000)
  })

  it('resolves differing MRR values for one account to the highest', () => {
    const list = [
      item({ id: 'B1', theme: 'T', account: 'Acme', mrr: 100 }),
      item({ id: 'B2', theme: 'T', account: 'Acme', mrr: 250 }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.accountCount).toBe(1)
    expect(summary.affectedArr).toBe(3000)
  })

  it('counts a non-finite MRR toward mentions but adds nothing to affectedArr', () => {
    const list = [
      item({ id: 'N1', theme: 'T', account: 'Finite', mrr: 100 }),
      item({ id: 'N2', theme: 'T', account: 'Broken', mrr: Number.NaN }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.mentions).toBe(2)
    expect(summary.accountCount).toBe(2)
    expect(summary.affectedArr).toBe(1200)
  })

  it('ignores non-finite MRR even when it is the highest value seen', () => {
    const list = [
      item({ id: 'N3', theme: 'T', account: 'Acme', mrr: 100 }),
      item({ id: 'N4', theme: 'T', account: 'Acme', mrr: Number.POSITIVE_INFINITY }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.accountCount).toBe(1)
    expect(summary.affectedArr).toBe(1200)
  })

  it('lets a finite MRR replace an earlier non-finite one for the same account', () => {
    const list = [
      item({ id: 'N5', theme: 'T', account: 'Acme', mrr: Number.NaN }),
      item({ id: 'N6', theme: 'T', account: 'Acme', mrr: 100 }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.mentions).toBe(2)
    expect(summary.accountCount).toBe(1)
    expect(summary.affectedArr).toBe(1200)
  })

  it('keeps the highest finite MRR regardless of where the non-finite value falls', () => {
    const list = [
      item({ id: 'N7', theme: 'T', account: 'Acme', mrr: Number.POSITIVE_INFINITY }),
      item({ id: 'N8', theme: 'T', account: 'Acme', mrr: 100 }),
      item({ id: 'N9', theme: 'T', account: 'Acme', mrr: 250 }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.mentions).toBe(3)
    expect(summary.accountCount).toBe(1)
    expect(summary.affectedArr).toBe(3000)
  })

  it('still counts a non-finite-only account once and contributes 0', () => {
    const list = [
      item({ id: 'N10', theme: 'T', account: 'Broken', mrr: Number.NaN }),
      item({ id: 'N11', theme: 'T', account: 'Broken', mrr: Number.NEGATIVE_INFINITY }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.mentions).toBe(2)
    expect(summary.accountCount).toBe(1)
    expect(summary.affectedArr).toBe(0)
  })
})

describe('summarizeByTheme — sentiment rules', () => {
  it('reports negativeShare 0 and a real prevailingSentiment with no negatives', () => {
    const list = [
      item({ id: 'P1', theme: 'T', sentiment: 'positive' }),
      item({ id: 'P2', theme: 'T', sentiment: 'positive' }),
      item({ id: 'P3', theme: 'T', sentiment: 'neutral' }),
    ]
    const summary = byTheme(list, 'T')
    expect(summary.negativeShare).toBe(0)
    expect(summary.prevailingSentiment).toBe('positive')
  })

  it('rounds negativeShare to the nearest whole number', () => {
    const list = [
      item({ id: 'R1', theme: 'T', sentiment: 'negative' }),
      item({ id: 'R2', theme: 'T', sentiment: 'positive' }),
      item({ id: 'R3', theme: 'T', sentiment: 'positive' }),
    ]
    expect(byTheme(list, 'T').negativeShare).toBe(33)
  })

  it('breaks an exact sentiment tie in favour of negative', () => {
    const list = [
      item({ id: 'T1', theme: 'T', sentiment: 'neutral' }),
      item({ id: 'T2', theme: 'T', sentiment: 'negative' }),
    ]
    expect(byTheme(list, 'T').prevailingSentiment).toBe('negative')
  })

  it('breaks a neutral/positive tie in favour of neutral', () => {
    const list = [
      item({ id: 'T3', theme: 'T', sentiment: 'positive' }),
      item({ id: 'T4', theme: 'T', sentiment: 'neutral' }),
    ]
    expect(byTheme(list, 'T').prevailingSentiment).toBe('neutral')
  })
})

describe('summarizeByTheme — planMix and ordering', () => {
  it('omits zero-count plans and keeps Starter/Team/Business order', () => {
    const list = [
      item({ id: 'M1', theme: 'T', plan: 'Business' }),
      item({ id: 'M2', theme: 'T', plan: 'Starter' }),
      item({ id: 'M3', theme: 'T', plan: 'Starter' }),
      item({ id: 'M4', theme: 'T', plan: 'Team' }),
    ]
    expect(byTheme(list, 'T').planMix).toBe('Starter:2;Team:1;Business:1')
  })

  it('omits plans that have no items at all', () => {
    const list = [
      item({ id: 'M5', theme: 'T', plan: 'Business' }),
      item({ id: 'M6', theme: 'T', plan: 'Business' }),
    ]
    expect(byTheme(list, 'T').planMix).toBe('Business:2')
  })

  it('sorts by mentions desc then theme asc regardless of insertion order', () => {
    const list = [
      item({ id: 'O1', theme: 'Zeta' }),
      item({ id: 'O2', theme: 'Alpha' }),
      item({ id: 'O3', theme: 'Beta' }),
      item({ id: 'O4', theme: 'Zeta' }),
      item({ id: 'O5', theme: 'Zeta' }),
    ]
    const result = summarizeByTheme(list)
    expect(result.map((s) => s.theme)).toEqual(['Zeta', 'Alpha', 'Beta'])
  })
})

describe('summarizeByTheme — empty and purity', () => {
  it('returns [] for an empty input', () => {
    expect(summarizeByTheme([])).toEqual([])
  })

  it('does not mutate the input array or its items', () => {
    const list = [
      item({ id: 'K1', theme: 'T', account: 'Acme', mrr: 100 }),
      item({ id: 'K2', theme: 'T', account: 'Acme', mrr: 250 }),
    ]
    const snapshot = JSON.stringify(list)
    summarizeByTheme(list)
    expect(JSON.stringify(list)).toBe(snapshot)
  })
})
