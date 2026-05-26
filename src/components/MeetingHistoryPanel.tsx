import { useState } from 'react'
import type { CheckInDateFilterMode } from '../types'
import { usePrototypeStore } from '../state/prototypeStore'
import {
  filterCheckInsByDateRange,
  groupCheckInsByEmotion,
  groupCheckInsByMeeting,
} from '../state/helpers'
import { CheckInOverview } from './CheckInOverview'
import { EmotionGroup } from './EmotionGroup'
import { MeetingGroup } from './MeetingGroup'

export function MeetingHistoryPanel() {
  const { checkIns, emotionLibrary } = usePrototypeStore()
  const [viewMode, setViewMode] = useState<'meeting' | 'emotion'>('meeting')
  const [filterMode, setFilterMode] = useState<CheckInDateFilterMode>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filteredCheckIns = filterCheckInsByDateRange(checkIns, {
    mode: filterMode,
    startDate,
    endDate,
  })
  const groups = groupCheckInsByMeeting(filteredCheckIns)
  const emotionGroups = groupCheckInsByEmotion(filteredCheckIns, emotionLibrary)
  const hasResults = viewMode === 'meeting' ? groups.length > 0 : emotionGroups.length > 0

  function handlePresetChange(nextMode: CheckInDateFilterMode) {
    setFilterMode(nextMode)
  }

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all prototype data to default seed data?')) {
      window.localStorage.removeItem('liborate-prototype-state-v4')
      window.location.reload()
    }
  }

  return (
    <section className="surface-card web-panel-block patterns-panel" data-view-mode={viewMode}>
      <div className="panel-header">
        <div>
          <h2>Patterns</h2>
        </div>
        <button
          className="secondary-pill secondary-pill-quiet reset-data-btn"
          onClick={handleResetData}
          type="button"
        >
          Reset Demo Data
        </button>
      </div>

      <div className="history-toolbar">

        <div className="filter-row" role="group" aria-label="Date filters">
          <button
            className={filterMode === 'last-7-days' ? 'filter-pill filter-pill-active' : 'filter-pill'}
            onClick={() => handlePresetChange('last-7-days')}
            type="button"
          >
            7 days
          </button>
          <button
            className={filterMode === 'last-30-days' ? 'filter-pill filter-pill-active' : 'filter-pill'}
            onClick={() => handlePresetChange('last-30-days')}
            type="button"
          >
            30 days
          </button>
          <button
            className={filterMode === 'all' ? 'filter-pill filter-pill-active' : 'filter-pill'}
            onClick={() => handlePresetChange('all')}
            type="button"
          >
            All
          </button>
          <button
            className={filterMode === 'custom' ? 'filter-pill filter-pill-active' : 'filter-pill'}
            onClick={() => handlePresetChange('custom')}
            type="button"
          >
            Custom
          </button>

          {filterMode === 'custom' ? (
            <div className="custom-date-inline-group">
              <label className="sr-only" htmlFor="start-date">
                Start date
              </label>
              <input
                className="field-input custom-date-input"
                id="start-date"
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                value={startDate}
              />
              <span className="custom-date-separator">to</span>
              <label className="sr-only" htmlFor="end-date">
                End date
              </label>
              <input
                className="field-input custom-date-input"
                id="end-date"
                onChange={(event) => setEndDate(event.target.value)}
                type="date"
                value={endDate}
              />
            </div>
          ) : null}
        </div>
      </div>

      <CheckInOverview
        checkIns={filteredCheckIns}
        emotionLibrary={emotionLibrary}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="meeting-group-list">
        {!hasResults ? <div className="empty-record">No support moments in this range yet.</div> : null}

        {viewMode === 'meeting'
          ? groups.map((group) => (
              <MeetingGroup
                key={group.meeting.id}
                emotionLibrary={emotionLibrary}
                meeting={group.meeting}
                records={group.records}
              />
            ))
          : emotionGroups.map((group) => (
              <EmotionGroup key={group.emotion.key} emotion={group.emotion} records={group.records} />
            ))}
      </div>
    </section>
  )
}
