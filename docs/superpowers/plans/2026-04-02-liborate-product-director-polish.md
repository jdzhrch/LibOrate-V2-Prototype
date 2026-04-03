# LibOrate Product Director Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe the prototype around clearer product language, more legible Zoom feedback, and more scannable Web patterns.

**Architecture:** Keep the current React/Vite prototype structure, but tighten the product model in three places: rename the web analytics surface from raw check-ins to patterns, split pattern logic more clearly between meeting-driven and emotion-driven analyses, and rework the self-compassion configuration model so common humanity has a shared default with emotion-level overrides. On the Zoom side, swap the current title-heavy stack for a visually differentiated three-card composition with repeat-click feedback that still syncs as check-in records.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Lock the renamed product language and Zoom card hierarchy in tests

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/components/WebShell.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
expect(screen.getByRole('tab', { name: 'Patterns' })).toBeInTheDocument()
expect(screen.getByRole('tab', { name: 'Self-Compassion Break' })).toBeInTheDocument()
expect(container.querySelector('.zoom-checkin-stack')).toBeInTheDocument()
expect(container.querySelector('.zoom-card-common-humanity')).toBeInTheDocument()
expect(container.querySelector('.zoom-card-self-kindness')).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'I need a reset' })).toHaveAttribute('aria-pressed', 'true')
```

- [ ] **Step 2: Run the targeted tests to verify they fail**

Run: `npm run test:run -- src/App.test.tsx src/components/WebShell.test.tsx`
Expected: FAIL because `Patterns` does not exist yet or Zoom still relies on prominent card titles without the new structure.

- [ ] **Step 3: Update the tests with the new product wording and structural expectations**

```tsx
expect(screen.getByRole('tab', { name: 'Patterns' })).toBeInTheDocument()
expect(screen.queryByRole('tab', { name: 'Check-ins' })).not.toBeInTheDocument()
expect(container.querySelector('.zoom-card-common-humanity')?.textContent).toContain('Lots of speakers need a reset')
expect(container.querySelector('.zoom-card-self-kindness')?.textContent).toContain('I can reset this moment and begin again.')
```

- [ ] **Step 4: Re-run the targeted tests and confirm the updated assertions still fail for the intended reasons**

Run: `npm run test:run -- src/App.test.tsx src/components/WebShell.test.tsx`
Expected: FAIL because production code has not been updated yet.

### Task 2: Rework the product model for shared common humanity and mode-specific pattern framing

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/emotions.ts`
- Modify: `src/state/prototypeStore.tsx`
- Modify: `src/state/helpers.ts`
- Test: `src/state/prototypeStore.test.tsx`

- [ ] **Step 1: Write the failing tests for shared default common humanity and new pattern insight shape**

```tsx
expect(record.commonHumanity).toBe(sharedCommonHumanity)
expect(buildCheckInInsights(records, 'meeting', emotionLibrary)[0]?.label).toBe('Highest-support meeting')
expect(buildCheckInInsights(records, 'emotion', emotionLibrary)[0]?.label).toBe('Most repeated state')
```

- [ ] **Step 2: Run the state-focused tests to verify they fail**

Run: `npm run test:run -- src/state/prototypeStore.test.tsx`
Expected: FAIL because the helper labels and common humanity model do not match the new structure yet.

- [ ] **Step 3: Extend the stored product model**

```ts
export type EmotionConfig = {
  key: EmotionKey
  chipLabel: string
  supportTitle: string
  commonHumanityOverride?: string | null
  kindnessPhrases: string[]
  isArchived: boolean
}

export type PersistedPrototypeState = {
  selectedMeetingId: string
  checkIns: CheckInRecord[]
  letters: LetterEntry[]
  commonHumanityDefault?: string
  emotionLibrary?: EmotionConfig[]
}
```

- [ ] **Step 4: Update hydration and record creation to use the shared default unless an emotion override is present**

```ts
const commonHumanity =
  emotion.commonHumanityOverride?.trim() || commonHumanityDefault.trim() || sharedCommonHumanity
```

- [ ] **Step 5: Rewrite meeting/emotion insight builders so the labels and conclusions differ materially**

```ts
if (viewMode === 'meeting') {
  return [
    { label: 'Highest-support meeting', value: busiestMeeting.title, detail: `${busiestMeeting.records.length} breaks started here` },
    { label: 'Most layered meeting', value: `${emotionCount} states`, detail: `${broadestMix.meeting.title} surfaced the widest mix` },
    { label: 'Most repeated break', value: `${highestRepeatCount} taps`, detail: `${repeatMeeting.title} drew the most repeated support taps` },
  ]
}

return [
  { label: 'Most repeated state', value: topEmotion.emotion.chipLabel, detail: `${topEmotion.records.length} support taps in range` },
  { label: 'Broadest across meetings', value: `${spreadMeetingCount} meetings`, detail: `${spreadEmotion.emotion.chipLabel} appears in the widest spread` },
  { label: 'Fastest-rising state', value: recentEmotion.emotion.chipLabel, detail: `Most recent activity clusters here` },
]
```

- [ ] **Step 6: Re-run the state-focused tests and confirm they pass**

Run: `npm run test:run -- src/state/prototypeStore.test.tsx`
Expected: PASS

### Task 3: Reframe the web analytics surface as Patterns with collapsible detail cards

