import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import InsightsExport from './InsightsExport'

// Vitest runs without globals here, so RTL's automatic cleanup never
// registers; tear the DOM down between tests explicitly.
afterEach(cleanup)
afterEach(() => {
  vi.restoreAllMocks()
})
// The module-level mock props would otherwise accumulate calls across tests.
beforeEach(() => {
  vi.clearAllMocks()
})

type InsightsExportProps = ComponentProps<typeof InsightsExport>

const defaultProps: InsightsExportProps = {
  grain: 'theme-summary',
  onGrainChange: vi.fn(),
  selectedColumnKeys: ['theme', 'mentions', 'affected_arr', 'sentiment'],
  totalColumnCount: 7,
  onChooseColumns: vi.fn(),
  pickerOpen: false,
  pickerId: 'column-picker',
  onExport: vi.fn(),
  rowCount: 52,
  feedback: null,
}

function renderCluster(overrides: Partial<InsightsExportProps> = {}) {
  const props: InsightsExportProps = { ...defaultProps, ...overrides }
  const view = render(<InsightsExport {...props} />)
  return { ...view, props }
}

describe('InsightsExport', () => {
  it('checks the theme-summary radio when the grain is theme-summary', () => {
    renderCluster({ grain: 'theme-summary' })

    expect(screen.getByRole('radio', { name: /Theme summary/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Feedback items/ })).not.toBeChecked()
  })

  it('calls onGrainChange with feedback-items when that radio is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderCluster()

    await user.click(screen.getByRole('radio', { name: /Feedback items/ }))

    expect(props.onGrainChange).toHaveBeenCalledWith('feedback-items')
  })

  it('summarises the selected columns and lists their labels', () => {
    renderCluster({
      grain: 'theme-summary',
      selectedColumnKeys: ['theme', 'mentions', 'affected_arr', 'sentiment'],
      totalColumnCount: 7,
    })

    const line = screen.getByText(/Columns 4 of 7 selected/)
    expect(line).toHaveTextContent('Columns 4 of 7 selected')
    expect(line).toHaveTextContent('Theme, Mentions, Affected ARR, Sentiment')
  })

  it('puts the full column list in the title, and omits it when nothing is selected', () => {
    const { props, rerender } = renderCluster({
      selectedColumnKeys: ['theme', 'mentions', 'affected_arr', 'sentiment'],
      totalColumnCount: 7,
    })

    const line = screen.getByText(/Columns 4 of 7 selected/)
    expect(line).toHaveAttribute(
      'title',
      'Theme, Mentions, Affected ARR, Sentiment',
    )

    rerender(<InsightsExport {...props} selectedColumnKeys={[]} />)

    expect(
      screen.getByText(/Columns 0 of 7 selected/),
    ).not.toHaveAttribute('title')
  })

  it('pluralises the row count correctly', () => {
    const { unmount } = renderCluster({ rowCount: 52 })
    expect(screen.getByText('52 rows in this view')).toBeInTheDocument()

    unmount()

    renderCluster({ rowCount: 1 })
    expect(screen.getByText('1 row in this view')).toBeInTheDocument()
  })

  it('changes the rendered row count when the prop changes', () => {
    const { props, rerender } = renderCluster({ rowCount: 52 })
    expect(screen.getByText('52 rows in this view')).toBeInTheDocument()

    rerender(<InsightsExport {...props} rowCount={3} />)

    expect(screen.getByText('3 rows in this view')).toBeInTheDocument()
    expect(screen.queryByText('52 rows in this view')).not.toBeInTheDocument()
  })

  it('exports once on click and never disables the export button, even at zero rows', async () => {
    const user = userEvent.setup()
    const { props } = renderCluster({ rowCount: 0 })

    const button = screen.getByRole('button', { name: 'Export CSV' })
    expect(button).toBeEnabled()

    await user.click(button)

    expect(props.onExport).toHaveBeenCalledTimes(1)
  })

  it('ignores a re-click in the same frame and allows a click on a later frame', () => {
    const frameCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.push(callback)
      return frameCallbacks.length
    })
    const { props } = renderCluster()
    const button = screen.getByRole('button', { name: 'Export CSV' })

    act(() => {
      button.click()
      button.click()
    })
    expect(props.onExport).toHaveBeenCalledTimes(1)

    // Drive the pending animation frame instead of waiting on a real timer.
    act(() => {
      for (const callback of frameCallbacks.splice(0)) callback(0)
    })

    act(() => {
      button.click()
    })
    expect(props.onExport).toHaveBeenCalledTimes(2)
  })

  it('shows the filename for a successful export', () => {
    renderCluster({ feedback: { kind: 'success', filename: 'x.csv' } })

    expect(screen.getByRole('status')).toHaveTextContent('Last export: x.csv')
  })

  it('shows the empty-view message for an empty export', () => {
    renderCluster({ feedback: { kind: 'empty', filename: 'x.csv' } })

    expect(screen.getByRole('status')).toHaveTextContent(
      'No feedback matched your filters.',
    )
    expect(screen.queryByText(/Last export:/)).not.toBeInTheDocument()
  })

  it('does not leave a stale filename beside an error', () => {
    const { props, rerender } = renderCluster({
      feedback: { kind: 'success', filename: 'stale.csv' },
    })
    expect(screen.getByRole('status')).toHaveTextContent('Last export: stale.csv')

    rerender(
      <InsightsExport
        {...props}
        feedback={{ kind: 'error', message: 'boom' }}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('boom')
    expect(screen.queryByText(/Last export:/)).not.toBeInTheDocument()
    expect(screen.getByRole('status')).not.toHaveTextContent('stale.csv')
  })

  it('reflects pickerOpen on the choose columns button', () => {
    const { props, rerender } = renderCluster({
      pickerOpen: false,
      pickerId: 'picker-1',
    })

    expect(screen.getByRole('button', { name: 'Choose columns' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Choose columns' })).toHaveAttribute(
      'aria-controls',
      'picker-1',
    )

    rerender(<InsightsExport {...props} pickerOpen={true} />)

    expect(screen.getByRole('button', { name: 'Choose columns' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
