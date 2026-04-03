import {
  buildCheckInInsights,
  buildEmotionSnapshot,
  buildMeetingSnapshot,
  buildTimelinePoints,
} from '../state/helpers'
import type { CheckInRecord, CheckInViewMode, EmotionConfig } from '../types'

type CheckInOverviewProps = {
  checkIns: CheckInRecord[]
  emotionLibrary: EmotionConfig[]
  viewMode: CheckInViewMode
}

export function CheckInOverview({
  checkIns,
  emotionLibrary,
  viewMode,
}: CheckInOverviewProps) {
  const emotionSnapshot = buildEmotionSnapshot(checkIns, emotionLibrary)
  const meetingSnapshot = buildMeetingSnapshot(checkIns)
  const timelinePoints = buildTimelinePoints(checkIns)
  const timelineMax = timelinePoints.reduce((largest, point) => Math.max(largest, point.count), 0)
  const timelineMidpoint = timelineMax <= 1 ? 1 : Math.ceil(timelineMax / 2)
  const insights = buildCheckInInsights(checkIns, viewMode, emotionLibrary)
  const snapshotCountLabel =
    viewMode === 'meeting'
      ? `${meetingSnapshot.length} ${meetingSnapshot.length === 1 ? 'meeting' : 'meetings'}`
      : `${emotionSnapshot.length} ${emotionSnapshot.length === 1 ? 'state' : 'states'}`

  if (checkIns.length === 0) {
    return null
  }

  return (
    <>
      <div className="history-visual-grid">
        <section className="analytics-card">
          <div className="analytics-header">
            <h3>{viewMode === 'meeting' ? 'Meeting pressure map' : 'Emotion pattern map'}</h3>
            <span>{snapshotCountLabel}</span>
          </div>
          <div className="emotion-snapshot-list">
            {viewMode === 'meeting'
              ? meetingSnapshot.map((row) => (
                  <div className="emotion-snapshot-row meeting-snapshot-row" key={row.key}>
                    <div className="emotion-snapshot-copy">
                      <strong>{row.label}</strong>
                      <span>{row.emotionCount} emotions</span>
                    </div>
                    <div className="emotion-bar-track" aria-hidden="true">
                      <span className="emotion-bar-fill" style={{ width: `${row.widthPercent}%` }} />
                    </div>
                    <span className="emotion-snapshot-count">{row.count}</span>
                  </div>
                ))
              : emotionSnapshot.map((row) => (
                  <div
                    className="emotion-snapshot-row"
                    data-emotion={row.emotion.key}
                    key={row.emotion.key}
                  >
                    <div className="emotion-snapshot-copy">
                      <strong>{row.emotion.chipLabel}</strong>
                      <span>{row.meetingCount} meetings</span>
                    </div>
                    <div className="emotion-bar-track" aria-hidden="true">
                      <span className="emotion-bar-fill" style={{ width: `${row.widthPercent}%` }} />
                    </div>
                    <span className="emotion-snapshot-count">{row.count}</span>
                  </div>
                ))}
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-header">
            <h3>Support timeline</h3>
            <span>{timelinePoints.length} days</span>
          </div>
          <p className="timeline-caption">Daily support moments</p>
          <div className="timeline-chart" role="img" aria-label="Support timeline bar chart">
            <div aria-hidden="true" className="timeline-scale">
              <span>{timelineMax}</span>
              <span>{timelineMidpoint}</span>
              <span>0</span>
            </div>
            <div className="timeline-plot">
              <div aria-hidden="true" className="timeline-gridlines">
                <span />
                <span />
                <span />
              </div>
              <div className="timeline-strip">
                {timelinePoints.map((point) => (
                  <div className="timeline-column" key={point.label}>
                    <strong className="timeline-value">{point.count}</strong>
                    <div className="timeline-bar-slot" aria-hidden="true">
                      <span className="timeline-bar" style={{ height: `${point.heightPercent}%` }} />
                    </div>
                    <span className="timeline-label">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="analytics-card analytics-card-full">
        <div className="analytics-header">
          <h3>What stands out</h3>
        </div>
        <div className="insight-grid">
          {insights.map((insight) => (
            <article className="insight-card" key={insight.label}>
              <span className="insight-label">{insight.label}</span>
              <strong>{insight.value}</strong>
              <p>{insight.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
