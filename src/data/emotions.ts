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
  nervous: 'sky',
  stuck: 'indigo',
  rushing: 'apricot',
  ashamed: 'rose',
  steadying: 'sage',
}

export const sharedCommonHumanity =
  'Many people feel pressure around speaking. A hard moment does not mean you are failing or alone.'

export const defaultEmotions: EmotionConfig[] = [
  {
    key: 'nervous',
    chipLabel: 'I feel nervous',
    supportTitle: 'A steadier way in',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'sky',
    kindnessPhrases: [
      'I can begin at the pace my body can manage.',
      'My voice is still worth hearing, even if it is not smooth.',
      'I can give myself the same patience I would give a friend.',
    ],
    isArchived: false,
  },
  {
    key: 'stuck',
    chipLabel: 'I feel stuck',
    supportTitle: 'Stay with yourself here',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'indigo',
    kindnessPhrases: [
      'I can pause and start again without turning against myself.',
      'I am still part of this conversation, even if the words take time.',
      'I can let this be hard and still remain on my own side.',
    ],
    isArchived: false,
  },
  {
    key: 'rushing',
    chipLabel: 'I want to rush',
    supportTitle: 'Slow the pressure, not your value',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'apricot',
    kindnessPhrases: [
      'I am allowed to slow this down.',
      'I do not need to outrun the moment to get through it.',
      'One clear sentence is enough for right now.',
    ],
    isArchived: false,
  },
  {
    key: 'ashamed',
    chipLabel: 'Shame is spiking',
    supportTitle: 'Your dignity stays intact',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'rose',
    kindnessPhrases: [
      'Nothing about this moment removes my dignity.',
      'I do not need perfect fluency to deserve respect.',
      'I can answer this wave with warmth instead of punishment.',
    ],
    isArchived: false,
  },
  {
    key: 'steadying',
    chipLabel: 'I am finding my footing',
    supportTitle: 'Let the ease count',
    commonHumanity: sharedCommonHumanity,
    colorToken: 'sage',
    kindnessPhrases: [
      'I can notice what is helping and stay with it.',
      'I can let this small bit of ease matter.',
      'I am allowed to trust the next sentence.',
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
