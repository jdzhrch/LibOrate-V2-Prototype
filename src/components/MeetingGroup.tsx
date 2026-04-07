import { useState } from 'react'
import { getEmotionSummaryLabel } from '../data/emotions'
import { countRecordsByEmotion } from '../state/helpers'
import type { CheckInRecord, EmotionConfig, MeetingInfo } from '../types'
import { formatShortTimestamp } from '../utils/formatting'

type MeetingGroupProps = {
  emotionLibrary: EmotionConfig[]
  meeting: MeetingInfo
  records: CheckInRecord[]
}

export function MeetingGroup({ emotionLibrary, meeting, records }: MeetingGroupProps) {
  const [expanded, setExpanded] = useState(false)
  const latestRecord = records[0]
  const emotionTotals = countRecordsByEmotion(records, emotionLibrary)
  const emotionMap = new Map(emotionLibrary.map((emotion) => [emotion.key, emotion]))

  return (
    <article className="meeting-group-card">
      <header className="meeting-group-header">
        <div>
          <p className="meeting-time-label">{meeting.startTime}</p>
          <h3>{meeting.title}</h3>
        </div>
        <button
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${meeting.title}`}
          className="secondary-pill secondary-pill-quiet group-toggle-button"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </header>

      <div className="group-summary-row">
        <div className="meeting-summary-pill">
          {records.length === 0 ? 'No support moments yet' : `${records.length} support moments`}
        </div>
        <div className="meeting-summary-pill">
          {emotionTotals.length === 1 ? '1 emotional state' : `${emotionTotals.length} emotional states`}
        </div>
      </div>

      {latestRecord ? (
        <div className="latest-record-strip">
          <span>Most recent</span>
          <span>{latestRecord.emotionLabel}</span>
        </div>
      ) : null}

      <div className="emotion-token-row">
        {emotionTotals.map((item) => (
          <div className="emotion-token" data-color={item.emotion.colorToken} key={item.emotion.key}>
            <span className="emotion-token-dot" />
            <span className="emotion-token-label">{getEmotionSummaryLabel(item.emotion.chipLabel)}</span>
            <span className="emotion-token-count">{item.count}</span>
          </div>
        ))}
      </div>

      {expanded ? (
        <div className="record-list">
          {records.length === 0 ? (
            <div className="empty-record">No support moments in this meeting yet.</div>
          ) : (
            records.map((record) => (
              <article className="record-card" key={record.id}>
                <div
                  className="record-chip"
                  data-color={emotionMap.get(record.emotionKey)?.colorToken}
                >
                  <span className="emotion-token-dot" />
                  <strong>{record.emotionLabel}</strong>
                </div>
                <span>{formatShortTimestamp(record.createdAt)}</span>
              </article>
            ))
          )}
        </div>
      ) : null}
    </article>
  )
}
