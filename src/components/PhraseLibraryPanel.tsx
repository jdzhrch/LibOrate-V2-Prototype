import { useState } from 'react'
import { sharedCommonHumanity } from '../data/emotions'
import { usePrototypeStore } from '../state/prototypeStore'
import type { EmotionConfig } from '../types'

type Draft = {
  chipLabel: string
  commonHumanity: string
  kindnessPhrasesText: string
}

function emotionToDraft(emotion: EmotionConfig): Draft {
  return {
    chipLabel: emotion.chipLabel,
    commonHumanity: emotion.commonHumanity,
    kindnessPhrasesText: emotion.kindnessPhrases.join('\n'),
  }
}

function parsePhrasesText(text: string) {
  return text
    .split('\n')
    .map((phrase) => phrase.trim())
    .filter(Boolean)
}

function isDraftEqual(a: Draft, b: Draft) {
  return (
    a.chipLabel === b.chipLabel &&
    a.commonHumanity === b.commonHumanity &&
    a.kindnessPhrasesText === b.kindnessPhrasesText
  )
}

type PhraseEditorCardProps = {
  emotion: EmotionConfig
  canHide: boolean
}

function PhraseEditorCard({ emotion, canHide }: PhraseEditorCardProps) {
  const { saveEmotion, setEmotionArchived } = usePrototypeStore()
  const baseDraft = emotionToDraft(emotion)
  const [draft, setDraft] = useState<Draft>(baseDraft)
  const [isOpen, setIsOpen] = useState(false)

  const isDirty = !isDraftEqual(draft, baseDraft)

  function handleSave() {
    saveEmotion(emotion.key, {
      chipLabel: draft.chipLabel,
      commonHumanity: draft.commonHumanity,
      kindnessPhrases: parsePhrasesText(draft.kindnessPhrasesText),
    })
  }

  return (
    <article
      className={
        isOpen ? 'phrase-editor-card phrase-editor-card-open' : 'phrase-editor-card'
      }
      data-color={emotion.colorToken}
    >
      <div className="phrase-card-topline">
        <h3 className="break-preview-chip" data-color={emotion.colorToken}>
          {emotion.chipLabel}
        </h3>
        <div className="phrase-card-actions">
          <button
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Edit'} ${emotion.chipLabel}`}
            className="secondary-pill secondary-pill-quiet"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            {isOpen ? 'Done' : 'Edit'}
          </button>
          <button
            className="secondary-pill secondary-pill-quiet"
            disabled={!canHide}
            onClick={() => setEmotionArchived(emotion.key, true)}
            type="button"
          >
            Hide
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <div className="phrase-editor-grid">
            <div>
              <label className="field-label" htmlFor={`${emotion.key}-label`}>
                Emotion label
              </label>
              <input
                className="field-input"
                id={`${emotion.key}-label`}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, chipLabel: event.target.value }))
                }
                type="text"
                value={draft.chipLabel}
              />
            </div>
            <div>
              <label className="field-label" htmlFor={`${emotion.key}-humanity`}>
                Common humanity
              </label>
              <textarea
                className="letter-input phrase-humanity-textarea"
                id={`${emotion.key}-humanity`}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, commonHumanity: event.target.value }))
                }
                value={draft.commonHumanity}
              />
            </div>
            <div>
              <label className="field-label" htmlFor={`${emotion.key}-phrases`}>
                Self-kindness
              </label>
              <textarea
                className="letter-input phrase-textarea"
                id={`${emotion.key}-phrases`}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    kindnessPhrasesText: event.target.value,
                  }))
                }
                value={draft.kindnessPhrasesText}
              />
            </div>
          </div>

          <div className="phrase-card-footer">
            <button
              className="primary-pill"
              disabled={!isDirty}
              onClick={handleSave}
              type="button"
            >
              Save changes
            </button>
          </div>
        </>
      ) : null}
    </article>
  )
}

type AddEmotionCardProps = {
  onAdd: (input: { chipLabel: string; commonHumanity: string; kindnessPhrases: string[] }) => void
}

