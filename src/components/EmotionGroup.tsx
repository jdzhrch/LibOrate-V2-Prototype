import { useState } from 'react'
import type { CheckInRecord, EmotionConfig } from '../types'
import { formatShortTimestamp } from '../utils/formatting'

type EmotionGroupProps = {
  emotion: EmotionConfig
  records: CheckInRecord[]
}

export function EmotionGroup({ emotion, records }: EmotionGroupProps) {
  const [expanded, setExpanded] = useState(false)
  const meetingCount = new Set(records.map((record) => record.meetingId)).size

  return (
    <article className="meeting-group-card">
      <header className="meeting-group-header">
        <div>
          <h3>{emotion.chipLabel}</h3>
        </div>
        <button
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${emotion.chipLabel}`}
          className="secondary-pill secondary-pill-quiet group-toggle-button"
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </header>

      <div className="group-summary-row">
        <div className="meeting-summary-pill">
          {meetingCount} {meetingCount === 1 ? 'meeting' : 'meetings'}
        </div>
        <div className="meeting-summary-pill">
          {records.length === 1 ? '1 support moment' : `${records.length} support moments`}
        </div>
      </div>

      {expanded ? (
        <div className="record-list">
          {records.length === 0 ? (
            <div className="empty-record">No records yet.</div>
          ) : (
            records.map((record) => (
              <article className="record-card" key={record.id}>
                <div className="record-chip" data-emotion={emotion.key}>
                  <span className="emotion-token-dot" />
                  <strong>{record.meetingTitle}</strong>
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
