/*
 * SYNTHETIC DATA ONLY — this module ships in a public, world-readable bundle.
 *
 * Every row below is invented. Account names are made up, and none of the
 * figures describe any real organisation.
 *
 * No real customer name, quote or revenue figure — whether taken from the
 * product spec or from any customer feedback file — appears anywhere in this
 * module.
 *
 * Nothing from the real feedback export may ever be pasted in here.
 */

export type Plan = 'Starter' | 'Team' | 'Business'
export type Source =
  | 'Support ticket' | 'Sales call' | 'NPS survey'
  | 'App review' | 'Community' | 'Churn survey'
export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface FeedbackItem {
  id: string
  date: string
  theme: string
  plan: Plan
  source: Source
  sentiment: Sentiment
  account: string
  mrr: number
}

export type Grain = 'theme-summary' | 'feedback-items'

export interface ThemeSummary {
  theme: string
  mentions: number
  accountCount: number
  affectedArr: number
  prevailingSentiment: Sentiment
  negativeShare: number
  planMix: string
}

export const PLANS: readonly Plan[] = ['Starter', 'Team', 'Business']
export const SOURCES: readonly Source[] = [
  'Support ticket', 'Sales call', 'NPS survey',
  'App review', 'Community', 'Churn survey',
]
export const SENTIMENTS: readonly Sentiment[] = ['positive', 'neutral', 'negative']

export const DATE_PATTERN: RegExp = /^\d{4}-\d{2}-\d{2}$/

