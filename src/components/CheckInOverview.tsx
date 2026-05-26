import { useEffect, useRef, useState } from 'react'
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
  onViewModeChange: (mode: CheckInViewMode) => void
}

export function CheckInOverview({
  checkIns,
  emotionLibrary,
  viewMode,
  onViewModeChange,
}: CheckInOverviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('scroll', updateScrollState)

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateScrollState()
      })
      resizeObserver.observe(el)
    } else {
      window.addEventListener('resize', updateScrollState)
    }

    updateScrollState()

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('scroll', updateScrollState)
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', updateScrollState)
      }
    }
  }, [])

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = 210
    if (direction === 'left') {
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const emotionSnapshot = buildEmotionSnapshot(checkIns, emotionLibrary)
  const meetingSnapshot = buildMeetingSnapshot(checkIns, emotionLibrary)
  const timelinePoints = buildTimelinePoints(checkIns)
  const timelineMax = timelinePoints.reduce((largest, point) => Math.max(largest, point.count), 0)
  const timelineMidpoint = timelineMax <= 1 ? 1 : Math.ceil(timelineMax / 2)
  const timelineGranularity = timelinePoints[0]?.granularity ?? 'day'
  const timelineCaption =
    timelineGranularity === 'week' ? 'Weekly support moments' : 'Daily support moments'
  const timelineCountLabel =
    timelineGranularity === 'week'
      ? `${timelinePoints.length} weeks`
      : `${timelinePoints.length} days`
  const insights = buildCheckInInsights(checkIns, viewMode, emotionLibrary)

  if (checkIns.length === 0) {
    return null
  }

  return (
    <>
      <div className="history-visual-grid">
        <section className="analytics-card">
          <div className="analytics-header">
            <h3>{viewMode === 'meeting' ? 'Meeting pressure map' : 'Emotion pattern map'}</h3>
            <div className="analytics-header-actions">
              <div className="segmented-control" role="tablist" aria-label="Pattern views">
                <button
                  aria-selected={viewMode === 'meeting'}
                  className={viewMode === 'meeting' ? 'segment-button segment-button-active' : 'segment-button'}
                  onClick={() => onViewModeChange('meeting')}
                  role="tab"
                  type="button"
                >
                  Meetings
                </button>
                <button
                  aria-selected={viewMode === 'emotion'}
                  className={viewMode === 'emotion' ? 'segment-button segment-button-active' : 'segment-button'}
                  onClick={() => onViewModeChange('emotion')}
                  role="tab"
                  type="button"
                >
                  Emotions
                </button>
              </div>
            </div>
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
                      <div className="emotion-bar-fill" style={{ width: `${row.widthPercent}%` }}>
                        {row.distribution.map((segment) => (
                          <span
                            key={segment.emotion.key}
                            className="emotion-bar-segment"
                            data-color={segment.emotion.colorToken}
                            style={{ width: `${(segment.count / row.count) * 100}%` }}
                            title={`${segment.emotion.chipLabel}: ${segment.count}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="emotion-snapshot-count">{row.count}</span>
                  </div>
                ))
              : emotionSnapshot.map((row) => (
                  <div
                    className="emotion-snapshot-row"
                    data-color={row.emotion.colorToken}
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
            <span>{timelineCountLabel}</span>
          </div>
          <p className="timeline-caption">{timelineCaption}</p>
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
              <button
                type="button"
                className="timeline-scroll-btn timeline-scroll-btn-left"
                data-visible={canScrollLeft ? 'true' : 'false'}
                aria-label="Scroll timeline left"
                onClick={() => handleScroll('left')}
              >
                ‹
              </button>
              <div
                ref={scrollRef}
                className="timeline-strip"
                tabIndex={0}
                role="region"
                aria-label="Support timeline detail scroll"
              >
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
              <button
                type="button"
                className="timeline-scroll-btn timeline-scroll-btn-right"
                data-visible={canScrollRight ? 'true' : 'false'}
                aria-label="Scroll timeline right"
                onClick={() => handleScroll('right')}
              >
                ›
              </button>
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
