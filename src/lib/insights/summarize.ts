import type { FeedbackItem, Plan, Sentiment, ThemeSummary } from '../../data/feedback'

/** Plans always rendered in this order in `planMix`. */
const PLAN_ORDER: readonly Plan[] = ['Starter', 'Team', 'Business']

/**
 * Sentiment tie-break priority: on an exact tie the earliest entry with the
 * highest count wins, so negative beats neutral beats positive.
 */
const SENTIMENT_TIE_ORDER: readonly Sentiment[] = ['negative', 'neutral', 'positive']

interface ThemeAccumulator {
  mentions: number
  sentiments: Record<Sentiment, number>
  plans: Record<Plan, number>
  /**
   * Account name -> highest finite MRR seen for that account in this theme.
   * `null` means the account only ever appeared with a non-finite MRR, which
   * contributes 0 to affectedArr but still counts once in accountCount.
   */
  accountMrr: Map<string, number | null>
}

function emptyAccumulator(): ThemeAccumulator {
  return {
    mentions: 0,
    sentiments: { positive: 0, neutral: 0, negative: 0 },
    plans: { Starter: 0, Team: 0, Business: 0 },
    accountMrr: new Map(),
  }
}

function recordAccount(acc: ThemeAccumulator, account: string, mrr: number): void {
  if (!Number.isFinite(mrr)) {
    // Only register the account if it is new; never let a bad value displace
    // a real one or pretend to be a finite MRR.
    if (!acc.accountMrr.has(account)) acc.accountMrr.set(account, null)
    return
  }
  const current = acc.accountMrr.get(account)
  // A finite value always wins over no entry or a previously recorded
  // non-finite one; between two finite values the highest wins.
  if (current === undefined || current === null || mrr > current) {
    acc.accountMrr.set(account, mrr)
  }
}

function prevailingSentiment(acc: ThemeAccumulator): Sentiment {
  let best: Sentiment = SENTIMENT_TIE_ORDER[0]
  let bestCount = -1
  for (const sentiment of SENTIMENT_TIE_ORDER) {
    const count = acc.sentiments[sentiment]
    if (count > bestCount) {
      best = sentiment
      bestCount = count
    }
  }
  return best
}

function buildPlanMix(acc: ThemeAccumulator): string {
  return PLAN_ORDER.filter((plan) => acc.plans[plan] > 0)
    .map((plan) => `${plan}:${acc.plans[plan]}`)
    .join(';')
}

function buildAffectedArr(acc: ThemeAccumulator): number {
  let monthly = 0
  for (const mrr of acc.accountMrr.values()) {
    if (mrr !== null) monthly += mrr
  }
  return monthly * 12
}

export function summarizeByTheme(items: FeedbackItem[]): ThemeSummary[] {
  const themes = new Map<string, ThemeAccumulator>()

  for (const item of items) {
    let acc = themes.get(item.theme)
    if (acc === undefined) {
      acc = emptyAccumulator()
      themes.set(item.theme, acc)
    }
    acc.mentions += 1
    acc.sentiments[item.sentiment] += 1
    acc.plans[item.plan] += 1
    recordAccount(acc, item.account, item.mrr)
  }

  const summaries: ThemeSummary[] = []
  for (const [theme, acc] of themes) {
    summaries.push({
      theme,
      mentions: acc.mentions,
      accountCount: acc.accountMrr.size,
      affectedArr: buildAffectedArr(acc),
      prevailingSentiment: prevailingSentiment(acc),
      negativeShare: Math.round((acc.sentiments.negative / acc.mentions) * 100),
      planMix: buildPlanMix(acc),
    })
  }

  // Explicit sort: mentions desc, then theme asc for stable output.
  summaries.sort((a, b) => {
    if (b.mentions !== a.mentions) return b.mentions - a.mentions
    if (a.theme < b.theme) return -1
    if (a.theme > b.theme) return 1
    return 0
  })

  return summaries
}
