import { useEffect, useRef, useState, Fragment } from 'react'
import { getEmotionSummaryLabel } from '../data/emotions'
import { countRecordsByEmotion } from '../state/helpers'
import type { CheckInRecord, EmotionConfig, MeetingInfo } from '../types'
import { formatLongDate, formatShortTimestamp } from '../utils/formatting'

type MeetingGroupProps = {
  emotionLibrary: EmotionConfig[]
  meeting: MeetingInfo
  records: CheckInRecord[]
}

export function MeetingGroup({ emotionLibrary, meeting, records }: MeetingGroupProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const latestRecord = records[0]
  const emotionTotals = countRecordsByEmotion(records, emotionLibrary)
  const emotionMap = new Map(emotionLibrary.map((emotion) => [emotion.key, emotion]))

  const handleEmotionToggle = (emotionKey: string) => {
    setSelectedEmotions((prev) => {
      if (prev.includes(emotionKey)) {
        return prev.filter((k) => k !== emotionKey)
      } else {
        return [...prev, emotionKey]
      }
    })
  }

  // Filter records based on active selection (if empty, show all)
  const isFiltering = selectedEmotions.length > 0
  const filteredRecords = isFiltering
    ? records.filter((record) => selectedEmotions.includes(record.emotionKey))
    : records

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }

  // Set up horizontal scroll interactions and resize listeners
  useEffect(() => {
    if (!expanded) return

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

    // Small delay to ensure the DOM layout is fully rendered before measuring
    const timer = setTimeout(updateScrollState, 50)

    return () => {
      clearTimeout(timer)
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('scroll', updateScrollState)
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', updateScrollState)
      }
    }
  }, [expanded, filteredRecords.length])

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = 180 // Scroll roughly by one timeline item width (160px) + gap (20px)
    if (direction === 'left') {
      el.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <article className="meeting-group-card">
      <header className="meeting-group-header">
        <div>
          <p className="meeting-time-label">{latestRecord ? formatLongDate(latestRecord.createdAt) : meeting.startTime}</p>
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
        {emotionTotals.map((item) => {
          const isSelected = selectedEmotions.includes(item.emotion.key)
          const isDimmed = isFiltering && !isSelected

          return (
            <button
              type="button"
              className={`emotion-token ${isSelected ? 'active' : ''}`}
              data-color={item.emotion.colorToken}
              data-dimmed={isDimmed}
              aria-pressed={isSelected}
              onClick={() => {
                handleEmotionToggle(item.emotion.key)
                if (!expanded) {
                  setExpanded(true)
                }
              }}
              key={item.emotion.key}
            >
              <span className="emotion-token-dot" />
              <span className="emotion-token-label">{getEmotionSummaryLabel(item.emotion.chipLabel)}</span>
              <span className="emotion-token-count">{item.count}</span>
            </button>
          )
        })}
      </div>

      {expanded ? (
        <div className="horizontal-timeline-container">
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
            className="timeline-scroll-area"
          >
            <div className="timeline-scroll-track">
              {filteredRecords.length === 0 ? (
                <div className="empty-record">
                  {isFiltering ? 'No records match selected filters.' : 'No support moments in this meeting yet.'}
                </div>
              ) : (
                // Display in chronological order (left-to-right) with elastic spacing gaps
                (() => {
                  const sorted = [...filteredRecords].sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  )
                  return sorted.map((record, index) => {
                    const colorToken = emotionMap.get(record.emotionKey)?.colorToken
                    const prevRecord = index > 0 ? sorted[index - 1] : null

                    // Calculate time gap if there is a previous record
                    let gapInfo = null
                    if (prevRecord) {
                      const diffMs = new Date(record.createdAt).getTime() - new Date(prevRecord.createdAt).getTime()
                      const diffMins = Math.max(0, Math.floor(diffMs / 60000))
                      
                      if (diffMins <= 5) {
                        gapInfo = { width: '20px', isLarge: false, diffMins }
                      } else if (diffMins <= 15) {
                        const width = 20 + (diffMins - 5) * 4
                        gapInfo = { width: `${width}px`, isLarge: false, diffMins }
                      } else {
                        // Cap at 120px to prevent excessive scrolling
                        const width = Math.min(120, 60 + (diffMins - 15) * 2)
                        gapInfo = { width: `${width}px`, isLarge: true, diffMins }
                      }
                    }

                    const isFirst = index === 0
                    const isLast = index === sorted.length - 1

                    return (
                      <Fragment key={record.id}>
                        {gapInfo ? (
                          <div className="timeline-gap-spacer" style={{ width: gapInfo.width }} aria-hidden="true">
                            <div className={`timeline-gap-line ${gapInfo.isLarge ? 'dashed' : ''}`}>
                              {gapInfo.isLarge ? (
                                <span className="timeline-gap-label">+{gapInfo.diffMins} min</span>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        <div className="timeline-item">
                          {/* Timeline Dot Node */}
                          <div className="timeline-node">
                            <div 
                              className="timeline-node-line" 
                              style={{
                                left: isFirst ? '50%' : '0',
                                right: isLast ? '50%' : '0'
                              }}
                            />
                            <span className="timeline-axis-dot" data-color={colorToken} />
                            <span className="timeline-axis-connector" />
                          </div>

                          {/* Static non-clickable card */}
                          <div className="record-card" data-color={colorToken}>
                            <div className="record-chip" data-color={colorToken}>
                              <span className="emotion-token-dot" />
                              <strong>{record.emotionLabel}</strong>
                            </div>
                            <span className="record-card-time">
                              {formatShortTimestamp(record.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Fragment>
                    )
                  })
                })()
              )}
            </div>
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
      ) : null}
    </article>
  )
}
