import type { LetterModeKey, LetterPromptMode } from '../types'

export const letterModes: LetterPromptMode[] = [
  {
    key: 'before-next-meeting',
    title: 'Before the next meeting',
    description: 'Write to the version of you who is about to speak.',
    prompts: [
      'What are you walking into?',
      'What usually gets hard for you in moments like this?',
      'What do you want your future self to remember if speech feels stuck or rushed?',
      'What is one gentle way to stay on your own side in this meeting?',
    ],
  },
  {
    key: 'after-a-hard-meeting',
    title: 'After a hard meeting',
    description: 'Reflect on what happened without turning it into self-punishment.',
    prompts: [
      'What happened in the meeting that stayed with you?',
      'What did you feel in your body or mind when it happened?',
      'What would a kind and understanding voice say about this moment?',
      'What do you want to remember before the next meeting?',
    ],
  },
  {
    key: 'when-shame-gets-loud',
    title: 'When shame gets loud',
    description: 'Slow the spiral and answer it with perspective and warmth.',
    prompts: [
      'What are you criticizing yourself for right now?',
      'If someone you cared about had this exact experience, what would you say to them?',
      'What part of this was human, understandable, or outside your control?',
      'What would kindness sound like in one honest sentence?',
    ],
  },
]

export function getLetterMode(key: LetterModeKey) {
  const mode = letterModes.find((entry) => entry.key === key)

  if (!mode) {
    throw new Error(`Unknown letter mode: ${key}`)
  }

  return mode
}
