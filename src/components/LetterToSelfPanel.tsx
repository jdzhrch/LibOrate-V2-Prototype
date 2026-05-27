import { useState } from 'react'
import { getLetterMode, letterModes } from '../data/letterPrompts'
import { meetings } from '../data/meetings'
import { usePrototypeStore } from '../state/prototypeStore'
import type { LetterModeKey } from '../types'
import { formatLongDate } from '../utils/formatting'

export function LetterToSelfPanel() {
  const { letters, addLetter } = usePrototypeStore()
  const [mode, setMode] = useState<LetterModeKey>('before-next-meeting')
  const [title, setTitle] = useState('')
  const [linkedMeetingId, setLinkedMeetingId] = useState<string>('')
  const [body, setBody] = useState('')
  const selectedMode = getLetterMode(mode)

  const [isWriting, setIsWriting] = useState(false)

  function handleSave() {
    if (!title.trim() || !body.trim()) {
      return
    }

    addLetter({
      title: title.trim(),
      body: body.trim(),
      mode,
      linkedMeetingId: linkedMeetingId || null,
    })

    setTitle('')
    setLinkedMeetingId('')
    setBody('')
    setIsWriting(false)
  }

  return (
    <section className="letter-panel">
      <header className="panel-header">
        <div>
          <p className="section-label">Self-reflection</p>
          <h2>Letters</h2>
          <p className="supporting-copy">
            Write gentle notes to support yourself before or after difficult meetings.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="secondary-pill secondary-pill-quiet write-letter-trigger-btn"
            onClick={() => setIsWriting(true)}
          >
            Write a letter
          </button>
        </div>
      </header>

      <div className="letter-list-container">
        <div className="letter-list-header">
          <h3>Saved letters</h3>
        </div>

        {letters.length === 0 ? (
          <div className="empty-record">No saved letters yet. Click "Write a letter" to begin.</div>
        ) : (
          <div className="letter-list">
            {letters.map((letter) => {
              const linkedMeeting = meetings.find((meeting) => meeting.id === letter.linkedMeetingId)

              return (
                <article className="letter-entry-card" key={letter.id}>
                  <div className="record-meta">
                    <strong>{letter.title}</strong>
                    <span>{formatLongDate(letter.createdAt)}</span>
                  </div>
                  <p className="letter-body-preview">{letter.body}</p>
                  <div className="letter-badges">
                    <span className="meeting-summary-pill">{getLetterMode(letter.mode).title}</span>
                    <span className="meeting-summary-pill">
                      {linkedMeeting ? linkedMeeting.title : 'Not tied to a meeting'}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Slide-out Overlay Drawer for Writing a Letter */}
      <div className={`slideout-overlay ${isWriting ? 'is-open' : ''}`} onClick={() => setIsWriting(false)}>
        <div className="modal-dialog letter-form-card" onClick={(e) => e.stopPropagation()}>
          <header className="slideout-header">
            <div>
              <h3>Write a letter</h3>
              <p className="supporting-copy">Choose a reflection frame</p>
            </div>
            <button
              type="button"
              className="close-slideout-btn"
              aria-label="Close writing drawer"
              onClick={() => setIsWriting(false)}
            >
              ×
            </button>
          </header>

          <div className="slideout-body">
            <div
              className="segmented-control letter-mode-row"
              role="group"
              aria-label="Letter modes"
            >
              {letterModes.map((entry) => (
                <button
                  aria-pressed={entry.key === mode}
                  className={
                    entry.key === mode ? 'segment-button segment-button-active' : 'segment-button'
                  }
                  key={entry.key}
                  onClick={() => setMode(entry.key)}
                  type="button"
                >
                  {entry.title}
                </button>
              ))}
            </div>

            <div className="letter-form-grid">
              <div>
                <label className="field-label" htmlFor="letter-title">
                  Letter title
                </label>
                <input
                  className="field-input"
                  id="letter-title"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What do you want to remember?"
                  value={title}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="letter-meeting-link">
                  Related meeting
                </label>
                <select
                  aria-label="Related meeting"
                  className="field-input"
                  id="letter-meeting-link"
                  onChange={(event) => setLinkedMeetingId(event.target.value)}
                  value={linkedMeetingId}
                >
                  <option value="">Not tied to a meeting</option>
                  {meetings.map((meeting) => (
                    <option key={meeting.id} value={meeting.id}>
                      {meeting.title}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            <div className="letter-body-field">
              <div className="letter-body-label-row">
                <label className="field-label" htmlFor="letter-to-self">
                  Your letter
                </label>
              </div>

              <details className="letter-prompt-accordion">
                <summary className="letter-prompt-summary">
                  <span className="letter-prompt-summary-text">Need a prompt?</span>
                  <span aria-hidden="true" className="letter-prompt-summary-icon" />
                </summary>
                <div className="prompt-row">
                  {selectedMode.prompts.map((prompt, index) => (
                    <div className="prompt-pill" key={prompt}>
                      <span className="prompt-index">{index + 1}</span>
                      <span>{prompt}</span>
                    </div>
                  ))}
                </div>
              </details>

              <textarea
                className="letter-input"
                id="letter-to-self"
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write to yourself the way you would want support to sound before, during, or after the meeting."
                rows={8}
                value={body}
              />
            </div>
          </div>

          <footer className="slideout-footer">
            <button
              type="button"
              className="secondary-pill"
              onClick={() => setIsWriting(false)}
            >
              Cancel
            </button>
            <button
              className="primary-pill"
              onClick={handleSave}
              type="button"
              disabled={!title.trim() || !body.trim()}
            >
              Save letter
            </button>
          </footer>
        </div>
      </div>
    </section>
  )
}
