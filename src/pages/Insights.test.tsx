import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Insights from './Insights'

// Vitest runs without globals here, so RTL's automatic cleanup never
// registers; tear the DOM down between tests explicitly.
afterEach(cleanup)

function renderInsights() {
  const onDownload = vi.fn()
  const user = userEvent.setup()
  render(<Insights onDownload={onDownload} />)
  return { onDownload, user }
}

/** Theme names in table order, taken from the row headers only. */
function themeRowNames(): string[] {
  return screen
    .getAllByRole('rowheader')
    .map((cell) => cell.textContent ?? '')
}

interface ParsedCsv {
  header: string[]
  rows: string[][]
}

/**
 * Minimal RFC 4180 reader for the generator's output: a leading byte-order
 * mark, comma-separated fields, doubled quotes for escaping, CRLF rows and no
 * trailing newline. Local to the test so the assertion does not lean on the
 * code under test.
 */
function parseCsv(content: string): ParsedCsv {
  const body = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content
  const lines = body.length === 0 ? [] : body.split('\r\n')

  const parseLine = (line: string): string[] => {
    const fields: string[] = []
    let field = ''
    let quoted = false
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      if (quoted) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            field += '"'
            i += 1
          } else {
            quoted = false
          }
        } else {
          field += char
        }
      } else if (char === '"') {
        quoted = true
      } else if (char === ',') {
        fields.push(field)
        field = ''
      } else {
        field += char
      }
    }
    fields.push(field)
    return fields
  }

  const [headerLine = '', ...rowLines] = lines
  return {
    header: parseLine(headerLine),
    rows: rowLines.filter((line) => line.length > 0).map(parseLine),
  }
}

