import { useMemo, useState } from 'react'
import { usePrototypeStore } from '../state/prototypeStore'
import type { CheckInRecord } from '../types'

export function ZoomCheckInPanel() {
  const { activeEmotions, addCheckIn, checkIns, currentMeeting } = usePrototypeStore()
  const [lastRecord, setLastRecord] = useState<CheckInRecord | null>(null)
  const [selectedEmotionKey, setSelectedEmotionKey] = useState<string | null>(null)

  const meetingEmotionCounts = useMemo(() => {
    const counts = new Map<string, number>()

    for (const checkIn of checkIns) {
      if (checkIn.meetingId !== currentMeeting.id) {
        continue
      }

      counts.set(checkIn.emotionKey, (counts.get(checkIn.emotionKey) ?? 0) + 1)
    }

    return counts
  }, [checkIns, currentMeeting.id])
  const activeRecord = lastRecord?.meetingId === currentMeeting.id ? lastRecord : null
  const activeSelectedEmotionKey =
    activeRecord && selectedEmotionKey ? selectedEmotionKey : null
  const activeEmotion =
    activeEmotions.find((emotion) => emotion.key === activeSelectedEmotionKey) ?? null

  function handleCheckIn(emotionKey: string) {
    const record = addCheckIn(emotionKey)
    setSelectedEmotionKey(emotionKey)
    setLastRecord(record)
  }

  return (
    <div className="zoom-checkin-stack">
      <section
        aria-label="Emotions and thoughts"
        data-color={activeEmotion?.colorToken}
        className="surface-card zoom-checkin-card zoom-card-emotions"
      >
        <p className="zoom-card-eyebrow">Tap how you feel</p>
        <div className="chip-grid" role="list" aria-label="Emotional check-in options">
          {activeEmotions.map((emotion) => (
            <button
              key={emotion.key}
              aria-pressed={activeSelectedEmotionKey === emotion.key}
              data-color={emotion.colorToken}
              data-meeting-count={meetingEmotionCounts.get(emotion.key) ?? undefined}
              className={
                activeSelectedEmotionKey === emotion.key
                  ? 'emotion-chip emotion-chip-active'
                  : 'emotion-chip'
              }
              onClick={() => handleCheckIn(emotion.key)}
              type="button"
            >
              <span>{emotion.chipLabel}</span>
              {meetingEmotionCounts.get(emotion.key) ? (
                <span aria-hidden="true" className="emotion-chip-count">
                  {meetingEmotionCounts.get(emotion.key)}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      {activeRecord ? (
        <>
          <section
            aria-label="Common humanity"
            data-state="active"
            data-color={activeEmotion?.colorToken}
            className="surface-card zoom-checkin-card zoom-card-common-humanity zoom-checkin-card-live zoom-checkin-card-revealed"
          >
            <p className="zoom-card-eyebrow">Common Humanity</p>
            <div className="zoom-note-shell">
              <p className="zoom-card-body">{activeRecord.commonHumanity}</p>
            </div>
          </section>
 
          <section
            aria-label="Self-kindness"
            data-state="active"
            data-color={activeEmotion?.colorToken}
            className="surface-card zoom-checkin-card zoom-card-self-kindness zoom-checkin-card-live zoom-checkin-card-revealed"
          >
            <p className="zoom-card-eyebrow">Self-Kindness</p>
            <div className="zoom-kindness-stage">
              <p className="zoom-card-body">{activeRecord.kindnessPhrase}</p>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
