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
  }

  return (
    <section className="surface-card letter-panel">
      <div className="panel-header">
        <div>
          <p className="section-label">Self-reflection</p>
          <h2>Letters</h2>
          <p className="supporting-copy">
            Write something steady, kind, and usable for the version of you who is carrying the
            next meeting.
          </p>
        </div>
        <div className="metric-pill">{letters.length} letters</div>
      </div>

      <div className="letters-stage">
        <section className="letter-workbench">
          <div className="letter-workbench-header">
            <div>
              <h3>Write a letter</h3>
              <p className="supporting-copy">Choose a reflection frame</p>
            </div>
          </div>

          <div className="letter-mode-grid" role="list" aria-label="Letter modes">
            {letterModes.map((entry) => (
              <button
                aria-label={entry.title}
                aria-pressed={entry.key === mode}
                className={entry.key === mode ? 'letter-mode-card letter-mode-card-active' : 'letter-mode-card'}
                key={entry.key}
                onClick={() => setMode(entry.key)}
                type="button"
              >
                <strong>{entry.title}</strong>
                <span>{entry.description}</span>
              </button>
            ))}
          </div>

          <section className="letter-form-card">
            <details className="letter-prompt-block letter-prompt-accordion">
              <summary className="letter-prompt-summary">
                <span className="letter-prompt-summary-text">
                  Don&rsquo;t know where to start? That&rsquo;s okay, try the gentle prompts below to guide you.
                </span>
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

            <div>
              <label className="field-label" htmlFor="letter-to-self">
                Your letter
              </label>
              <textarea
                className="letter-input"
                id="letter-to-self"
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write to yourself the way you would want support to sound before, during, or after the meeting."
                rows={10}
                value={body}
              />
            </div>

            <div className="letter-footer">
              <button className="primary-pill" onClick={handleSave} type="button">
                Save letter
              </button>
            </div>
          </section>
        </section>

        <aside className="letter-history-rail">
          <div className="letter-history-header">
            <div>
              <h3>Saved letters</h3>
              <p className="supporting-copy">Notes you can revisit whenever you need them.</p>
            </div>
            <div className="metric-pill">{letters.length} saved</div>
          </div>
          <div className="letter-list">
            {letters.map((letter) => {
              const linkedMeeting = meetings.find((meeting) => meeting.id === letter.linkedMeetingId)

              return (
                <article className="letter-entry-card" key={letter.id}>
                  <div className="record-meta">
                    <strong>{letter.title}</strong>
                    <span>{formatLongDate(letter.createdAt)}</span>
                  </div>
                  <p>{letter.body}</p>
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
        </aside>
      </div>
    </section>
  )
}
