import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { PrototypeProvider } from '../state/prototypeStore'
import { WebShell } from './WebShell'

afterEach(() => {
  vi.useRealTimers()
})

describe('WebShell', () => {
  it('filters check-ins by date and still supports switching to an emotion-centered view', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-02T16:00:00.000Z'))

    render(
      <PrototypeProvider
        initialState={{
          selectedMeetingId: 'design-review',
          letters: [
            {
              id: 'letter-1',
              title: 'Before the review',
              body: 'Begin slowly and stay on your own side.',
              mode: 'before-next-meeting',
              linkedMeetingId: 'design-review',
              createdAt: '2026-04-01T15:00:00.000Z',
            },
          ],
          checkIns: [
            {
              id: 'record-recent',
              meetingId: 'design-review',
              meetingTitle: 'Tuesday Design Review',
              meetingStartTime: 'Today · 3:30 PM',
              emotionKey: 'stuck',
              emotionLabel: 'I feel stuck',
              supportTitle: 'Stay with yourself here',
              commonHumanity: 'A difficult moment is still a human moment.',
              kindnessPhrase:
                'I am still part of this conversation, even if the words take time.',
              createdAt: '2026-04-02T15:32:00.000Z',
            },
            {
              id: 'record-recent-2',
              meetingId: 'practice-circle',
              meetingTitle: 'Practice Circle',
              meetingStartTime: 'Tomorrow · 11:00 AM',
              emotionKey: 'stuck',
              emotionLabel: 'I feel stuck',
              supportTitle: 'Stay with yourself here',
              commonHumanity: 'A difficult moment is still a human moment.',
              kindnessPhrase: 'I can pause and start again without turning against myself.',
              createdAt: '2026-04-01T15:32:00.000Z',
            },
            {
              id: 'record-old',
              meetingId: 'client-kickoff',
              meetingTitle: 'Client Kickoff',
              meetingStartTime: 'Friday · 9:00 AM',
              emotionKey: 'rushing',
              emotionLabel: 'I want to rush',
              supportTitle: 'Slow the pressure, not your value',
              commonHumanity: 'Urgency is a stress signal, not an order.',
              kindnessPhrase: 'I am allowed to slow this down.',
              createdAt: '2026-02-10T15:32:00.000Z',
            },
          ],
        }}
      >
        <WebShell />
      </PrototypeProvider>,
    )

    expect(screen.getByRole('tab', { name: 'Patterns' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Letters' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Self-Compassion Break' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Check-ins' })).not.toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: 'Pattern views' }).closest('.history-toolbar')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Patterns' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Meetings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Emotions' })).toBeInTheDocument()
    expect(screen.getByText('Meeting pressure map')).toBeInTheDocument()
    expect(screen.getByText('Support timeline')).toBeInTheDocument()
    expect(screen.getByText('Daily support moments')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Support timeline bar chart' })).toBeInTheDocument()
    expect(screen.getByText('What stands out')).toBeInTheDocument()
    expect(screen.getByText('Highest-support meeting')).toBeInTheDocument()
    expect(screen.queryByText('Most frequent emotion')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand Tuesday Design Review' })).toBeInTheDocument()
    expect(screen.queryByText('11:32 AM')).not.toBeInTheDocument()
    expect(screen.getAllByText('Tuesday Design Review').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Client Kickoff').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Stuck').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rush').length).toBeGreaterThan(0)
    expect(screen.queryByText('with history')).not.toBeInTheDocument()
    expect(screen.queryByText('Before the review')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '7 days' }))

    expect(screen.getAllByText('Tuesday Design Review').length).toBeGreaterThan(0)
    expect(screen.queryByText('Client Kickoff')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Emotions' }))

    expect(screen.getByText('Emotion pattern map')).toBeInTheDocument()
    expect(screen.getByText('Most repeated state')).toBeInTheDocument()
    expect(screen.queryByText('Highest-support meeting')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand I feel stuck' })).toBeInTheDocument()
    expect(screen.queryByText('Practice Circle')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Expand I feel stuck' }))
    expect(screen.getAllByText('I feel stuck').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Tuesday Design Review').length).toBeGreaterThan(0)
  })

  it('shows diary-style letters on a separate top-level page and allows optional meeting linking', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <PrototypeProvider
        initialState={{
          selectedMeetingId: 'design-review',
          letters: [
            {
              id: 'letter-1',
              title: 'Before the review',
              body: 'Take the pause that helps you think.',
              mode: 'before-next-meeting',
              linkedMeetingId: null,
              createdAt: '2026-04-01T15:00:00.000Z',
            },
          ],
          checkIns: [],
        }}
      >
        <WebShell />
      </PrototypeProvider>,
    )

    await user.click(screen.getByRole('tab', { name: 'Letters' }))

    expect(screen.getByText('Before the review')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Write a letter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Letter archive' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Before the next meeting' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'After a hard meeting' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'When shame gets loud' })).toBeInTheDocument()
    expect(screen.getByText('What are you walking into?')).toBeInTheDocument()
    expect(screen.getByLabelText('Letter title')).toBeInTheDocument()
    expect(screen.getByLabelText('Meeting link')).toBeInTheDocument()
    expect(screen.getByText('Choose a reflection frame')).toBeInTheDocument()

    const letterFormCard = container.querySelector('.letter-form-card')

    if (!letterFormCard) {
      throw new Error('Expected letter form card to exist')
    }

    expect(within(letterFormCard as HTMLElement).getByText('What are you walking into?')).toBeInTheDocument()
    expect(container.querySelector('.letter-guide-card')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'When shame gets loud' }))

    expect(screen.getByText('What are you criticizing yourself for right now?')).toBeInTheDocument()
    expect(
      within(letterFormCard as HTMLElement).getByText('What are you criticizing yourself for right now?'),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Letter title'), 'New note')
    await user.selectOptions(screen.getByLabelText('Meeting link'), 'client-kickoff')
    await user.type(screen.getByLabelText('Your letter'), 'I can slow the first sentence down.')
    await user.click(screen.getByRole('button', { name: 'Save letter' }))

    expect(screen.getByText('New note')).toBeInTheDocument()
    expect(screen.getAllByText('Client Kickoff').length).toBeGreaterThan(0)
    expect(screen.getAllByText('When shame gets loud').length).toBeGreaterThan(0)
  })
})
