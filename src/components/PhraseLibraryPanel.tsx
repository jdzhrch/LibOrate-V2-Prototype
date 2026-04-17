import { useEffect, useState } from 'react'
import { getEmotionColorToken, sharedCommonHumanity } from '../data/emotions'
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
}: NewEmotionDraft, existingEmotions: EmotionConfig[]) {
  const trimmedLabel = chipLabel.trim()
  const phrases = parsePhrases(kindnessPhrasesText, trimmedLabel)
  const key = buildEmotionKey(
    trimmedLabel,
    existingEmotions.map((emotion) => emotion.key),
  )

  return {
    key,
    chipLabel: trimmedLabel,
    supportTitle: trimmedLabel,
    commonHumanity: commonHumanity.trim() || buildFallbackCommonHumanity(),
    kindnessPhrases: phrases,
    kindnessPhrasesText: phrases.join('\n'),
    isArchived: false,
    colorToken: getEmotionColorToken(
      key,
      undefined,
      existingEmotions
        .map((emotion) => emotion.colorToken)
        .filter((token): token is NonNullable<EmotionConfig['colorToken']> => Boolean(token)),
    ),
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
  const newEmotionColorToken = getEmotionColorToken(
    'custom-emotion',
    undefined,
    draftEmotions
      .map((emotion) => emotion.colorToken)
      .filter((token): token is NonNullable<EmotionConfig['colorToken']> => Boolean(token)),
  )

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
      buildEmotionDraft(newEmotion, current),
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
        colorToken: emotion.colorToken,
      })),
    )
  }

  return (
    <section className="surface-card letter-panel break-panel">
      <div className="panel-header">
        <div>
          <p className="section-label">In-meeting support</p>
          <h2>Self-Compassion Break</h2>
          <p className="supporting-copy">
            Shape the support people see after each emotional check-in. Every emotion starts from
            the same common humanity note, and each card can be rewritten.
          </p>
        </div>
        <div className="metric-pill">{activeDrafts.length} available</div>
      </div>

      <div className="letters-stage break-stage">
        <section className="letter-workbench break-workbench">
          <div className="letter-workbench-header">
            <div>
              <p className="supporting-copy">
                Pick a label, a steady note of common humanity, and a few self-kindness phrases.
              </p>
            </div>
          </div>

          <article className="phrase-create-card letter-form-card">
            <div className="phrase-card-topline">
              <h3 className="phrase-section-title">Add emotion</h3>
            </div>
            <div className="break-preview-stage" data-color={newEmotionColorToken}>
              <span className="break-preview-eyebrow">Preview</span>
              <div
                className="break-preview-chip break-preview-chip-hero"
                data-color={newEmotionColorToken}
              >
                <span>{newEmotion.chipLabel.trim() || 'New label'}</span>
              </div>
              <p className="supporting-copy break-preview-note">
                This is how it will appear during a meeting.
              </p>
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
            <div className="letter-footer">
              <button className="primary-pill" onClick={handleAddEmotion} type="button">
                Add emotion
              </button>
            </div>
          </article>

          <div className="letter-workbench-header">
            <div>
              <h3>Available in meetings</h3>
              <p className="supporting-copy">These are the emotions people can choose during a meeting.</p>
            </div>
            <div className="break-chip-row" aria-hidden="true">
              {activeDrafts.map((emotion) => (
                <span className="break-mini-chip" data-color={emotion.colorToken} key={emotion.key}>
                  {emotion.chipLabel}
                </span>
              ))}
            </div>
          </div>

          <div className="phrase-library-grid">
            {activeDrafts.map((emotion) => (
              <article
                className="phrase-editor-card letter-form-card"
                data-color={emotion.colorToken}
                key={emotion.key}
              >
                <div className="phrase-card-topline">
                  <div className="phrase-card-identity">
                    <h3 className="break-preview-chip" data-color={emotion.colorToken}>
                      {emotion.chipLabel}
                    </h3>
                  </div>
                  <button
                    className="secondary-pill secondary-pill-quiet"
                    disabled={activeDrafts.length <= 1}
                    onClick={() => updateEmotion(emotion.key, { isArchived: true })}
                    type="button"
                  >
                    Hide
                  </button>
                </div>

                <div className="phrase-editor-grid">
                  <div>
                    <label className="field-label" htmlFor={`${emotion.key}-label`}>
                      Emotion label
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

          <div className="letter-footer">
            <button className="primary-pill" onClick={handleSave} type="button">
              Save changes
            </button>
          </div>
        </section>

        <aside className="letter-history-rail break-archive-rail">
          <div className="letter-history-header">
            <div>
              <h3>Hidden emotions</h3>
              <p className="supporting-copy">These stay out of the list until you want them back.</p>
            </div>
            <div className="metric-pill">{archivedDrafts.length} hidden</div>
          </div>
          <div className="letter-list">
            {archivedDrafts.length === 0 ? (
              <p className="supporting-copy">No hidden emotions.</p>
            ) : (
              archivedDrafts.map((emotion) => (
                <article
                  className="phrase-editor-card phrase-editor-card-archived"
                  data-color={emotion.colorToken}
                  key={emotion.key}
                >
                  <div className="phrase-card-topline">
                    <div className="phrase-card-identity">
                      <h3 className="break-preview-chip" data-color={emotion.colorToken}>
                        {emotion.chipLabel}
                      </h3>
                    </div>
                    <button
                      className="secondary-pill"
                      onClick={() => updateEmotion(emotion.key, { isArchived: false })}
                      type="button"
                    >
                      Show again
                    </button>
                  </div>
                  <p className="supporting-copy">
                    {emotion.commonHumanity || sharedCommonHumanity}
                  </p>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
