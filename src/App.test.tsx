import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { PrototypeProvider } from './state/prototypeStore'
import { sharedCommonHumanity } from './data/emotions'

describe('App workspace sync', () => {
  it('uses meeting-level cumulative counts in the zoom surface', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <PrototypeProvider>
          <App />
        </PrototypeProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('tab', { name: 'Self-Compassion Break' }))
    expect(screen.queryByRole('tab', { name: 'Phrases' })).not.toBeInTheDocument()
    expect(screen.queryByText('Choose what fits this moment.')).not.toBeInTheDocument()
    expect(screen.queryByText('Custom common humanity')).not.toBeInTheDocument()

    const stuckCard = screen.getByRole('heading', { name: 'I feel stuck' }).closest(
      '.phrase-editor-card',
    ) as HTMLElement | null
    const addEmotionCard = screen.getByRole('heading', { name: 'Add emotion' }).closest(
      '.phrase-create-card',
    ) as HTMLElement | null

    if (!stuckCard || !addEmotionCard) {
      throw new Error('Expected phrase editing cards to be present')
    }

    expect(within(stuckCard).getByLabelText('Common humanity')).toHaveValue(sharedCommonHumanity)
    fireEvent.change(within(stuckCard).getByLabelText('Common humanity'), {
      target: { value: 'Many people lose their footing while speaking. This moment does not take you out of the room.' },
    })
    fireEvent.change(within(stuckCard).getByLabelText('Self-kindness'), {
      target: { value: 'Move through this one sentence gently.' },
    })
    fireEvent.change(within(addEmotionCard).getByLabelText('Label in Zoom'), {
      target: { value: 'I need a reset' },
    })
    fireEvent.change(within(addEmotionCard).getByLabelText('Common humanity'), {
      target: { value: 'Many people need a reset in a hard conversation. You are not off track.' },
    })
    fireEvent.change(within(addEmotionCard).getByLabelText('Self-kindness'), {
      target: { value: 'I can reset this moment and begin again.' },
    })
    await user.click(screen.getByRole('button', { name: 'Add emotion' }))
    const nervousCard = screen.getByRole('heading', { name: 'I feel nervous' }).closest(
      '.phrase-editor-card',
    ) as HTMLElement | null

    if (!nervousCard) {
      throw new Error('Expected I feel nervous card to be present')
    }

    expect(within(nervousCard).getByLabelText('Common humanity')).toHaveValue(sharedCommonHumanity)
    await user.click(within(nervousCard).getByRole('button', { name: 'Archive' }))
    await user.click(screen.getByRole('button', { name: 'Save library' }))

    expect(container.querySelector('.zoom-card-common-humanity')).toHaveAttribute(
      'data-state',
      'idle',
    )
    expect(container.querySelector('.zoom-card-self-kindness')).toHaveAttribute(
      'data-state',
      'idle',
    )

    expect(screen.queryByRole('button', { name: 'I feel nervous' })).not.toBeInTheDocument()
    const archivedNervousCard = screen.getByRole('heading', { name: 'I feel nervous' }).closest(
      '.phrase-editor-card',
    ) as HTMLElement | null

    if (!archivedNervousCard) {
      throw new Error('Expected archived I feel nervous card to be present')
    }

    expect(within(archivedNervousCard).getByRole('button', { name: 'Restore' })).toBeInTheDocument()

    const resetButton = screen.getByRole('button', { name: 'I need a reset' })
    const stuckButton = screen.getByRole('button', { name: 'I feel stuck' })
    expect(resetButton).toHaveAttribute('data-color', 'teal')
    expect(stuckButton).toHaveAttribute('data-color', 'indigo')
    await user.click(resetButton)
    await user.click(resetButton)
    await user.click(stuckButton)
    await user.click(resetButton)
    await user.click(stuckButton)

    expect(stuckButton).toHaveAttribute('aria-pressed', 'true')
    expect(resetButton).toHaveAttribute('data-meeting-count', '3')
    expect(stuckButton).toHaveAttribute('data-meeting-count', '3')
    expect(container.querySelector('.zoom-card-common-humanity')).toHaveAttribute(
      'data-state',
      'active',
    )
    expect(container.querySelector('.zoom-card-self-kindness')).toHaveAttribute(
      'data-state',
      'active',
    )
    expect(within(resetButton).getByText('3')).toBeInTheDocument()
    expect(container.querySelector('.zoom-card-common-humanity')?.textContent).toContain(
      'Many people lose their footing while speaking. This moment does not take you out of the room.',
    )
    expect(
      container.querySelector('.zoom-card-self-kindness')?.textContent,
    ).toContain('Move through this one sentence gently.')
    expect(container.querySelector('.zoom-kindness-chip')).not.toBeInTheDocument()
    expect(
      container.querySelector('.zoom-card-self-kindness .zoom-card-marker-kindness'),
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Default common humanity')).not.toBeInTheDocument()
    expect(screen.queryByText('Collaborate')).not.toBeInTheDocument()
    expect(screen.queryByText('Emotions and thoughts')).not.toBeInTheDocument()
    expect(screen.queryByText('Check-ins')).not.toBeInTheDocument()
    expect(screen.queryByText('Custom common humanity')).not.toBeInTheDocument()

    const zoomSurface = container.querySelector('.zoom-chrome')

    if (!zoomSurface) {
      throw new Error('Expected zoom surface to exist')
    }

    expect(within(zoomSurface as HTMLElement).queryByText('Today · 3:30 PM')).not.toBeInTheDocument()
  })

  it('uses a full-width web shell on the standalone web route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/web']}>
        <PrototypeProvider>
          <App />
        </PrototypeProvider>
      </MemoryRouter>,
    )

    expect(container.querySelector('.single-surface-wide .web-shell-standalone')).not.toBeNull()
  })
})
