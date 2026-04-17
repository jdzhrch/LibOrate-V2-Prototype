import {
  getEmotionByKey,
  getEmotionColorToken,
  sharedCommonHumanity,
} from '../data/emotions'
import { meetings } from '../data/meetings'
import type {
  CheckInDateFilter,
  CheckInRecord,
  CheckInViewMode,
  EmotionConfig,
  EmotionKey,
  MeetingInfo,
} from '../types'
import { formatMonthDay } from '../utils/formatting'

function buildFallbackEmotion(record: CheckInRecord): EmotionConfig {
  return {
    key: record.emotionKey,
    chipLabel: record.emotionLabel,
    supportTitle: record.supportTitle,
    commonHumanity: record.commonHumanity,
    kindnessPhrases: [record.kindnessPhrase],
    isArchived: true,
    colorToken: getEmotionColorToken(record.emotionKey),
  }
}

function buildEmotionMap(emotionLibrary: EmotionConfig[]) {
  return new Map(emotionLibrary.map((emotion) => [emotion.key, emotion]))
}

function getEmotionForRecord(
  record: CheckInRecord,
  emotionMap: Map<string, EmotionConfig>,
) {
  return emotionMap.get(record.emotionKey) ?? buildFallbackEmotion(record)
}

export function buildCheckInRecord(args: {
  emotionKey: EmotionKey
  meeting: MeetingInfo
  existingCheckIns: CheckInRecord[]
  emotionLibrary: EmotionConfig[]
  now: Date
}): CheckInRecord {
  const emotion = getEmotionByKey(args.emotionKey, args.emotionLibrary)
  const activePhrases = emotion.kindnessPhrases
  const existingEmotionCount = args.existingCheckIns.filter(
    (checkIn) =>
      checkIn.meetingId === args.meeting.id && checkIn.emotionKey === args.emotionKey,
  ).length
  const kindnessPhrase = activePhrases[existingEmotionCount % activePhrases.length]

  return {
    id: `${args.meeting.id}-${args.emotionKey}-${args.now.getTime()}`,
    meetingId: args.meeting.id,
    meetingTitle: args.meeting.title,
    meetingStartTime: args.meeting.startTime,
    emotionKey: emotion.key,
    emotionLabel: emotion.chipLabel,
    supportTitle: emotion.supportTitle,
    commonHumanity: emotion.commonHumanity.trim() || sharedCommonHumanity,
    kindnessPhrase,
    createdAt: args.now.toISOString(),
  }
}

export function groupCheckInsByMeeting(checkIns: CheckInRecord[]) {
  return meetings
    .map((meeting) => ({
      meeting,
      records: checkIns.filter((checkIn) => checkIn.meetingId === meeting.id),
    }))
    .filter((group) => group.records.length > 0)
}

export function groupCheckInsByEmotion(
  checkIns: CheckInRecord[],
  emotionLibrary: EmotionConfig[],
) {
  const emotionMap = buildEmotionMap(emotionLibrary)
  const groups = new Map<string, { emotion: EmotionConfig; records: CheckInRecord[] }>()

  for (const record of checkIns) {
    const emotion = getEmotionForRecord(record, emotionMap)
    const current = groups.get(record.emotionKey)

    if (current) {
      current.records.push(record)
      continue
    }

    groups.set(record.emotionKey, {
      emotion,
      records: [record],
    })
  }

  return [...groups.values()].sort((left, right) => {
    if (right.records.length !== left.records.length) {
      return right.records.length - left.records.length
    }

    return left.emotion.chipLabel.localeCompare(right.emotion.chipLabel)
  })
}

export function filterCheckInsByDateRange(
  checkIns: CheckInRecord[],
  filter: CheckInDateFilter,
) {
  const now = filter.now ?? new Date()

  if (filter.mode === 'all') {
    return checkIns
  }

  if (filter.mode === 'last-7-days' || filter.mode === 'last-30-days') {
    const dayCount = filter.mode === 'last-7-days' ? 7 : 30
    const threshold = new Date(now.getTime() - dayCount * 24 * 60 * 60 * 1000)

    return checkIns.filter((record) => new Date(record.createdAt) >= threshold)
  }

  if (filter.mode === 'custom') {
    const start = filter.startDate ? new Date(`${filter.startDate}T00:00:00`) : null
    const end = filter.endDate ? new Date(`${filter.endDate}T23:59:59.999`) : null

    return checkIns.filter((record) => {
      const createdAt = new Date(record.createdAt)

      if (start && createdAt < start) {
        return false
      }

      if (end && createdAt > end) {
        return false
      }

      return true
    })
  }

  return checkIns
}