**Files:**
- Modify: `src/components/WebShell.tsx`
- Modify: `src/components/MeetingHistoryPanel.tsx`
- Modify: `src/components/CheckInOverview.tsx`
- Modify: `src/components/MeetingGroup.tsx`
- Modify: `src/components/EmotionGroup.tsx`
- Modify: `src/styles.css`
- Test: `src/components/WebShell.test.tsx`

- [ ] **Step 1: Write the failing tests for renamed pages and collapsible detail groups**

```tsx
expect(screen.getByRole('tab', { name: 'Patterns' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Expand Tuesday design review' })).toBeInTheDocument()
expect(screen.queryByText('11:32 AM')).not.toBeInTheDocument()
```

- [ ] **Step 2: Run the targeted web tests to verify they fail**

Run: `npm run test:run -- src/components/WebShell.test.tsx`
Expected: FAIL because the page is still called `Check-ins` and groups always render expanded detail rows.

- [ ] **Step 3: Rename the page and the internal view controls**

```tsx
<button role="tab">Patterns</button>
<button role="tab">Meetings</button>
<button role="tab">Emotions</button>
```

- [ ] **Step 4: Add local collapse state to meeting and emotion groups**

```tsx
const [expanded, setExpanded] = useState(false)

<button aria-expanded={expanded} aria-label={`Expand ${meeting.title}`}>
  <span>{meeting.title}</span>
</button>

{expanded ? <div className="record-list">...</div> : null}
```

- [ ] **Step 5: Tighten overview copy so the two views feel like different questions**

```tsx
<h2>Patterns</h2>
<h3>{viewMode === 'meeting' ? 'Meeting pressure map' : 'Emotion pattern map'}</h3>
```

- [ ] **Step 6: Re-run the targeted web tests and confirm they pass**

Run: `npm run test:run -- src/components/WebShell.test.tsx`
Expected: PASS

### Task 4: Rebuild the Self-Compassion Break editor around a global default plus per-emotion overrides

**Files:**
- Modify: `src/components/PhraseLibraryPanel.tsx`
- Modify: `src/state/prototypeStore.tsx`
- Modify: `src/types.ts`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test for a global default common humanity and a single emotion title per card**

```tsx
expect(screen.getByLabelText('Default common humanity')).toBeInTheDocument()
expect(within(stuckCard).queryAllByText('I feel stuck')).toHaveLength(1)
```

- [ ] **Step 2: Run the app-focused test to verify it fails**

Run: `npm run test:run -- src/App.test.tsx`
Expected: FAIL because the editor still repeats the emotion name through field labels or lacks a default common humanity field.

- [ ] **Step 3: Add the global default editor and convert per-emotion common humanity into an optional override**

```tsx
<label htmlFor="default-common-humanity">Default common humanity</label>
<textarea id="default-common-humanity" value={commonHumanityDefaultDraft} />

<label htmlFor={`${emotion.key}-humanity`}>Custom common humanity</label>
<textarea placeholder="Use default common humanity" />
```

- [ ] **Step 4: Keep the emotion label visible once at the card top and use generic field labels below it**

```tsx
<h3>{emotion.chipLabel}</h3>
<label>Emotions and thoughts</label>
<label>Custom common humanity</label>
<label>Self-kindness</label>
```

- [ ] **Step 5: Re-run the app-focused test and confirm it passes**

Run: `npm run test:run -- src/App.test.tsx`
Expected: PASS

### Task 5: Redesign the Zoom stack so visuals, not large headings, communicate hierarchy and repeat taps

**Files:**
- Modify: `src/components/ZoomCheckInPanel.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test for repeat-tap feedback**

```tsx
await user.click(screen.getByRole('button', { name: 'I need a reset' }))
await user.click(screen.getByRole('button', { name: 'I need a reset' }))
expect(screen.getByRole('button', { name: 'I need a reset' })).toHaveAttribute('data-repeat-count', '2')
```

- [ ] **Step 2: Run the app-focused test to verify it fails**

Run: `npm run test:run -- src/App.test.tsx`
Expected: FAIL because repeated taps are not surfaced visually yet.

- [ ] **Step 3: Replace the current heading-heavy layout with visually distinct cards**

```tsx
<section className="zoom-card zoom-card-selector">...</section>
<section className="zoom-card zoom-card-humanity" aria-label="Common humanity">...</section>
<section className="zoom-card zoom-card-kindness" aria-label="Self-kindness">...</section>
```

- [ ] **Step 4: Track repeat taps per selected emotion and surface the count on the active chip**

```tsx
const [repeatCount, setRepeatCount] = useState(0)

if (emotionKey === selectedEmotionKey) {
  setRepeatCount((count) => count + 1)
} else {
  setRepeatCount(1)
}
```

- [ ] **Step 5: Re-run the app-focused test and confirm it passes**

Run: `npm run test:run -- src/App.test.tsx`
Expected: PASS

### Task 6: Run full verification

**Files:**
- Test: `src/App.test.tsx`
- Test: `src/components/WebShell.test.tsx`
- Test: `src/state/prototypeStore.test.tsx`

- [ ] **Step 1: Run the full test suite**

Run: `npm run test:run`
Expected: PASS with all tests green

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: PASS with no lint output

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS and Vite build output