function AddEmotionCard({ onAdd }: AddEmotionCardProps) {
  const [draft, setDraft] = useState<Draft>({
    chipLabel: '',
    commonHumanity: sharedCommonHumanity,
    kindnessPhrasesText: '',
  })

  function handleAdd() {
    if (!draft.chipLabel.trim()) {
      return
    }

    onAdd({
      chipLabel: draft.chipLabel,
      commonHumanity: draft.commonHumanity,
      kindnessPhrases: parsePhrasesText(draft.kindnessPhrasesText),
    })
    setDraft({
      chipLabel: '',
      commonHumanity: sharedCommonHumanity,
      kindnessPhrasesText: '',
    })
  }

  return (
    <article className="phrase-create-card">
      <div className="phrase-card-topline">
        <h3 className="phrase-section-title">Add emotion</h3>
      </div>
      <div className="phrase-editor-grid">
        <div>
          <label className="field-label" htmlFor="new-emotion-label">
            Emotion label
          </label>
          <input
            className="field-input"
            id="new-emotion-label"
            onChange={(event) =>
              setDraft((current) => ({ ...current, chipLabel: event.target.value }))
            }
            type="text"
            value={draft.chipLabel}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="new-common-humanity">
            Common humanity
          </label>
          <textarea
            className="letter-input phrase-humanity-textarea"
            id="new-common-humanity"
            onChange={(event) =>
              setDraft((current) => ({ ...current, commonHumanity: event.target.value }))
            }
            value={draft.commonHumanity}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="new-kindness-phrases">
            Self-kindness
          </label>
          <textarea
            className="letter-input phrase-textarea"
            id="new-kindness-phrases"
            onChange={(event) =>
              setDraft((current) => ({ ...current, kindnessPhrasesText: event.target.value }))
            }
            value={draft.kindnessPhrasesText}
          />
        </div>
      </div>
      <div className="phrase-card-footer">
        <button className="primary-pill" onClick={handleAdd} type="button">
          Add emotion
        </button>
      </div>
    </article>
  )
}

export function PhraseLibraryPanel() {
  const { emotionLibrary, addEmotion, setEmotionArchived } = usePrototypeStore()

  const activeEmotions = emotionLibrary.filter((emotion) => !emotion.isArchived)
  const archivedEmotions = emotionLibrary.filter((emotion) => emotion.isArchived)

  return (
    <section className="surface-card letter-panel break-panel">
      <header className="panel-header">
        <div>
          <p className="section-label">In-meeting support</p>
          <h2>Emotions setting</h2>
          <p className="supporting-copy">
            Shape the support people see after each emotional check-in. Every emotion starts from
            the same common humanity note, and each card can be rewritten.
          </p>
        </div>
        <div className="metric-pill">{activeEmotions.length} available</div>
      </header>

      <div className="phrase-available-header">
        <h3>Available in meetings</h3>
        <div className="break-chip-row" aria-hidden="true">
          {activeEmotions.map((emotion) => (
            <span className="break-mini-chip" data-color={emotion.colorToken} key={emotion.key}>
              {emotion.chipLabel}
            </span>
          ))}
        </div>
      </div>

      <div className="phrase-library-grid">
        {activeEmotions.map((emotion) => (
          <PhraseEditorCard
            canHide={activeEmotions.length > 1}
            emotion={emotion}
            key={emotion.key}
          />
        ))}
      </div>

      <AddEmotionCard onAdd={addEmotion} />

      <details className="panel-drawer break-archive-drawer">
        <summary className="panel-drawer-summary">
          <div className="letter-history-header">
            <div>
              <h3>Hidden emotions</h3>
              <p className="supporting-copy">
                These stay out of the list until you want them back.
              </p>
            </div>
            <div className="metric-pill">{archivedEmotions.length} hidden</div>
          </div>
          <span aria-hidden="true" className="panel-drawer-icon" />
        </summary>
        <div className="letter-list">
          {archivedEmotions.length === 0 ? (
            <p className="supporting-copy">No hidden emotions.</p>
          ) : (
            archivedEmotions.map((emotion) => (
              <article
                className="phrase-editor-card phrase-editor-card-archived"
                data-color={emotion.colorToken}
                key={emotion.key}
              >
                <div className="phrase-card-topline">
                  <h3 className="break-preview-chip" data-color={emotion.colorToken}>
                    {emotion.chipLabel}
                  </h3>
                  <button
                    className="secondary-pill"
                    onClick={() => setEmotionArchived(emotion.key, false)}
                    type="button"
                  >
                    Show again
                  </button>
                </div>
                <p className="supporting-copy">{emotion.commonHumanity || sharedCommonHumanity}</p>
              </article>
            ))
          )}
        </div>
      </details>
    </section>
  )
}
