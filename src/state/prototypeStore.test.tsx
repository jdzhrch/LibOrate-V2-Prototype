import { meetings } from '../data/meetings'
import { sharedCommonHumanity } from '../data/emotions'
import { buildCheckInRecord, filterCheckInsByDateRange } from './helpers'

describe('buildCheckInRecord', () => {
  it('binds the created record to the active meeting and rotates phrase selection', () => {
    const first = buildCheckInRecord({
      emotionKey: 'nervous',
      meeting: meetings[1],
      existingCheckIns: [],
      emotionLibrary: [
        {
          key: 'nervous',
          chipLabel: 'I feel nervous',
          supportTitle: 'A steadier way in',
          commonHumanity: '',
          kindnessPhrases: ['First custom phrase', 'Second custom phrase'],
          isArchived: false,
        },
      ],
      now: new Date('2026-04-02T15:30:00.000Z'),
    })

    const second = buildCheckInRecord({
      emotionKey: 'nervous',
      meeting: meetings[1],
      existingCheckIns: [first],
      emotionLibrary: [
        {
          key: 'nervous',
          chipLabel: 'I feel nervous',
          supportTitle: 'A steadier way in',
          commonHumanity: '',
          kindnessPhrases: ['First custom phrase', 'Second custom phrase'],
          isArchived: false,
        },
      ],
      now: new Date('2026-04-02T15:32:00.000Z'),
    })

    expect(first.meetingId).toBe(meetings[1].id)
    expect(first.meetingTitle).toBe('Client kickoff')
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
        emotionKey: 'stuck',
        meeting: meetings[0],
        existingCheckIns: [],
        emotionLibrary: [
          {
            key: 'stuck',
            chipLabel: 'I feel stuck',
            supportTitle: 'Stay here',
            commonHumanity: '',
            kindnessPhrases: ['Stay here'],
            isArchived: false,
          },
        ],
        now: new Date('2026-04-02T15:30:00.000Z'),
      }),
      buildCheckInRecord({
        emotionKey: 'rushing',
        meeting: meetings[1],
        existingCheckIns: [],
        emotionLibrary: [
          {
            key: 'rushing',
            chipLabel: 'I want to rush',
            supportTitle: 'Slow it down',
            commonHumanity: '',
            kindnessPhrases: ['Slow it down'],
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
