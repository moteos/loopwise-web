import { afterEach, describe, it, expect, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Grain } from '../../data/feedback'
import {
  DEFAULT_THEME_SUMMARY_COLUMNS,
  DEFAULT_FEEDBACK_ITEM_COLUMNS,
} from '../../lib/insights/columns'
import ColumnPicker from './ColumnPicker'
import type { ColumnPickerProps } from './ColumnPicker'

afterEach(cleanup)

const THEME_GROUP = 'Theme summary columns'
const FEEDBACK_GROUP = 'Feedback item columns'

function setup(overrides: Partial<ColumnPickerProps> = {}) {
  const props: ColumnPickerProps = {
    open: true,
    grain: 'theme-summary' as Grain,
    columns: {
      'theme-summary': [...DEFAULT_THEME_SUMMARY_COLUMNS],
      'feedback-items': [...DEFAULT_FEEDBACK_ITEM_COLUMNS],
    },
    onToggle: vi.fn(),
    onReset: vi.fn(),
    onClose: vi.fn(),
    id: 'column-picker',
    ...overrides,
  }

  const user = userEvent.setup()
  const utils = render(<ColumnPicker {...props} />)
  return { user, ...utils, ...props }
}

describe('ColumnPicker', () => {
  it('renders nothing when closed', () => {
    const { container } = setup({ open: false })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(container).toBeEmptyDOMElement()
  })

  it('renders both group legends and fourteen checkboxes', () => {
    setup()

    const themeGroup = screen.getByRole('group', { name: THEME_GROUP })
    const feedbackGroup = screen.getByRole('group', { name: FEEDBACK_GROUP })

    expect(within(themeGroup).getAllByRole('checkbox')).toHaveLength(7)
    expect(within(feedbackGroup).getAllByRole('checkbox')).toHaveLength(7)
    expect(screen.getAllByRole('checkbox')).toHaveLength(14)

    expect(screen.getByRole('dialog')).toHaveAttribute('id', 'column-picker')
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Choose columns')
  })

  it('toggles an unchecked column straight through to onToggle', async () => {
    const { user, onToggle } = setup()

    const group = screen.getByRole('group', { name: THEME_GROUP })
    const checkbox = within(group).getByRole('checkbox', { name: 'Account count' })
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith('theme-summary', 'account_count')
  })

  it('toggles an already-checked column with the same arguments', async () => {
    const { user, onToggle } = setup()

    const group = screen.getByRole('group', { name: THEME_GROUP })
    const checkbox = within(group).getByRole('checkbox', { name: 'Theme' })
    expect(checkbox).toBeChecked()

    await user.click(checkbox)

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith('theme-summary', 'theme')
  })

  it('disables only the last remaining selected checkbox in a group', () => {
    setup({
      columns: {
        'theme-summary': ['theme'],
        'feedback-items': [...DEFAULT_FEEDBACK_ITEM_COLUMNS],
      },
    })

    const group = screen.getByRole('group', { name: THEME_GROUP })
    expect(within(group).getByRole('checkbox', { name: 'Theme' })).toBeDisabled()
    expect(within(group).getByRole('checkbox', { name: 'Mentions' })).toBeEnabled()
    expect(within(group).getByRole('checkbox', { name: 'Account count' })).toBeEnabled()

    // The other group is untouched.
    const feedbackGroup = screen.getByRole('group', { name: FEEDBACK_GROUP })
    for (const checkbox of within(feedbackGroup).getAllByRole('checkbox')) {
      expect(checkbox).toBeEnabled()
    }
  })

  it('always shows the guard line as visible text, not a tooltip', () => {
    setup()
    const guard = screen.getByText('At least one column must stay selected.')
    expect(guard).toBeVisible()
    expect(guard).not.toHaveAttribute('title')
  })

  it('closes on Escape', async () => {
    const { user, onClose } = setup()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a backdrop click', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByTestId('column-picker-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders two controls named Close: the header icon and the footer button', () => {
    setup()
    // Both are labelled "Close" by design: the icon button via aria-label and the
    // footer control via its visible text. getAllByRole returns them in DOM order.
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2)
  })

  it('closes the panel when the header Close icon button is activated', async () => {
    const { user, onClose } = setup()
    // DOM order: [0] header × icon button, [1] footer Close button.
    const [headerClose] = screen.getAllByRole('button', { name: 'Close' })
    await user.click(headerClose)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes the panel when the footer Close button is activated', async () => {
    const { user, onClose } = setup()
    // DOM order: [0] header × icon button, [1] footer Close button.
    const [, footerClose] = screen.getAllByRole('button', { name: 'Close' })
    await user.click(footerClose)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on a click inside the dialog', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onReset and stays open', async () => {
    const { user, onReset } = setup({
      columns: {
        'theme-summary': ['theme', 'mentions', 'affected_arr'],
        'feedback-items': [...DEFAULT_FEEDBACK_ITEM_COLUMNS],
      },
    })
    const reset = screen.getByRole('button', { name: 'Reset' })
    expect(reset).toBeEnabled()
    await user.click(reset)
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('disables Reset when the current grain already matches its defaults', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('enables Reset when the current grain selection differs from its defaults', () => {
    setup({
      columns: {
        'theme-summary': ['theme', 'mentions', 'affected_arr', 'account_count'],
        'feedback-items': [...DEFAULT_FEEDBACK_ITEM_COLUMNS],
      },
    })
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
  })

  it('renders the count line for the current grain', () => {
    setup()
    expect(
      screen.getByText('Theme summary grain: 4 columns selected.'),
    ).toBeVisible()
  })

  it('moves focus into the dialog and traps Tab within it', async () => {
    const { user } = setup()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveFocus()

    // getAllByRole returns DOM order: [0] the header × icon button (first
    // focusable) and [1] the footer Close button (last focusable).
    const [headerClose, footerClose] = screen.getAllByRole('button', { name: 'Close' })

    // Shift-Tab from the first focusable wraps to the last.
    headerClose.focus()
    await user.tab({ shift: true })
    expect(footerClose).toHaveFocus()

    // Tab from the last focusable wraps back to the first.
    await user.tab()
    expect(headerClose).toHaveFocus()
  })
})
