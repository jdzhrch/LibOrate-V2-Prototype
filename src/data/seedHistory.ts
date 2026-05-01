import { defaultEmotions, sharedCommonHumanity } from './emotions'
import { meetings } from './meetings'
import type { CheckInRecord, EmotionConfig, LetterEntry } from '../types'

const meetingMap = new Map(meetings.map((meeting) => [meeting.id, meeting]))
const emotionMap = new Map(defaultEmotions.map((emotion) => [emotion.key, emotion]))

function getMeeting(meetingId: string) {
  const meeting = meetingMap.get(meetingId)

  if (!meeting) {
    throw new Error(`Unknown meeting id: ${meetingId}`)
  }

  return meeting
}

function getEmotion(emotionKey: string): EmotionConfig {
  const emotion = emotionMap.get(emotionKey)

  if (!emotion) {
    throw new Error(`Unknown emotion key: ${emotionKey}`)
  }

  return emotion
}

function buildSeedCheckIn(args: {
  id: string
  meetingId: string
  emotionKey: string
  phraseIndex?: number
  createdAt: string
}) {
  const meeting = getMeeting(args.meetingId)
  const emotion = getEmotion(args.emotionKey)
  const phraseIndex = args.phraseIndex ?? 0

  return {
    id: args.id,
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    meetingStartTime: meeting.startTime,
    emotionKey: emotion.key,
    emotionLabel: emotion.chipLabel,
    supportTitle: emotion.supportTitle,
    commonHumanity: emotion.commonHumanity.trim() || sharedCommonHumanity,
    kindnessPhrase: emotion.kindnessPhrases[phraseIndex] ?? emotion.kindnessPhrases[0],
    createdAt: args.createdAt,
  } satisfies CheckInRecord
}

export const seedCheckIns: CheckInRecord[] = [
  buildSeedCheckIn({
    id: 'seed-design-review-rushing-2026-04-02',
    meetingId: 'design-review',
    emotionKey: 'anxiety',
    phraseIndex: 0,
    createdAt: '2026-04-02T19:36:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-stuck-2026-04-02',
    meetingId: 'design-review',
    emotionKey: 'avoidance',
    phraseIndex: 1,
    createdAt: '2026-04-02T19:32:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-nervous-2026-04-02',
    meetingId: 'design-review',
    emotionKey: 'fear',
    phraseIndex: 0,
    createdAt: '2026-04-02T19:28:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-client-kickoff-ashamed-2026-03-28',
    meetingId: 'client-kickoff',
    emotionKey: 'shame-embarrassment',
    phraseIndex: 0,
    createdAt: '2026-03-28T13:18:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-client-kickoff-nervous-2026-03-28',
    meetingId: 'client-kickoff',
    emotionKey: 'fear',
    phraseIndex: 2,
    createdAt: '2026-03-28T13:12:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-practice-circle-steadying-2026-03-14',
    meetingId: 'practice-circle',
    emotionKey: 'isolation',
    phraseIndex: 1,
    createdAt: '2026-03-14T16:05:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-practice-circle-stuck-2026-03-14',
    meetingId: 'practice-circle',
    emotionKey: 'avoidance',
    phraseIndex: 2,
    createdAt: '2026-03-14T15:58:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-client-kickoff-rushing-2026-02-21',
    meetingId: 'client-kickoff',
    emotionKey: 'guilt-frustration',
    phraseIndex: 2,
    createdAt: '2026-02-21T14:05:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-practice-circle-nervous-2026-02-12',
    meetingId: 'practice-circle',
    emotionKey: 'anxiety',
    phraseIndex: 1,
    createdAt: '2026-02-12T10:20:00.000Z',
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-ashamed-2026-02-04',
    meetingId: 'design-review',
    emotionKey: 'hopelessness',
    phraseIndex: 2,
    createdAt: '2026-02-04T09:45:00.000Z',
  }),
]

export const seedLetters: LetterEntry[] = [
  {
    id: 'starter-letter',
    title: 'Before I speak',
    body:
      'You do not have to rush to make other people comfortable. Take the pause you need and let the idea arrive in your own rhythm.',
    mode: 'before-next-meeting',
    linkedMeetingId: null,
    createdAt: '2026-04-01T12:00:00.000Z',
  },
  {
    id: 'letter-after-kickoff',
    title: 'After the kickoff',
    body:
      'That meeting asked a lot of you. The harder moments do not cancel the care you brought into the room.',
    mode: 'after-a-hard-meeting',
    linkedMeetingId: 'client-kickoff',
    createdAt: '2026-03-29T17:10:00.000Z',
  },
  {
    id: 'letter-practice-circle',
    title: 'For the slower space',
    body:
      'Let the practice circle count as evidence. You already know how to stay with a sentence when the pressure drops.',
    mode: 'before-next-meeting',
    linkedMeetingId: 'practice-circle',
    createdAt: '2026-03-11T14:20:00.000Z',
  },
  {
    id: 'letter-shame-wave',
    title: 'When shame gets loud',
    body:
      'You are allowed to feel exposed and still treat yourself with respect. Warmth is not something you have to earn after a hard moment.',
    mode: 'when-shame-gets-loud',
    linkedMeetingId: null,
    createdAt: '2026-02-18T21:00:00.000Z',
  },
]