export function countRecordsByEmotion(
  checkIns: CheckInRecord[],
  emotionLibrary: EmotionConfig[] = [],
) {
  const emotionMap = buildEmotionMap(emotionLibrary)
  const groups = new Map<string, { emotion: EmotionConfig; count: number }>()

  for (const record of checkIns) {
    const emotion = getEmotionForRecord(record, emotionMap)
    const current = groups.get(record.emotionKey)

    if (current) {
      current.count += 1
      continue
    }

    groups.set(record.emotionKey, {
      emotion,
      count: 1,
    })
  }

  return [...groups.values()].sort((left, right) => right.count - left.count)
}

export function buildEmotionSnapshot(
  checkIns: CheckInRecord[],
  emotionLibrary: EmotionConfig[],
) {
  const rows = countRecordsByEmotion(checkIns, emotionLibrary)
  const maxCount = rows.reduce((largest, row) => Math.max(largest, row.count), 0)

  return rows.map((row) => ({
    ...row,
    meetingCount: new Set(
      checkIns
        .filter((record) => record.emotionKey === row.emotion.key)
        .map((record) => record.meetingId),
    ).size,
    widthPercent: maxCount === 0 ? 0 : Math.max(18, Math.round((row.count / maxCount) * 100)),
  }))
}

export function buildMeetingSnapshot(checkIns: CheckInRecord[]) {
  const rows = groupCheckInsByMeeting(checkIns)
    .map((group) => ({
      key: group.meeting.id,
      label: group.meeting.title,
      count: group.records.length,
      emotionCount: new Set(group.records.map((record) => record.emotionKey)).size,
    }))
    .sort((left, right) => right.count - left.count)
  const maxCount = rows.reduce((largest, row) => Math.max(largest, row.count), 0)

  return rows.map((row) => ({
    ...row,
    widthPercent: maxCount === 0 ? 0 : Math.max(18, Math.round((row.count / maxCount) * 100)),
  }))
}

export type TimelineGranularity = 'day' | 'week'

const DAY_GRANULARITY_LIMIT = 14

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - day)
  return result
}

