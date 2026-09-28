import type { FeedbackItem, Plan, Sentiment, Source } from '../../data/feedback'

export interface FilterState {
  plan: Plan | 'all'
  source: Source | 'all'
  sentiment: Sentiment | 'all'
  from: string | null // inclusive, YYYY-MM-DD
  to: string | null // inclusive, YYYY-MM-DD
}

export const DEFAULT_FILTERS: FilterState = {
  plan: 'all',
  source: 'all',
  sentiment: 'all',
  from: null,
  to: null,
}

export function isDefaultFilters(filters: FilterState): boolean {
  return (
    filters.plan === DEFAULT_FILTERS.plan &&
    filters.source === DEFAULT_FILTERS.source &&
    filters.sentiment === DEFAULT_FILTERS.sentiment &&
    filters.from === DEFAULT_FILTERS.from &&
    filters.to === DEFAULT_FILTERS.to
  )
}

export function isDateBound(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function applyFilters(
  items: FeedbackItem[],
  filters: FilterState,
): FeedbackItem[] {
  let from = filters.from
  let to = filters.to

  // Normalize reversed bounds. YYYY-MM-DD sorts correctly as plain text.
  if (from !== null && to !== null && from > to) {
    const swapped = from
    from = to
    to = swapped
  }

  return items.filter((item) => {
    if (filters.plan !== 'all' && item.plan !== filters.plan) return false
    if (filters.source !== 'all' && item.source !== filters.source) return false
    if (filters.sentiment !== 'all' && item.sentiment !== filters.sentiment) {
      return false
    }
    if (from !== null && item.date < from) return false
    if (to !== null && item.date > to) return false
    return true
  })
}