export const FEEDBACK_ITEMS: FeedbackItem[] = [
  // CSV export from Insights — 14
  { id: 'SYN-20260001', date: '2026-07-01', theme: 'CSV export from Insights', plan: 'Business', source: 'NPS survey', sentiment: 'negative', account: 'Cedarline Health', mrr: 499 },
  { id: 'SYN-20260002', date: '2026-07-05', theme: 'CSV export from Insights', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Blue Harbor Analytics', mrr: 299 },
  { id: 'SYN-20260003', date: '2026-07-09', theme: 'CSV export from Insights', plan: 'Starter', source: 'Support ticket', sentiment: 'negative', account: 'Driftwood Media', mrr: 79 },
  { id: 'SYN-20260004', date: '2026-07-14', theme: 'CSV export from Insights', plan: 'Business', source: 'Sales call', sentiment: 'negative', account: 'Ironvale Security', mrr: 899 },
  { id: 'SYN-20260005', date: '2026-07-18', theme: 'CSV export from Insights', plan: 'Team', source: 'App review', sentiment: 'neutral', account: 'Elmwood Retail', mrr: 199 },
  { id: 'SYN-20260006', date: '2026-07-23', theme: 'CSV export from Insights', plan: 'Business', source: 'Sales call', sentiment: 'negative', account: 'Oakhollow Energy', mrr: 899 },
  { id: 'SYN-20260007', date: '2026-07-30', theme: 'CSV export from Insights', plan: 'Starter', source: 'Community', sentiment: 'negative', account: 'Harlow & Finch', mrr: 49 },
  { id: 'SYN-20260008', date: '2026-08-04', theme: 'CSV export from Insights', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Quarrystone Legal', mrr: 299 },
  { id: 'SYN-20260009', date: '2026-08-11', theme: 'CSV export from Insights', plan: 'Business', source: 'NPS survey', sentiment: 'negative', account: 'Meridian Freight', mrr: 499 },
  { id: 'SYN-20260010', date: '2026-08-19', theme: 'CSV export from Insights', plan: 'Starter', source: 'App review', sentiment: 'positive', account: 'Pinehollow Studios', mrr: 49 },
  { id: 'SYN-20260011', date: '2026-08-26', theme: 'CSV export from Insights', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Blue Harbor Analytics', mrr: 299 },
  { id: 'SYN-20260012', date: '2026-09-03', theme: 'CSV export from Insights', plan: 'Business', source: 'Sales call', sentiment: 'neutral', account: 'Willowmere Foods', mrr: 499 },
  { id: 'SYN-20260013', date: '2026-09-14', theme: 'CSV export from Insights', plan: 'Team', source: 'Churn survey', sentiment: 'negative', account: 'Saltmarsh Marine', mrr: 199 },
  { id: 'SYN-20260014', date: '2026-09-22', theme: 'CSV export from Insights', plan: 'Starter', source: 'Community', sentiment: 'negative', account: 'Sablewood Interiors', mrr: 29 },

  // Slack notifications — 11
  { id: 'SYN-20260015', date: '2026-07-03', theme: 'Slack notifications', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Glenbrook Manufacturing', mrr: 299 },
  { id: 'SYN-20260016', date: '2026-07-08', theme: 'Slack notifications', plan: 'Business', source: 'Sales call', sentiment: 'negative', account: 'Fairweather Logistics', mrr: 899 },
  { id: 'SYN-20260017', date: '2026-07-15', theme: 'Slack notifications', plan: 'Starter', source: 'Community', sentiment: 'neutral', account: 'Larkspur Travel', mrr: 29 },
  { id: 'SYN-20260018', date: '2026-07-21', theme: 'Slack notifications', plan: 'Team', source: 'App review', sentiment: 'negative', account: 'Juniper Peak Software', mrr: 299 },
  { id: 'SYN-20260019', date: '2026-07-28', theme: 'Slack notifications', plan: 'Business', source: 'NPS survey', sentiment: 'negative', account: 'Redcliff Utilities', mrr: 499 },
  { id: 'SYN-20260020', date: '2026-08-06', theme: 'Slack notifications', plan: 'Starter', source: 'Support ticket', sentiment: 'negative', account: 'Umberfox Games', mrr: 79 },
  { id: 'SYN-20260021', date: '2026-08-13', theme: 'Slack notifications', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Vantage Point Media', mrr: 299 },
  { id: 'SYN-20260022', date: '2026-08-21', theme: 'Slack notifications', plan: 'Business', source: 'Sales call', sentiment: 'neutral', account: 'Alderpoint Labs', mrr: 899 },
  { id: 'SYN-20260023', date: '2026-08-29', theme: 'Slack notifications', plan: 'Team', source: 'Churn survey', sentiment: 'negative', account: 'Northgate Insurance', mrr: 199 },
  { id: 'SYN-20260024', date: '2026-09-08', theme: 'Slack notifications', plan: 'Starter', source: 'Community', sentiment: 'negative', account: 'Sablewood Interiors', mrr: 29 },
  { id: 'SYN-20260025', date: '2026-09-19', theme: 'Slack notifications', plan: 'Business', source: 'NPS survey', sentiment: 'positive', account: 'Cedarline Health', mrr: 499 },

  // Jira sync — 9
  { id: 'SYN-20260026', date: '2026-07-04', theme: 'Jira sync', plan: 'Team', source: 'Sales call', sentiment: 'negative', account: 'Elmwood Retail', mrr: 199 },
  { id: 'SYN-20260027', date: '2026-07-11', theme: 'Jira sync', plan: 'Business', source: 'Support ticket', sentiment: 'negative', account: 'Ironvale Security', mrr: 899 },
  { id: 'SYN-20260028', date: '2026-07-19', theme: 'Jira sync', plan: 'Starter', source: 'Support ticket', sentiment: 'negative', account: 'Driftwood Media', mrr: 79 },
  { id: 'SYN-20260029', date: '2026-07-26', theme: 'Jira sync', plan: 'Team', source: 'NPS survey', sentiment: 'neutral', account: 'Quarrystone Legal', mrr: 299 },
  { id: 'SYN-20260030', date: '2026-08-07', theme: 'Jira sync', plan: 'Business', source: 'Sales call', sentiment: 'negative', account: 'Meridian Freight', mrr: 499 },
  { id: 'SYN-20260031', date: '2026-08-16', theme: 'Jira sync', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Blue Harbor Analytics', mrr: 299 },
  { id: 'SYN-20260032', date: '2026-08-24', theme: 'Jira sync', plan: 'Starter', source: 'Community', sentiment: 'negative', account: 'Harlow & Finch', mrr: 49 },
  { id: 'SYN-20260033', date: '2026-09-06', theme: 'Jira sync', plan: 'Business', source: 'App review', sentiment: 'neutral', account: 'Oakhollow Energy', mrr: 899 },
  { id: 'SYN-20260034', date: '2026-09-17', theme: 'Jira sync', plan: 'Team', source: 'Churn survey', sentiment: 'negative', account: 'Glenbrook Manufacturing', mrr: 299 },

  // SSO / SAML — 7
  { id: 'SYN-20260035', date: '2026-07-06', theme: 'SSO / SAML', plan: 'Business', source: 'Sales call', sentiment: 'negative', account: 'Willowmere Foods', mrr: 499 },
  { id: 'SYN-20260036', date: '2026-07-16', theme: 'SSO / SAML', plan: 'Team', source: 'Support ticket', sentiment: 'neutral', account: 'Saltmarsh Marine', mrr: 199 },
  { id: 'SYN-20260037', date: '2026-07-24', theme: 'SSO / SAML', plan: 'Business', source: 'NPS survey', sentiment: 'negative', account: 'Alderpoint Labs', mrr: 899 },
  { id: 'SYN-20260038', date: '2026-08-05', theme: 'SSO / SAML', plan: 'Starter', source: 'Community', sentiment: 'negative', account: 'Larkspur Travel', mrr: 29 },
  { id: 'SYN-20260039', date: '2026-08-14', theme: 'SSO / SAML', plan: 'Business', source: 'Sales call', sentiment: 'negative', account: 'Fairweather Logistics', mrr: 899 },
  { id: 'SYN-20260040', date: '2026-08-27', theme: 'SSO / SAML', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Juniper Peak Software', mrr: 299 },
  { id: 'SYN-20260041', date: '2026-09-11', theme: 'SSO / SAML', plan: 'Business', source: 'Churn survey', sentiment: 'neutral', account: 'Redcliff Utilities', mrr: 499 },

  // Bulk editing — 6
  { id: 'SYN-20260042', date: '2026-07-12', theme: 'Bulk editing', plan: 'Team', source: 'App review', sentiment: 'negative', account: 'Northgate Insurance', mrr: 199 },
  { id: 'SYN-20260043', date: '2026-07-22', theme: 'Bulk editing', plan: 'Starter', source: 'Community', sentiment: 'negative', account: 'Umberfox Games', mrr: 79 },
  { id: 'SYN-20260044', date: '2026-08-03', theme: 'Bulk editing', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Vantage Point Media', mrr: 299 },
  { id: 'SYN-20260045', date: '2026-08-12', theme: 'Bulk editing', plan: 'Business', source: 'NPS survey', sentiment: 'positive', account: 'Cedarline Health', mrr: 499 },
  { id: 'SYN-20260046', date: '2026-08-30', theme: 'Bulk editing', plan: 'Starter', source: 'App review', sentiment: 'neutral', account: 'Pinehollow Studios', mrr: 49 },
  { id: 'SYN-20260047', date: '2026-09-15', theme: 'Bulk editing', plan: 'Team', source: 'Support ticket', sentiment: 'negative', account: 'Elmwood Retail', mrr: 199 },

  // Free tier limits — 5
  { id: 'SYN-20260048', date: '2026-07-17', theme: 'Free tier limits', plan: 'Starter', source: 'Community', sentiment: 'negative', account: 'Sablewood Interiors', mrr: 29 },
  { id: 'SYN-20260049', date: '2026-08-01', theme: 'Free tier limits', plan: 'Starter', source: 'Support ticket', sentiment: 'negative', account: 'Harlow & Finch', mrr: 49 },
  { id: 'SYN-20260050', date: '2026-08-18', theme: 'Free tier limits', plan: 'Starter', source: 'App review', sentiment: 'negative', account: 'Larkspur Travel', mrr: 29 },
  { id: 'SYN-20260051', date: '2026-09-04', theme: 'Free tier limits', plan: 'Starter', source: 'NPS survey', sentiment: 'neutral', account: 'Driftwood Media', mrr: 79 },
  { id: 'SYN-20260052', date: '2026-09-21', theme: 'Free tier limits', plan: 'Starter', source: 'Churn survey', sentiment: 'negative', account: 'Pinehollow Studios', mrr: 49 },

  // Mobile app — 4
  { id: 'SYN-20260053', date: '2026-07-25', theme: 'Mobile app', plan: 'Team', source: 'App review', sentiment: 'positive', account: 'Juniper Peak Software', mrr: 299 },
  { id: 'SYN-20260054', date: '2026-08-09', theme: 'Mobile app', plan: 'Business', source: 'NPS survey', sentiment: 'positive', account: 'Alderpoint Labs', mrr: 899 },
  { id: 'SYN-20260055', date: '2026-08-25', theme: 'Mobile app', plan: 'Starter', source: 'Community', sentiment: 'neutral', account: 'Umberfox Games', mrr: 79 },
  { id: 'SYN-20260056', date: '2026-09-12', theme: 'Mobile app', plan: 'Team', source: 'App review', sentiment: 'positive', account: 'Vantage Point Media', mrr: 299 },

  // API rate limits — 3
  { id: 'SYN-20260057', date: '2026-08-02', theme: 'API rate limits', plan: 'Business', source: 'Support ticket', sentiment: 'negative', account: 'Willowmere Foods', mrr: 499 },
  { id: 'SYN-20260058', date: '2026-09-02', theme: 'API rate limits', plan: 'Business', source: 'Sales call', sentiment: 'negative', account: 'Fairweather Logistics', mrr: 899 },
  { id: 'SYN-20260059', date: '2026-09-25', theme: 'API rate limits', plan: 'Team', source: 'Churn survey', sentiment: 'neutral', account: 'Glenbrook Manufacturing', mrr: 299 },
]

export function isValidFeedbackItem(value: unknown): value is FeedbackItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.date === 'string' &&
    DATE_PATTERN.test(item.date) &&
    typeof item.theme === 'string' &&
    item.theme.length > 0 &&
    PLANS.includes(item.plan as Plan) &&
    SOURCES.includes(item.source as Source) &&
    SENTIMENTS.includes(item.sentiment as Sentiment) &&
    typeof item.account === 'string' &&
    item.account.length > 0 &&
    typeof item.mrr === 'number' &&
    Number.isFinite(item.mrr) &&
    item.mrr >= 0
  )
}

export function loadFeedback(): { items: FeedbackItem[]; dropped: number } {
  const items: FeedbackItem[] = []
  let dropped = 0
  for (const value of FEEDBACK_ITEMS) {
    if (isValidFeedbackItem(value)) items.push(value)
    else dropped += 1
  }
  return { items, dropped }
}
