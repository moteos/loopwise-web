import type { FeedbackItem, Grain, ThemeSummary } from '../../data/feedback'

export interface ColumnDef<T> {
  key: string
  label: string
  value: (row: T) => string | number
}

export const GRAIN_LABELS: Record<Grain, string> = {
  'theme-summary': 'Theme summary',
  'feedback-items': 'Feedback items',
}

export const THEME_SUMMARY_COLUMNS: ColumnDef<ThemeSummary>[] = [
  { key: 'theme', label: 'Theme', value: (summary) => summary.theme },
  { key: 'mentions', label: 'Mentions', value: (summary) => summary.mentions },
  { key: 'affected_arr', label: 'Affected ARR', value: (summary) => summary.affectedArr },
  {
    key: 'sentiment',
    label: 'Sentiment',
    value: (summary) => `${summary.prevailingSentiment} (${summary.negativeShare}% negative)`,
  },
  { key: 'account_count', label: 'Account count', value: (summary) => summary.accountCount },
  { key: 'plan_mix', label: 'Plan mix', value: (summary) => summary.planMix },
  { key: 'negative_share', label: 'Negative share', value: (summary) => summary.negativeShare },
]

export const FEEDBACK_ITEM_COLUMNS: ColumnDef<FeedbackItem>[] = [
  { key: 'date', label: 'Date', value: (item) => item.date },
  { key: 'source', label: 'Source', value: (item) => item.source },
  { key: 'account', label: 'Account', value: (item) => item.account },
  { key: 'plan', label: 'Plan', value: (item) => item.plan },
  { key: 'account_mrr', label: 'MRR', value: (item) => item.mrr },
  { key: 'theme', label: 'Theme', value: (item) => item.theme },
  { key: 'sentiment', label: 'Sentiment', value: (item) => item.sentiment },
]

export const DEFAULT_THEME_SUMMARY_COLUMNS: string[] = [
  'theme',
  'mentions',
  'affected_arr',
  'sentiment',
]

export const DEFAULT_FEEDBACK_ITEM_COLUMNS: string[] = [
  'date',
  'source',
  'account',
  'plan',
  'account_mrr',
  'theme',
  'sentiment',
]

export const DEFAULT_COLUMN_SELECTION: Record<Grain, string[]> = {
  'theme-summary': DEFAULT_THEME_SUMMARY_COLUMNS,
  'feedback-items': DEFAULT_FEEDBACK_ITEM_COLUMNS,
}

export function defaultColumns(grain: Grain): string[] {
  return [...DEFAULT_COLUMN_SELECTION[grain]]
}

export function orderedColumns<T>(all: ColumnDef<T>[], keys: string[]): ColumnDef<T>[] {
  const wanted = new Set(keys)
  return all.filter((column) => wanted.has(column.key))
}
