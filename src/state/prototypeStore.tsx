import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { buildDefaultEmotionLibrary } from '../data/emotions'
import { meetings } from '../data/meetings'
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

const defaultState: PersistedPrototypeState = {
  selectedMeetingId: meetings[0].id,
  checkIns: [],
  emotionLibrary: buildDefaultEmotionLibrary(),
  letters: [
    {
      id: 'starter-letter',
      title: 'Before I speak',
      body:
        'You do not have to rush to make other people comfortable. Take the pause you need and let the idea arrive in your own rhythm.',
      mode: 'before-next-meeting',
      linkedMeetingId: null,
      createdAt: new Date('2026-04-01T12:00:00.000Z').toISOString(),
    },
  ],
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
  saveSelfCompassionBreak: (input: EmotionConfig[]) => void
  addLetter: (input: {
    title: string
    body: string
    mode: LetterModeKey
    linkedMeetingId: string | null
  }) => LetterEntry
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

function loadPersistedState(): PersistedPrototypeState {
  if (typeof window === 'undefined') {
    return defaultState
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return defaultState
    }

    return { ...defaultState, ...JSON.parse(raw) }
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

  return input.reduce<EmotionConfig[]>((library, emotion, index) => {
    const chipLabel = emotion.chipLabel.trim() || `Emotion ${index + 1}`
    const key = emotion.key.trim() || `emotion-${index + 1}`

    if (seenKeys.has(key)) {
      return library
    }

    seenKeys.add(key)
    const legacyPhrases = legacyPhraseLibrary?.[key]

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

  function saveSelfCompassionBreak(input: EmotionConfig[]) {
    setEmotionLibrary(hydrateEmotionLibrary(input))
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
        saveSelfCompassionBreak,
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
