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
  // 1. Tuesday Design Review (6 check-ins on April 2nd, demonstrating all spacing types: standard, medium, large)
  buildSeedCheckIn({
    id: 'seed-design-review-6-frustration',
    meetingId: 'design-review',
    emotionKey: 'guilt-frustration',
    phraseIndex: 1,
    createdAt: '2026-04-02T16:35:00.000Z', // +13 min gap (Medium solid line)
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-5-isolation',
    meetingId: 'design-review',
    emotionKey: 'isolation',
    phraseIndex: 0,
    createdAt: '2026-04-02T16:22:00.000Z', // +2 min gap (Standard solid line)
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-4-hopelessness',
    meetingId: 'design-review',
    emotionKey: 'hopelessness',
    phraseIndex: 1,
    createdAt: '2026-04-02T16:20:00.000Z', // +35 min gap (Large dashed line with "+35 min" label)
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-3-fear',
    meetingId: 'design-review',
    emotionKey: 'fear',
    phraseIndex: 0,
    createdAt: '2026-04-02T15:45:00.000Z', // +10 min gap (Medium solid line)
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-2-avoidance',
    meetingId: 'design-review',
    emotionKey: 'avoidance',
    phraseIndex: 1,
    createdAt: '2026-04-02T15:35:00.000Z', // +3 min gap (Standard solid line)
  }),
  buildSeedCheckIn({
    id: 'seed-design-review-1-anxiety',
    meetingId: 'design-review',
    emotionKey: 'anxiety',
    phraseIndex: 0,
    createdAt: '2026-04-02T15:32:00.000Z', // Oldest item in Design Review session
  }),

  // 2. Client Kickoff (4 check-ins on March 28th, demonstrating standard and large gaps)
  buildSeedCheckIn({
    id: 'seed-client-kickoff-4-frustration',
    meetingId: 'client-kickoff',
    emotionKey: 'guilt-frustration',
    phraseIndex: 0,
    createdAt: '2026-03-28T09:43:00.000Z', // +3 min gap (Standard solid line)
  }),
  buildSeedCheckIn({
    id: 'seed-client-kickoff-3-shame',
    meetingId: 'client-kickoff',
    emotionKey: 'shame-embarrassment',
    phraseIndex: 1,
    createdAt: '2026-03-28T09:40:00.000Z', // +34 min gap (Large dashed line with "+34 min" label)
  }),
  buildSeedCheckIn({
    id: 'seed-client-kickoff-2-anxiety',
    meetingId: 'client-kickoff',
    emotionKey: 'anxiety',
    phraseIndex: 0,
    createdAt: '2026-03-28T09:06:00.000Z', // +4 min gap (Standard solid line)
  }),
  buildSeedCheckIn({
    id: 'seed-client-kickoff-1-fear',
    meetingId: 'client-kickoff',
    emotionKey: 'fear',
    phraseIndex: 0,
    createdAt: '2026-03-28T09:02:00.000Z', // Oldest item in Client Kickoff session
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
