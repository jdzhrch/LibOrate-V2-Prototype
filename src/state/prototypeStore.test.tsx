import { render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { meetings } from '../data/meetings'
import { sharedCommonHumanity } from '../data/emotions'
import { buildCheckInRecord, buildTimelinePoints, filterCheckInsByDateRange } from './helpers'
import { PrototypeProvider, usePrototypeStore } from './prototypeStore'

const STORAGE_KEY = 'liborate-prototype-state'

afterEach(() => {
  vi.useRealTimers()
  window.localStorage.clear()
})

function StoreProbe() {
  const { checkIns, letters } = usePrototypeStore()

  return (
    <div>
      <span data-testid="checkins-count">{checkIns.length}</span>
      <span data-testid="letters-count">{letters.length}</span>
    </div>
  )
}

describe('buildCheckInRecord', () => {
  it('binds the created record to the active meeting and rotates phrase selection', () => {
    const first = buildCheckInRecord({
      emotionKey: 'fear',
      meeting: meetings[1],
      existingCheckIns: [],
      emotionLibrary: [
        {
          key: 'fear',
          chipLabel: 'Fear',
          supportTitle: 'Steady through fear',
          commonHumanity: '',
          kindnessPhrases: ['First custom phrase', 'Second custom phrase'],
          isArchived: false,
        },
      ],
      now: new Date('2026-04-02T15:30:00.000Z'),
    })

    const second = buildCheckInRecord({
      emotionKey: 'fear',
      meeting: meetings[1],
      existingCheckIns: [first],
      emotionLibrary: [
        {
          key: 'fear',
          chipLabel: 'Fear',
          supportTitle: 'Steady through fear',
          commonHumanity: '',
          kindnessPhrases: ['First custom phrase', 'Second custom phrase'],
          isArchived: false,
        },
      ],
      now: new Date('2026-04-02T15:32:00.000Z'),
    })

    expect(first.meetingId).toBe(meetings[1].id)
    expect(first.meetingTitle).toBe('Client Kickoff')
    expect(first.kindnessPhrase).toBe('First custom phrase')
    expect(first.commonHumanity).toBe(sharedCommonHumanity)
    expect(second.kindnessPhrase).toBe('Second custom phrase')
  })

  it('supports newly added emotions when creating a record', () => {
    const record = buildCheckInRecord({
      emotionKey: 'resetting',
      meeting: meetings[0],
      existingCheckIns: [],
      emotionLibrary: [
        {
          key: 'resetting',
          chipLabel: 'I need a reset',
          supportTitle: 'Reset the pace',
          commonHumanity: 'Many speakers need a reset when pressure spikes.',
          kindnessPhrases: ['I can reset this moment and begin again.'],
          isArchived: false,
        },
      ],
      now: new Date('2026-04-02T16:30:00.000Z'),
    })

    expect(record.emotionKey).toBe('resetting')
    expect(record.emotionLabel).toBe('I need a reset')
    expect(record.kindnessPhrase).toBe('I can reset this moment and begin again.')
  })
})

describe('filterCheckInsByDateRange', () => {
  it('returns only the records inside the chosen date window', () => {
    const records = [
      buildCheckInRecord({
        emotionKey: 'anxiety',
        meeting: meetings[0],
        existingCheckIns: [],
        emotionLibrary: [
          {
            key: 'anxiety',
            chipLabel: 'Anxiety',
            supportTitle: 'Settle the rush',
            commonHumanity: '',
            kindnessPhrases: ['Slow my pace'],
            isArchived: false,
          },
        ],
        now: new Date('2026-04-02T15:30:00.000Z'),
      }),
      buildCheckInRecord({
        emotionKey: 'guilt-frustration',
        meeting: meetings[1],
        existingCheckIns: [],
        emotionLibrary: [
          {
            key: 'guilt-frustration',
            chipLabel: 'Guilt & Frustration',
            supportTitle: 'Release the blame',
            commonHumanity: '',
            kindnessPhrases: ['Release the blame'],
            isArchived: false,
          },
        ],
        now: new Date('2026-02-10T15:30:00.000Z'),
      }),
    ]

    const filtered = filterCheckInsByDateRange(records, {
      mode: 'last-7-days',
      now: new Date('2026-04-02T16:00:00.000Z'),
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.meetingId).toBe(meetings[0].id)
  })
})

describe('buildTimelinePoints', () => {
  it('switches to weekly aggregation when the range spans more than 14 distinct days', () => {
    const records = Array.from({ length: 15 }, (_, index) =>
      buildCheckInRecord({
        emotionKey: 'anxiety',
        meeting: meetings[0],
        existingCheckIns: [],
        emotionLibrary: [
          {
            key: 'anxiety',
            chipLabel: 'Anxiety',
            supportTitle: 'Settle the rush',
            commonHumanity: '',
            kindnessPhrases: ['Slow my pace'],
            isArchived: false,
          },
        ],
        now: new Date(`2026-03-${String(index + 1).padStart(2, '0')}T15:30:00.000Z`),
      }),
    )

    const points = buildTimelinePoints(records)

    expect(points).toHaveLength(3)
    expect(points.every((point) => point.granularity === 'week')).toBe(true)
    expect(points.every((point) => point.label.startsWith('Wk of '))).toBe(true)
  })
})

describe('PrototypeProvider seed data', () => {
  it('loads historical mock records by default', () => {
    window.localStorage.removeItem(STORAGE_KEY)

    render(
      <PrototypeProvider>
        <StoreProbe />
      </PrototypeProvider>,
    )

    expect(screen.getByTestId('checkins-count')).toHaveTextContent('10')
    expect(screen.getByTestId('letters-count')).toHaveTextContent('4')
  })

  it('falls back to the new seed data when persisted arrays are empty', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedMeetingId: meetings[0].id,
        checkIns: [],
        letters: [],
      }),
    )

    render(
      <PrototypeProvider>
        <StoreProbe />
      </PrototypeProvider>,
    )

    expect(screen.getByTestId('checkins-count')).toHaveTextContent('10')
    expect(screen.getByTestId('letters-count')).toHaveTextContent('4')
  })

  it('merges existing local data with the seeded history', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedMeetingId: meetings[0].id,
        checkIns: [
          buildCheckInRecord({
            emotionKey: 'isolation',
            meeting: meetings[0],
            existingCheckIns: [],
            emotionLibrary: [
              {
                key: 'isolation',
                chipLabel: 'Isolation',
                supportTitle: 'You are not alone',
                commonHumanity: sharedCommonHumanity,
                kindnessPhrases: ['I can reach for connection in small ways.'],
                isArchived: false,
              },
            ],
            now: new Date('2026-04-03T10:00:00.000Z'),
          }),
        ],
        letters: [
          {
            id: 'local-letter',
            title: 'A newer note',
            body: 'I can take the first sentence slowly.',
            mode: 'before-next-meeting',
            linkedMeetingId: meetings[0].id,
            createdAt: '2026-04-03T09:00:00.000Z',
          },
        ],
      }),
    )

    render(
      <PrototypeProvider>
        <StoreProbe />
      </PrototypeProvider>,
    )

    expect(screen.getByTestId('checkins-count')).toHaveTextContent('11')
    expect(screen.getByTestId('letters-count')).toHaveTextContent('5')
  })

  it('drops runaway local click data from today while keeping the seeded history', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-02T16:00:00.000Z'))

    const repeatedTodayRecords = Array.from({ length: 101 }, (_, index) =>
      buildCheckInRecord({
        emotionKey: 'fear',
        meeting: meetings[0],
        existingCheckIns: [],
        emotionLibrary: [
          {
            key: 'fear',
            chipLabel: 'Fear',
            supportTitle: 'Steady through fear',
            commonHumanity: sharedCommonHumanity,
            kindnessPhrases: ['I can breathe and let the word come.'],
            isArchived: false,
          },
        ],
        now: new Date(`2026-04-02T15:${String(index % 60).padStart(2, '0')}:00.000Z`),
      }),
    )

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedMeetingId: meetings[0].id,
        checkIns: repeatedTodayRecords,
        letters: [],
      }),
    )

    render(
      <PrototypeProvider>
        <StoreProbe />
      </PrototypeProvider>,
    )

    expect(screen.getByTestId('checkins-count')).toHaveTextContent('10')
    expect(screen.getByTestId('letters-count')).toHaveTextContent('4')
  })
})
