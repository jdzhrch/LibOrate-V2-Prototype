import { useEffect, useState } from 'react'
import { sharedCommonHumanity } from '../data/emotions'
import { usePrototypeStore } from '../state/prototypeStore'
import type { EmotionConfig } from '../types'

type EmotionDraft = EmotionConfig & {
  kindnessPhrasesText: string
}

type NewEmotionDraft = {
  chipLabel: string
  commonHumanity: string
  kindnessPhrasesText: string
}

function buildFallbackPhrase(label: string) {
  if (label.toLowerCase().includes('rush')) {
    return 'I can slow this moment down.'
  }

  if (label.toLowerCase().includes('shame')) {
    return 'My dignity stays intact here.'
  }

  return 'I can stay with myself in this moment.'
}

function buildFallbackCommonHumanity() {
  return sharedCommonHumanity
}

function parsePhrases(text: string, chipLabel: string) {
  const phrases = text
    .split('\n')
    .map((phrase) => phrase.trim())
    .filter(Boolean)

  if (phrases.length > 0) {
    return phrases
  }

  return [buildFallbackPhrase(chipLabel)]
}

function buildDraftLibrary(emotionLibrary: EmotionConfig[]) {
  return emotionLibrary.map<EmotionDraft>((emotion) => ({
    ...emotion,
    kindnessPhrasesText: emotion.kindnessPhrases.join('\n'),
  }))
}

function buildEmotionKey(label: string, existingKeys: string[]) {
  const baseKey =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'custom-emotion'

  let candidate = baseKey
  let suffix = 2

  while (existingKeys.includes(candidate)) {
    candidate = `${baseKey}-${suffix}`
    suffix += 1
  }

  return candidate
}

function buildEmotionDraft({
  chipLabel,
  commonHumanity,
  kindnessPhrasesText,
}: NewEmotionDraft, existingKeys: string[]) {
  const trimmedLabel = chipLabel.trim()
  const phrases = parsePhrases(kindnessPhrasesText, trimmedLabel)

  return {
    key: buildEmotionKey(trimmedLabel, existingKeys),
    chipLabel: trimmedLabel,
    supportTitle: trimmedLabel,
    commonHumanity: commonHumanity.trim() || buildFallbackCommonHumanity(),
    kindnessPhrases: phrases,
    kindnessPhrasesText: phrases.join('\n'),
    isArchived: false,
  }
}

