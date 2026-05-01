import type {
  EmotionColorToken,
  EmotionConfig,
  EmotionKey,
  PhraseLibrary,
} from '../types'

export const emotionColorTokens: EmotionColorToken[] = [
  'sky',
  'indigo',
  'apricot',
  'rose',
  'sage',
  'teal',
  'amber',
]

const defaultEmotionColors: Record<string, EmotionColorToken> = {
  fear: 'sky',
  'shame-embarrassment': 'rose',
  anxiety: 'indigo',
  'guilt-frustration': 'apricot',
  avoidance: 'sage',
  isolation: 'teal',
  hopelessness: 'amber',
}

export const sharedCommonHumanity =
  'Many people feel pressure around speaking. A hard moment does not mean you are failing or alone.'

export const defaultEmotions: EmotionConfig[] = [
  {
    key: 'fear',
    chipLabel: 'Fear',
    supportTitle: 'Steady through fear',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'sky',
    kindnessPhrases: [
      'I can breathe and let the word come.',
      'Fear is here, and I can still speak.',
      'I can move gently, one word at a time.',
    ],
    isArchived: false,
  },
  {
    key: 'shame-embarrassment',
    chipLabel: 'Shame & Embarrassment',
    supportTitle: 'Dignity stays here',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'rose',
    kindnessPhrases: [
      'My worth is not measured by fluency.',
      'I can meet this moment with warmth.',
      'It is okay to take my time here.',
    ],
    isArchived: false,
  },
  {
    key: 'anxiety',
    chipLabel: 'Anxiety',
    supportTitle: 'Settle the rush',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'indigo',
    kindnessPhrases: [
      'I can slow my body and my pace.',
      'This feeling is loud, but it will pass.',
      'One clear sentence is enough right now.',
    ],
    isArchived: false,
  },
  {
    key: 'guilt-frustration',
    chipLabel: 'Guilt & Frustration',
    supportTitle: 'Release the blame',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'apricot',
    kindnessPhrases: [
      'I am not failing; this is just hard.',
      'I can try again without punishment.',
      'Patience is still for me today.',
    ],
    isArchived: false,
  },
  {
    key: 'avoidance',
    chipLabel: 'Avoidance',
    supportTitle: 'Stay in the room',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'sage',
    kindnessPhrases: [
      'I can choose the real word this time.',
      'I can try it once and see what happens.',
      'I can stay, even if it is messy.',
    ],
    isArchived: false,
  },
  {
    key: 'isolation',
    chipLabel: 'Isolation',
    supportTitle: 'You are not alone',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'teal',
    kindnessPhrases: [
      'Others feel this too, even if I cannot see.',
      'I can reach for connection in small ways.',
      'I am still understandable, even when I stumble.',
    ],
    isArchived: false,
  },
  {
    key: 'hopelessness',
    chipLabel: 'Hopelessness',
    supportTitle: 'Hold a small hope',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'amber',
    kindnessPhrases: [
      'This feels heavy now, not forever.',
      'Small steps still count, even today.',
      'I can try the next moment with care.',
    ],
    isArchived: false,
  },
]

export function buildDefaultEmotionLibrary(): EmotionConfig[] {
  return defaultEmotions.map((emotion) => ({
    ...emotion,
    kindnessPhrases: [...emotion.kindnessPhrases],
  }))
}

export function isEmotionColorToken(value: string | undefined): value is EmotionColorToken {
  return value ? emotionColorTokens.includes(value as EmotionColorToken) : false
}

export function getEmotionColorToken(
  emotionKey: string,
  explicitColorToken?: EmotionColorToken,
  usedTokens: EmotionColorToken[] = [],
): EmotionColorToken {
  if (explicitColorToken && isEmotionColorToken(explicitColorToken)) {
    return explicitColorToken
  }

  const presetToken = defaultEmotionColors[emotionKey]

  if (presetToken) {
    return presetToken
  }

  const nextUnusedToken = emotionColorTokens.find((token) => !usedTokens.includes(token))

  if (nextUnusedToken) {
    return nextUnusedToken
  }

  return emotionColorTokens[usedTokens.length % emotionColorTokens.length] ?? 'sky'
}

export function getEmotionSummaryLabel(chipLabel: string) {
  function capitalize(value: string) {
    return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value
  }

  const trimmed = chipLabel.trim()
  const lower = trimmed.toLowerCase()

  if (lower.startsWith('i feel ')) {
    return capitalize(trimmed.slice(7))
  }

  if (lower.startsWith('i am ')) {
    return capitalize(trimmed.slice(5))
  }

  if (lower.startsWith("i'm ")) {
    return capitalize(trimmed.slice(4))
  }

  if (lower.startsWith('i want to ')) {
    return capitalize(trimmed.slice(10))
  }

  if (lower.startsWith('shame is ')) {
    return 'Shame'
  }

  return capitalize(trimmed)
}

export function getEmotionByKey(key: EmotionKey, emotionLibrary: EmotionConfig[]) {
  const emotion = emotionLibrary.find((item) => item.key === key)

  if (!emotion) {
    throw new Error(`Unknown emotion key: ${key}`)
  }

  return emotion
}

export function buildDefaultPhraseLibrary(): PhraseLibrary {
  const library = {} as PhraseLibrary

  for (const emotion of defaultEmotions) {
    library[emotion.key] = [...emotion.kindnessPhrases]
  }

  return library
}
