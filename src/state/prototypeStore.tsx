import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { buildDefaultEmotionLibrary, getEmotionColorToken } from '../data/emotions'
import { meetings } from '../data/meetings'
import { seedCheckIns, seedLetters } from '../data/seedHistory'
import { buildCheckInRecord } from './helpers'
import type { LetterModeKey } from '../types'
import type {
  CheckInRecord,
  EmotionConfig,
  EmotionKey,
  LetterEntry,
  MeetingInfo,
  PersistedPrototypeState,
  PhraseLibraryInput,
} from '../types'

const STORAGE_KEY = 'liborate-prototype-state'
const RUNAWAY_TODAY_CHECKIN_THRESHOLD = 50

const defaultState: PersistedPrototypeState = {
  selectedMeetingId: meetings[0].id,
  checkIns: seedCheckIns,
  emotionLibrary: buildDefaultEmotionLibrary(),
  letters: seedLetters,
}

type AddEmotionInput = {
  chipLabel: string
  commonHumanity: string
  kindnessPhrases: string[]
}

type SaveEmotionInput = {
  chipLabel: string
  commonHumanity: string
  kindnessPhrases: string[]
}

type PrototypeContextValue = {
  meetings: MeetingInfo[]
  selectedMeetingId: string
  currentMeeting: MeetingInfo
  checkIns: CheckInRecord[]
  letters: LetterEntry[]
  emotionLibrary: EmotionConfig[]
  activeEmotions: EmotionConfig[]
  setSelectedMeetingId: (meetingId: string) => void
  addCheckIn: (emotionKey: EmotionKey) => CheckInRecord
  addEmotion: (input: AddEmotionInput) => EmotionConfig
  saveEmotion: (key: EmotionKey, input: SaveEmotionInput) => void
  setEmotionArchived: (key: EmotionKey, isArchived: boolean) => void
  addLetter: (input: {
    title: string
    body: string
    mode: LetterModeKey
    linkedMeetingId: string | null
  }) => LetterEntry
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

function mergeSeedItems<T extends { id: string; createdAt: string }>(seed: T[], stored?: T[]) {
  const next = new Map<string, T>()

  for (const item of seed) {
    next.set(item.id, item)
  }

  for (const item of stored ?? []) {
    next.set(item.id, item)
  }

  return [...next.values()].sort((left, right) =>
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function sanitizeStoredCheckIns(checkIns: CheckInRecord[] | undefined, now: Date) {
  const storedCheckIns = checkIns ?? []
  const runawayTodayCount = storedCheckIns.filter((record) => {
    if (record.id.startsWith('seed-')) {
      return false
    }

    return isSameLocalDay(new Date(record.createdAt), now)
  }).length

  if (runawayTodayCount < RUNAWAY_TODAY_CHECKIN_THRESHOLD) {
    return storedCheckIns
  }

  return storedCheckIns.filter((record) => {
    if (record.id.startsWith('seed-')) {
      return true
    }

    return !isSameLocalDay(new Date(record.createdAt), now)
  })
}

function loadPersistedState(): PersistedPrototypeState {
  if (typeof window === 'undefined') {
    return defaultState
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return defaultState
    }

    const parsed = JSON.parse(raw) as PersistedPrototypeState
    const now = new Date()
    const sanitizedStoredCheckIns = sanitizeStoredCheckIns(parsed.checkIns, now)

    return {
      ...defaultState,
      ...parsed,
      checkIns: mergeSeedItems(defaultState.checkIns, sanitizedStoredCheckIns),
      letters: mergeSeedItems(defaultState.letters, parsed.letters),
      emotionLibrary: parsed.emotionLibrary?.length
        ? parsed.emotionLibrary
        : defaultState.emotionLibrary,
    }
  } catch {
    return defaultState
  }
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

function normalizePhrases(phrases: string[] | undefined, chipLabel: string) {
  const nextPhrases = phrases?.map((phrase) => phrase.trim()).filter(Boolean) ?? []

  if (nextPhrases.length > 0) {
    return nextPhrases
  }

  return [buildFallbackPhrase(chipLabel)]
}

function normalizeEmotionLibrary(
  input: EmotionConfig[],
  legacyPhraseLibrary?: PhraseLibraryInput,
) {
  const seenKeys = new Set<string>()
  const usedColorTokens: NonNullable<EmotionConfig['colorToken']>[] = []

  return input.reduce<EmotionConfig[]>((library, emotion, index) => {
    const chipLabel = emotion.chipLabel.trim() || `Emotion ${index + 1}`
    const key = emotion.key.trim() || `emotion-${index + 1}`

    if (seenKeys.has(key)) {
      return library
    }

    seenKeys.add(key)
    const legacyPhrases = legacyPhraseLibrary?.[key]
    const colorToken = getEmotionColorToken(key, emotion.colorToken, usedColorTokens)

    usedColorTokens.push(colorToken)

    library.push({
      key,
      chipLabel,
      supportTitle: emotion.supportTitle.trim() || chipLabel,
      commonHumanity: emotion.commonHumanity.trim(),
      kindnessPhrases: normalizePhrases(
        legacyPhrases && legacyPhrases.length > 0 ? legacyPhrases : emotion.kindnessPhrases,
        chipLabel,
      ),
      isArchived: Boolean(emotion.isArchived),
      colorToken,
    })

    return library
  }, [])
}

function hydrateEmotionLibrary(
  input?: EmotionConfig[],
  legacyPhraseLibrary?: PhraseLibraryInput,
) {
  if (input && input.length > 0) {
    return normalizeEmotionLibrary(input, legacyPhraseLibrary)
  }

  return normalizeEmotionLibrary(buildDefaultEmotionLibrary(), legacyPhraseLibrary)
}

function hydrateLetters(input: LetterEntry[]) {
  return input.map((letter) => ({
    ...letter,
    mode: letter.mode ?? 'before-next-meeting',
  }))
}

function getMeetingOrFallback(meetingId: string): MeetingInfo {
  return meetings.find((meeting) => meeting.id === meetingId) ?? meetings[0]
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

type PrototypeProviderProps = {
  children: ReactNode
  initialState?: PersistedPrototypeState
}

export function PrototypeProvider({
  children,
  initialState,
}: PrototypeProviderProps) {
  const seed = initialState ?? loadPersistedState()
  const [selectedMeetingId, setSelectedMeetingId] = useState(seed.selectedMeetingId)
  const [checkIns, setCheckIns] = useState(seed.checkIns)
  const [letters, setLetters] = useState(hydrateLetters(seed.letters))
  const [emotionLibrary, setEmotionLibrary] = useState(
    hydrateEmotionLibrary(seed.emotionLibrary, seed.phraseLibrary),
  )

  const currentMeeting = getMeetingOrFallback(selectedMeetingId)
  const activeEmotions = emotionLibrary.filter((emotion) => !emotion.isArchived)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const nextState: PersistedPrototypeState = {
      selectedMeetingId,
      checkIns,
      letters,
      emotionLibrary,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  }, [selectedMeetingId, checkIns, letters, emotionLibrary])

  function addCheckIn(emotionKey: EmotionKey) {
    const record = buildCheckInRecord({
      emotionKey,
      meeting: currentMeeting,
      existingCheckIns: checkIns,
      emotionLibrary,
      now: new Date(),
    })

    setCheckIns((current) => [record, ...current])
    return record
  }

  function addEmotion(input: AddEmotionInput): EmotionConfig {
    const trimmedLabel = input.chipLabel.trim() || 'Untitled emotion'
    const usedTokens = emotionLibrary
      .map((emotion) => emotion.colorToken)
      .filter((token): token is NonNullable<EmotionConfig['colorToken']> => Boolean(token))
    const existingKeys = emotionLibrary.map((emotion) => emotion.key)
    const key = buildEmotionKey(trimmedLabel, existingKeys)
    const phrases = normalizePhrases(input.kindnessPhrases, trimmedLabel)
    const colorToken = getEmotionColorToken(key, undefined, usedTokens)

    const next: EmotionConfig = {
      key,
      chipLabel: trimmedLabel,
      supportTitle: trimmedLabel,
      commonHumanity: input.commonHumanity.trim(),
      kindnessPhrases: phrases,
      isArchived: false,
      colorToken,
    }

    setEmotionLibrary((current) => [...current, next])
    return next
  }

  function saveEmotion(key: EmotionKey, input: SaveEmotionInput) {
    setEmotionLibrary((current) =>
      current.map((emotion) => {
        if (emotion.key !== key) {
          return emotion
        }

        const trimmedLabel = input.chipLabel.trim() || emotion.chipLabel
        return {
          ...emotion,
          chipLabel: trimmedLabel,
          supportTitle: trimmedLabel,
          commonHumanity: input.commonHumanity.trim(),
          kindnessPhrases: normalizePhrases(input.kindnessPhrases, trimmedLabel),
        }
      }),
    )
  }

  function setEmotionArchived(key: EmotionKey, isArchived: boolean) {
    setEmotionLibrary((current) =>
      current.map((emotion) =>
        emotion.key === key ? { ...emotion, isArchived } : emotion,
      ),
    )
  }

  function addLetter(input: {
    title: string
    body: string
    mode: LetterModeKey
    linkedMeetingId: string | null
  }) {
    const entry: LetterEntry = {
      id: `letter-${Date.now()}`,
      title: input.title,
      body: input.body,
      mode: input.mode,
      linkedMeetingId: input.linkedMeetingId,
      createdAt: new Date().toISOString(),
    }

    setLetters((current) => [entry, ...current])
    return entry
  }

  return (
    <PrototypeContext.Provider
      value={{
        meetings,
        selectedMeetingId,
        currentMeeting,
        checkIns,
        letters,
        emotionLibrary,
        activeEmotions,
        setSelectedMeetingId,
        addCheckIn,
        addEmotion,
        saveEmotion,
        setEmotionArchived,
        addLetter,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  )
}

export function usePrototypeStore() {
  const context = useContext(PrototypeContext)

  if (!context) {
    throw new Error('usePrototypeStore must be used within a PrototypeProvider')
  }

  return context
}
