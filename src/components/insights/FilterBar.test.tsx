import { useState } from 'react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FilterState } from '../../lib/insights/filter'
import { DEFAULT_FILTERS } from '../../lib/insights/filter'
import FilterBar from './FilterBar'

interface HarnessProps {
  initial?: FilterState
  dateError?: string | null
  onChangeSpy?: (next: FilterState) => void
  onClear?: () => void
}

/**
 * Controlled harness: holds the state the component emits so the displayed
 * values track the emitted filters, while still letting a test spy on the
 * exact object passed to onChange.
 */
function Harness({
  initial = DEFAULT_FILTERS,
  dateError = null,
  onChangeSpy,
  onClear,
}: HarnessProps) {
  const [filters, setFilters] = useState<FilterState>(initial)

  return (
    <FilterBar
      filters={filters}
      dateError={dateError}
      onChange={(next) => {
        onChangeSpy?.(next)
        setFilters(next)
      }}
      onClear={onClear ?? (() => setFilters(DEFAULT_FILTERS))}
    />
  )
}

// vitest runs without `globals`, so Testing Library's automatic cleanup is not
// registered — do it explicitly or every render leaks into the next test.
afterEach(cleanup)

const clearButton = () =>
  screen.getByRole('button', { name: 'Clear filters' })

describe('FilterBar', () => {
  it('emits the chosen plan and leaves every other field unchanged', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChangeSpy={onChange} />)

    await user.selectOptions(screen.getByLabelText('Plan'), 'Business')

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      plan: 'Business',
    })
  })

  it('emits the mapped sentiment value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChangeSpy={onChange} />)

    await user.selectOptions(screen.getByLabelText('Sentiment'), 'Negative')

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      sentiment: 'negative',
    })
  })

  it('emits the chosen source', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChangeSpy={onChange} />)

    await user.selectOptions(screen.getByLabelText('Source'), 'Community')

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      source: 'Community',
    })
  })

  it('emits a typed From date and null when the date is cleared', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChangeSpy={onChange} />)

    const from = screen.getByLabelText('From')
    await user.type(from, '2026-07-01')
    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_FILTERS,
      from: '2026-07-01',
    })

    await user.clear(from)
    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_FILTERS,
      from: null,
    })
  })

  it('disables Clear filters at the defaults and enables it once a dimension moves', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(clearButton()).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('Plan'), 'Business')

    expect(clearButton()).toBeEnabled()
  })

  it('calls onClear when Clear filters is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <Harness
        initial={{ ...DEFAULT_FILTERS, plan: 'Business' }}
        onClear={onClear}
      />,
    )

    await user.click(clearButton())

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('renders a non-null dateError with the alert role and nothing when null', () => {
    const { rerender } = render(<Harness dateError="From must be before To" />)

    expect(screen.getByRole('alert')).toHaveTextContent('From must be before To')

    rerender(<Harness dateError={null} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('exposes an accessible name for all five controls and the button', () => {
    render(<Harness />)

    expect(screen.getByLabelText('Plan')).toBeInTheDocument()
    expect(screen.getByLabelText('Source')).toBeInTheDocument()
    expect(screen.getByLabelText('Sentiment')).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
    expect(clearButton()).toBeInTheDocument()
  })
})