describe('Insights', () => {
  it('renders eight theme rows, led by CSV export from Insights with 14', () => {
    renderInsights()

    const names = themeRowNames()
    expect(names).toHaveLength(8)
    expect(names[0]).toBe('CSV export from Insights')

    const topRow = screen.getByRole('row', {
      name: /CSV export from Insights/,
    })
    expect(within(topRow).getByText('14')).toBeInTheDocument()
  })

  it('narrows to computed counts when Plan is Business', async () => {
    const { user } = renderInsights()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Business',
    )

    const names = themeRowNames()
    expect(names).toHaveLength(7)
    expect(names[0]).toBe('CSV export from Insights')

    const topRow = screen.getByRole('row', {
      name: /CSV export from Insights/,
    })
    expect(within(topRow).getByText('5')).toBeInTheDocument()
    expect(
      screen.queryByRole('rowheader', { name: 'Free tier limits' }),
    ).toBeNull()
  })

  it('keeps the table purpose caption and shows the computed caption below the panel', async () => {
    const { user } = renderInsights()

    // The table's own caption stays the fixed purpose string.
    expect(
      screen.getByText('Top feedback themes by number of mentions'),
    ).toBeInTheDocument()

    // The caption line below the panel is computed from the current view and
    // is plain text: no live region.
    const captionLine = screen.getByText(
      'The 8 most-mentioned themes in this view.',
    )
    expect(captionLine).toBeInTheDocument()
    expect(captionLine).not.toHaveAttribute('role')
    expect(captionLine).not.toHaveAttribute('aria-live')

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Starter',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Source' }),
      'Sales call',
    )

    expect(
      screen.getByText('0 items and 0 themes in this view.'),
    ).toBeInTheDocument()
    // With no rows the table itself is gone, only the empty copy remains.
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('shows the empty state as a polite status region when nothing matches', async () => {
    const { user } = renderInsights()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Starter',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Source' }),
      'Sales call',
    )

    // The three fixed lines live together in a single polite live region so a
    // keyboard user who changed a filter hears the result.
    const status = screen.getByRole('status')
    expect(
      within(status).getByText('No feedback matched these filters.'),
    ).toBeInTheDocument()
    expect(
      within(status).getByText(
        'Widen the date range or clear a filter to see the themes again.',
      ),
    ).toBeInTheDocument()
    expect(
      within(status).getByText(
        'An export now downloads a header row only.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('0 items and 0 themes in this view.'),
    ).toBeInTheDocument()
  })

  it('downloads the theme-summary CSV once when Export CSV is clicked', async () => {
    const { user, onDownload } = renderInsights()

    await user.click(screen.getByRole('button', { name: 'Export CSV' }))

    expect(onDownload).toHaveBeenCalledTimes(1)
    expect(onDownload.mock.calls[0][0]).toMatch(
      /^loopwise-insights-theme-summary-\d{4}-\d{2}-\d{2}\.csv$/,
    )
  })

  it('exports at the feedback-items grain without changing the table', async () => {
    const { user, onDownload } = renderInsights()

    await user.click(screen.getByRole('radio', { name: /Feedback items/ }))
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))

    expect(onDownload).toHaveBeenCalledTimes(1)
    expect(onDownload.mock.calls[0][0]).toMatch(
      /^loopwise-insights-feedback-items-\d{4}-\d{2}-\d{2}\.csv$/,
    )
    expect(themeRowNames()).toHaveLength(8)
  })

  it('exports exactly the filtered items and matches the displayed row count', async () => {
    const { user, onDownload } = renderInsights()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Business',
    )
    await user.click(screen.getByRole('radio', { name: /Feedback items/ }))
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))

    expect(onDownload).toHaveBeenCalledTimes(1)
    const csv = parseCsv(onDownload.mock.calls[0][1] as string)
    const planColumn = csv.header.indexOf('plan')
    expect(planColumn).toBeGreaterThan(-1)
    expect(csv.rows.length).toBeGreaterThan(0)
    for (const row of csv.rows) {
      expect(row[planColumn]).toBe('Business')
    }

    // The download row count agrees with the count the page shows beside the
    // export button, so the file can never silently ignore the filter.
    const displayedCount = Number(
      screen.getByText(/\d+ rows? in this view/).textContent?.match(/\d+/)?.[0],
    )
    expect(displayedCount).toBeGreaterThan(0)
    expect(csv.rows).toHaveLength(displayedCount)
  })

  it('exports a header-only file once when the filters match nothing', async () => {
    const { user, onDownload } = renderInsights()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Starter',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Source' }),
      'Sales call',
    )
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))

    expect(onDownload).toHaveBeenCalledTimes(1)
    const csv = parseCsv(onDownload.mock.calls[0][1] as string)
    expect(csv.header.length).toBeGreaterThan(0)
    expect(csv.rows).toHaveLength(0)
  })

  it('clears the export confirmation when a filter changes', async () => {
    const { user } = renderInsights()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Starter',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Source' }),
      'Sales call',
    )
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(
      screen.getByText('No feedback matched your filters.'),
    ).toBeInTheDocument()

    // Widening the filters repopulates the table; the stale no-match
    // confirmation must not survive the change.
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Business',
    )
    expect(screen.queryByText('No feedback matched your filters.')).toBeNull()
  })

  it('clears the export confirmation when filters are cleared', async () => {
    const { user } = renderInsights()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Starter',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Source' }),
      'Sales call',
    )
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(
      screen.getByText('No feedback matched your filters.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.queryByText('No feedback matched your filters.')).toBeNull()
  })

  it('applies a picker toggle to the next export with no apply step', async () => {
    const { user, onDownload } = renderInsights()

    await user.click(screen.getByRole('button', { name: 'Choose columns' }))
    const themeGroup = screen.getByRole('group', {
      name: 'Theme summary columns',
    })
    await user.click(
      within(themeGroup).getByRole('checkbox', { name: 'Plan mix' }),
    )
    // Escape closes the panel the same as its Close control; using the key
    // avoids depending on how many Close-named buttons the panel exposes.
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: 'Export CSV' }))

    const content = onDownload.mock.calls[0][1] as string
    const header = content.replace(/^﻿/, '').split('\r\n')[0]
    expect(header).toContain('plan_mix')
  })

  it('restores the full table when filters are cleared', async () => {
    const { user } = renderInsights()

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Business',
    )
    expect(themeRowNames()).toHaveLength(7)

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(themeRowNames()).toHaveLength(8)
  })

  it('tabs filters first, then the export cluster, in the declared order', async () => {
    const { user } = renderInsights()

    // Clear filters is only focusable once a filter is off its default, so the
    // order must be measured with one applied.
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Plan' }),
      'Business',
    )

    // Names come straight from the accessible-name queries, so each recorded
    // focus target is identified by the name a screen reader would announce.
    const controls: Array<[string, HTMLElement]> = [
      ['Plan', screen.getByRole('combobox', { name: 'Plan' })],
      ['Source', screen.getByRole('combobox', { name: 'Source' })],
      ['Sentiment', screen.getByRole('combobox', { name: 'Sentiment' })],
      ['From', screen.getByLabelText('From')],
      ['To', screen.getByLabelText('To')],
      ['Clear filters', screen.getByRole('button', { name: 'Clear filters' })],
      ['Theme summary', screen.getByRole('radio', { name: /Theme summary/ })],
      ['Feedback items', screen.getByRole('radio', { name: /Feedback items/ })],
      ['Choose columns', screen.getByRole('button', { name: 'Choose columns' })],
      ['Export CSV', screen.getByRole('button', { name: 'Export CSV' })],
    ]

    // selectOptions leaves the select focused; start the tab sequence from the
    // top of the document instead.
    ;(document.activeElement as HTMLElement | null)?.blur()

    const order: string[] = []
    for (let step = 0; step < 12; step += 1) {
      await user.tab()
      const focused = controls.find(
        ([, element]) => element === document.activeElement,
      )
      if (focused) order.push(focused[0])
    }

    expect(order[0]).toBe('Plan')

    const clearIndex = order.indexOf('Clear filters')
    expect(clearIndex).toBeGreaterThan(-1)

    // Only the checked radio in the grain group is tabbable, so take whichever
    // grain option the browser put in the tab order.
    const grainIndexes = ['Theme summary', 'Feedback items']
      .map((name) => order.indexOf(name))
      .filter((index) => index >= 0)
    expect(grainIndexes.length).toBeGreaterThan(0)
    const grainIndex = Math.min(...grainIndexes)

    expect(grainIndex).toBeGreaterThan(clearIndex)
    expect(order.indexOf('Choose columns')).toBeGreaterThan(clearIndex)
    expect(order.indexOf('Export CSV')).toBeGreaterThan(clearIndex)
  })

  it('renders exactly the dataset-derived theme rows and no TODO placeholder', () => {
    renderInsights()

    const expected: Array<[string, string]> = [
      ['CSV export from Insights', '14'],
      ['Slack notifications', '11'],
      ['Jira sync', '9'],
      ['SSO / SAML', '7'],
      ['Bulk editing', '6'],
      ['Free tier limits', '5'],
      ['Mobile app', '4'],
      ['API rate limits', '3'],
    ]

    expect(themeRowNames()).toEqual(expected.map(([theme]) => theme))
    for (const [theme, count] of expected) {
      const row = screen.getByRole('row', { name: `${theme} ${count}` })
      expect(within(row).getByText(count)).toBeInTheDocument()
    }

    expect(screen.queryByText(/TODO/)).toBeNull()
  })
})
