export type EmotionKey = string
export type EmotionColorToken =
  | 'sky'
  | 'indigo'
  | 'apricot'
  | 'rose'
  | 'sage'
  | 'teal'
  | 'amber'

export type PhraseLibrary = Record<EmotionKey, string[]>
export type PhraseLibraryInput = Partial<Record<EmotionKey, string[]>>
export type CheckInViewMode = 'meeting' | 'emotion'

export type CheckInDateFilterMode = 'last-7-days' | 'last-30-days' | 'all' | 'custom'

export type CheckInDateFilter = {
  mode: CheckInDateFilterMode
  now?: Date
  startDate?: string
  endDate?: string
}

export type EmotionConfig = {
  key: EmotionKey
  chipLabel: string
  supportTitle: string
  commonHumanity: string
  kindnessPhrases: string[]
  isArchived: boolean
  colorToken?: EmotionColorToken
}

export type MeetingInfo = {
  id: string
  title: string
  startTime: string
  contextNote: string
}

export type CheckInRecord = {
  id: string
  meetingId: string
  meetingTitle: string
  meetingStartTime: string
  emotionKey: EmotionKey
  emotionLabel: string
  supportTitle: string
  commonHumanity: string
  kindnessPhrase: string
  createdAt: string
}

export type LetterModeKey =
  | 'before-next-meeting'
  | 'after-a-hard-meeting'
  | 'when-shame-gets-loud'

export type LetterPromptMode = {
  key: LetterModeKey
  title: string
  description: string
  prompts: string[]
}

export type LetterEntry = {
  id: string
  title: string
  body: string
  mode: LetterModeKey
  linkedMeetingId: string | null
  createdAt: string
}

export type PersistedPrototypeState = {
  selectedMeetingId: string
  checkIns: CheckInRecord[]
  letters: LetterEntry[]
  emotionLibrary?: EmotionConfig[]
  phraseLibrary?: PhraseLibraryInput
}
