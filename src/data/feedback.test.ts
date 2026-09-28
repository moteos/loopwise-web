import { describe, it, expect } from 'vitest'
import {
  FEEDBACK_ITEMS,
  isValidFeedbackItem,
  loadFeedback,
} from './feedback'
import type { FeedbackItem } from './feedback'

// Deliberately an independent literal, not the production DATE_PATTERN, so a
// regression in that regex cannot make the data and the assertion agree.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

describe('feedback dataset', () => {
  it('has only valid records', () => {
    expect(FEEDBACK_ITEMS.every(isValidFeedbackItem)).toBe(true)
  })

  it('has 59 items with the expected theme counts', () => {
    expect(FEEDBACK_ITEMS).toHaveLength(59)

    const counts: Record<string, number> = {}
    for (const item of FEEDBACK_ITEMS) {
      counts[item.theme] = (counts[item.theme] ?? 0) + 1
    }

    expect(counts).toEqual({
      'CSV export from Insights': 14,
      'Slack notifications': 11,
      'Jira sync': 9,
      'SSO / SAML': 7,
      'Bulk editing': 6,
      'Free tier limits': 5,
      'Mobile app': 4,
      'API rate limits': 3,
    })
  })

  it('gives every item all seven data fields with no missing values', () => {
    for (const item of FEEDBACK_ITEMS) {
      expect(item.date).toMatch(ISO_DATE)
      const parsed = Date.parse(`${item.date}T00:00:00Z`)
      expect(Number.isFinite(parsed)).toBe(true)
      expect(new Date(parsed).toISOString().slice(0, 10)).toBe(item.date)
      expect(item.theme.length).toBeGreaterThan(0)
      expect(item.plan.length).toBeGreaterThan(0)
      expect(item.source.length).toBeGreaterThan(0)
      expect(item.sentiment.length).toBeGreaterThan(0)
      expect(item.account.length).toBeGreaterThan(0)
      expect(Number.isFinite(item.mrr)).toBe(true)
      expect(item.mrr).toBeGreaterThanOrEqual(0)

      expect(item.date >= '2026-07-01').toBe(true)
      expect(item.date <= '2026-09-25').toBe(true)
    }
  })

  it('loadFeedback keeps everything in order with nothing dropped', () => {
    const { items, dropped } = loadFeedback()
    expect(items).toHaveLength(59)
    expect(dropped).toBe(0)
    expect(items).toEqual(FEEDBACK_ITEMS)
  })

  it('rejects and drops malformed records without throwing', () => {
    const missingAccount = {
      id: 'BAD-1',
      date: '2026-08-01',
      theme: 'CSV export from Insights',
      plan: 'Team',
      source: 'Support ticket',
      sentiment: 'negative',
      mrr: 299,
    }
    const stringMrr = {
      id: 'BAD-2',
      date: '2026-08-01',
      theme: 'CSV export from Insights',
      plan: 'Team',
      source: 'Support ticket',
      sentiment: 'negative',
      account: 'Made Up Co',
      mrr: 'free',
    }
    const unknownPlan = {
      id: 'BAD-3',
      date: '2026-08-01',
      theme: 'CSV export from Insights',
      plan: 'Enterprise',
      source: 'Support ticket',
      sentiment: 'negative',
      account: 'Made Up Co',
      mrr: 299,
    }

    expect(isValidFeedbackItem(missingAccount)).toBe(false)
    expect(isValidFeedbackItem(stringMrr)).toBe(false)
    expect(isValidFeedbackItem(unknownPlan)).toBe(false)

    const valid: FeedbackItem = {
      id: 'SYN-20260001',
      date: '2026-07-01',
      theme: 'CSV export from Insights',
      plan: 'Business',
      source: 'NPS survey',
      sentiment: 'negative',
      account: 'Cedarline Health',
      mrr: 499,
    }
    expect(isValidFeedbackItem(valid)).toBe(true)
    expect(isValidFeedbackItem(null)).toBe(false)
    expect(isValidFeedbackItem(undefined)).toBe(false)
    expect(isValidFeedbackItem('not an object')).toBe(false)
  })

  it('has a once-only account fixture: Blue Harbor Analytics', () => {
    const rows = FEEDBACK_ITEMS.filter((item) => item.account === 'Blue Harbor Analytics')
    const csvRows = rows.filter((item) => item.theme === 'CSV export from Insights')

    // Within CSV export from Insights the account recurs exactly twice, both at MRR 299.
    expect(csvRows).toHaveLength(2)
    for (const row of csvRows) {
      expect(row.mrr).toBe(299)
    }

    // Note: the fixed dataset also has one Jira sync row for this account.
    expect(rows).toHaveLength(3)
  })

  it('uses only the 22 invented account names on the whitelist', () => {
    const expectedAccounts = [
      'Cedarline Health',
      'Blue Harbor Analytics',
      'Driftwood Media',
      'Ironvale Security',
      'Elmwood Retail',
      'Oakhollow Energy',
      'Harlow & Finch',
      'Quarrystone Legal',
      'Meridian Freight',
      'Pinehollow Studios',
      'Willowmere Foods',
      'Saltmarsh Marine',
      'Sablewood Interiors',
      'Glenbrook Manufacturing',
      'Fairweather Logistics',
      'Larkspur Travel',
      'Juniper Peak Software',
      'Redcliff Utilities',
      'Umberfox Games',
      'Vantage Point Media',
      'Alderpoint Labs',
      'Northgate Insurance',
    ].sort()

    const accounts = [...new Set(FEEDBACK_ITEMS.map((item) => item.account))].sort()
    expect(accounts).toEqual(expectedAccounts)

    // Synthetic identifiers only: nothing that could look copied from a real export.
    for (const item of FEEDBACK_ITEMS) {
      expect(item.id).toMatch(/^SYN-\d{8}$/)
    }
  })
})