export function PhraseLibraryPanel() {
  const { emotionLibrary, saveSelfCompassionBreak } = usePrototypeStore()
  const [draftEmotions, setDraftEmotions] = useState(() => buildDraftLibrary(emotionLibrary))
  const [newEmotion, setNewEmotion] = useState<NewEmotionDraft>({
    chipLabel: '',
    commonHumanity: buildFallbackCommonHumanity(),
    kindnessPhrasesText: '',
  })

  useEffect(() => {
    setDraftEmotions(buildDraftLibrary(emotionLibrary))
  }, [emotionLibrary])

  const activeDrafts = draftEmotions.filter((emotion) => !emotion.isArchived)
  const archivedDrafts = draftEmotions.filter((emotion) => emotion.isArchived)

  function updateEmotion(key: string, patch: Partial<EmotionDraft>) {
    setDraftEmotions((current) =>
      current.map((emotion) => (emotion.key === key ? { ...emotion, ...patch } : emotion)),
    )
  }

  function handleAddEmotion() {
    const chipLabel = newEmotion.chipLabel.trim()

    if (!chipLabel) {
      return
    }

    setDraftEmotions((current) => [
      ...current,
      buildEmotionDraft(newEmotion, current.map((emotion) => emotion.key)),
    ])
    setNewEmotion({
      chipLabel: '',
      commonHumanity: buildFallbackCommonHumanity(),
      kindnessPhrasesText: '',
    })
  }

  function handleSave() {
    saveSelfCompassionBreak(
      draftEmotions.map((emotion) => ({
        key: emotion.key,
        chipLabel: emotion.chipLabel.trim() || 'Untitled emotion',
        supportTitle: emotion.chipLabel.trim() || emotion.supportTitle.trim() || 'Untitled emotion',
        commonHumanity: emotion.commonHumanity.trim() || buildFallbackCommonHumanity(),
        kindnessPhrases: parsePhrases(emotion.kindnessPhrasesText, emotion.chipLabel),
        isArchived: emotion.isArchived,
      })),
    )
  }

  return (
    <section className="surface-card web-panel-block break-panel">
      <div className="panel-header">
        <div>
          <p className="section-label">In-meeting support</p>
          <h2>Self-Compassion Break</h2>
          <p className="supporting-copy">
            Tune what appears in Zoom after each emotional check-in. Every emotion starts from the
            same common humanity note, and each card can be rewritten.
          </p>
        </div>
        <div className="break-metric-row">
          <div className="metric-pill">{activeDrafts.length} live</div>
          <div className="metric-pill">{archivedDrafts.length} archived</div>
        </div>
      </div>

      <div className="break-layout">
        <aside className="phrase-create-card break-create-card">
          <div className="phrase-section-header">
            <h3>Add emotion</h3>
          </div>
          <div className="break-preview-chip">
            <span>{newEmotion.chipLabel.trim() || 'New emotion'}</span>
          </div>
          <div className="phrase-editor-grid">
            <div>
              <label className="field-label" htmlFor="new-emotion-label">
                Label in Zoom
              </label>
              <input
                className="field-input"
                id="new-emotion-label"
                onChange={(event) =>
                  setNewEmotion((current) => ({
                    ...current,
                    chipLabel: event.target.value,
                  }))
                }
                type="text"
                value={newEmotion.chipLabel}
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
                  setNewEmotion((current) => ({
                    ...current,
                    commonHumanity: event.target.value,
                  }))
                }
                value={newEmotion.commonHumanity}
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
                  setNewEmotion((current) => ({
                    ...current,
                    kindnessPhrasesText: event.target.value,
                  }))
                }
                value={newEmotion.kindnessPhrasesText}
              />
            </div>
          </div>
          <div className="phrase-card-actions">
            <button className="secondary-pill" onClick={handleAddEmotion} type="button">
              Add emotion
            </button>
          </div>
        </aside>

        <div className="break-library-column">
          <div className="phrase-section-header">
            <h3>Live in Zoom</h3>
            <div className="break-chip-row" aria-hidden="true">
              {activeDrafts.map((emotion) => (
                <span className="break-mini-chip" data-emotion={emotion.key} key={emotion.key}>
                  {emotion.chipLabel}
                </span>
              ))}
            </div>
          </div>
          <div className="phrase-library-grid">
            {activeDrafts.map((emotion) => (
              <article className="phrase-editor-card" data-emotion={emotion.key} key={emotion.key}>
                <div className="phrase-card-topline">
                  <div className="phrase-card-identity">
                    <h3 className="break-preview-chip" data-emotion={emotion.key}>
                      {emotion.chipLabel}
                    </h3>
                  </div>
                  <button
                    className="secondary-pill secondary-pill-quiet"
                    disabled={activeDrafts.length <= 1}
                    onClick={() => updateEmotion(emotion.key, { isArchived: true })}
                    type="button"
                  >
                    Archive
                  </button>
                </div>

                <div className="phrase-editor-grid">
                  <div>
                    <label className="field-label" htmlFor={`${emotion.key}-label`}>
                      Label in Zoom
                    </label>
                    <input
                      className="field-input"
                      id={`${emotion.key}-label`}
                      onChange={(event) =>
                        updateEmotion(emotion.key, {
                          chipLabel: event.target.value,
                          supportTitle: event.target.value,
                        })
                      }
                      type="text"
                      value={emotion.chipLabel}
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
                        updateEmotion(emotion.key, {
                          commonHumanity: event.target.value,
                        })
                      }
                      value={emotion.commonHumanity}
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
                        updateEmotion(emotion.key, {
                          kindnessPhrasesText: event.target.value,
                        })
                      }
                      value={emotion.kindnessPhrasesText}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {archivedDrafts.length > 0 ? (
            <>
              <div className="phrase-section-header">
                <h3>Archived emotions</h3>
              </div>
              <div className="phrase-library-grid phrase-library-grid-archived">
                {archivedDrafts.map((emotion) => (
                  <article
                    className="phrase-editor-card phrase-editor-card-archived"
                    data-emotion={emotion.key}
                    key={emotion.key}
                  >
                    <div className="phrase-card-topline">
                      <div className="phrase-card-identity">
                        <h3 className="break-preview-chip" data-emotion={emotion.key}>
                          {emotion.chipLabel}
                        </h3>
                      </div>
                      <button
                        className="secondary-pill"
                        onClick={() => updateEmotion(emotion.key, { isArchived: false })}
                        type="button"
                      >
                        Restore
                      </button>
                    </div>
                    <p className="supporting-copy">{emotion.commonHumanity || sharedCommonHumanity}</p>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="letter-footer">
        <button className="primary-pill" onClick={handleSave} type="button">
          Save library
        </button>
      </div>
    </section>
  )
}