export function buildTimelinePoints(checkIns: CheckInRecord[]) {
  const dailyTotals = new Map<string, { sortKey: string; date: Date; count: number }>()

  for (const record of checkIns) {
    const date = new Date(record.createdAt)
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`
    const current = dailyTotals.get(sortKey)

    dailyTotals.set(sortKey, {
      sortKey,
      date,
      count: (current?.count ?? 0) + 1,
    })
  }

  const dailyEntries = [...dailyTotals.values()].sort((left, right) =>
    left.sortKey < right.sortKey ? -1 : 1,
  )
  const granularity: TimelineGranularity =
    dailyEntries.length > DAY_GRANULARITY_LIMIT ? 'week' : 'day'

  const grouped =
    granularity === 'week'
      ? aggregateByWeek(dailyEntries)
      : dailyEntries.map((entry) => ({
          label: formatMonthDay(entry.date.toISOString()),
          count: entry.count,
        }))
  const maxCount = grouped.reduce((largest, point) => Math.max(largest, point.count), 0)

  return grouped.map((point) => ({
    ...point,
    granularity,
    heightPercent: maxCount === 0 ? 0 : Math.max(20, Math.round((point.count / maxCount) * 100)),
  }))
}

function aggregateByWeek(entries: { date: Date; count: number }[]) {
  const buckets = new Map<string, { weekStart: Date; count: number }>()

  for (const entry of entries) {
    const weekStart = startOfWeek(entry.date)
    const key = weekStart.toISOString()
    const current = buckets.get(key)

    buckets.set(key, {
      weekStart,
      count: (current?.count ?? 0) + entry.count,
    })
  }

  return [...buckets.values()]
    .sort((left, right) => left.weekStart.getTime() - right.weekStart.getTime())
    .map((bucket) => ({
      label: `Wk of ${formatMonthDay(bucket.weekStart.toISOString())}`,
      count: bucket.count,
    }))
}

export function buildCheckInInsights(
  checkIns: CheckInRecord[],
  viewMode: CheckInViewMode,
  emotionLibrary: EmotionConfig[],
) {
  if (checkIns.length === 0) {
    return []
  }

  if (viewMode === 'meeting') {
    const meetingGroups = groupCheckInsByMeeting(checkIns)
    const busiest = [...meetingGroups].sort((left, right) => right.records.length - left.records.length)[0]
    const broadestMix = [...meetingGroups].sort((left, right) => {
      const leftCount = new Set(left.records.map((record) => record.emotionKey)).size
      const rightCount = new Set(right.records.map((record) => record.emotionKey)).size

      if (rightCount !== leftCount) {
        return rightCount - leftCount
      }

      return right.records.length - left.records.length
    })[0]
    const mostRecent = [...meetingGroups].sort((left, right) => {
      const leftTimestamp = new Date(left.records[0]?.createdAt ?? 0).getTime()
      const rightTimestamp = new Date(right.records[0]?.createdAt ?? 0).getTime()
      return rightTimestamp - leftTimestamp
    })[0]
    const mixedEmotionCount = broadestMix
      ? new Set(broadestMix.records.map((record) => record.emotionKey)).size
      : 0
    const recentRecord = mostRecent?.records[0]

    return [
      {
        label: 'Highest-support meeting',
        value: busiest?.meeting.title ?? 'No data',
        detail: busiest ? `${busiest.records.length} support moments in this range` : '',
      },
      {
        label: 'Widest emotion mix',
        value: broadestMix?.meeting.title ?? 'No data',
        detail: broadestMix
          ? `${mixedEmotionCount} emotional states surfaced in this meeting`
          : '',
      },
      {
        label: 'Most recent support burst',
        value: mostRecent?.meeting.title ?? 'No data',
        detail: recentRecord ? `Latest moment landed on ${formatMonthDay(recentRecord.createdAt)}` : '',
      },
    ]
  }

  const emotionGroups = groupCheckInsByEmotion(checkIns, emotionLibrary)
  const topEmotion = emotionGroups[0]
  const topSpreadEmotion = [...emotionGroups].sort((left, right) => {
    const leftCount = new Set(left.records.map((record) => record.meetingId)).size
    const rightCount = new Set(right.records.map((record) => record.meetingId)).size

    if (rightCount !== leftCount) {
      return rightCount - leftCount
    }

    return right.records.length - left.records.length
  })[0]
  const mostRecentEmotion = [...emotionGroups].sort((left, right) => {
    const leftTimestamp = new Date(left.records[0]?.createdAt ?? 0).getTime()
    const rightTimestamp = new Date(right.records[0]?.createdAt ?? 0).getTime()
    return rightTimestamp - leftTimestamp
  })[0]
  const spreadMeetingCount = topSpreadEmotion
    ? new Set(topSpreadEmotion.records.map((record) => record.meetingId)).size
    : 0
  const latestEmotionRecord = mostRecentEmotion?.records[0]

  return [
    {
      label: 'Most repeated state',
      value: topEmotion?.emotion.chipLabel ?? 'No data',
      detail: topEmotion ? `${topEmotion.records.length} support moments in this range` : '',
    },
    {
      label: 'Across the most meetings',
      value: topSpreadEmotion?.emotion.chipLabel ?? 'No data',
      detail: topSpreadEmotion
        ? `${spreadMeetingCount} meetings surfaced this state`
        : '',
    },
    {
      label: 'Most recent pattern',
      value: mostRecentEmotion?.emotion.chipLabel ?? 'No data',
      detail: latestEmotionRecord
        ? `${latestEmotionRecord.meetingTitle} on ${formatMonthDay(latestEmotionRecord.createdAt)}`
        : '',
    },
  ]
}
