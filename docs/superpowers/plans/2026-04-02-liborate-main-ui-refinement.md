# LibOrate Main UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the Zoom and Web prototype so the Zoom surface is banner-first, the Web surface drops ambiguous metrics, adds date filtering, and exposes an editable kindness phrase library.

**Architecture:** Keep the existing shared prototype store, but extend it with persisted phrase-library data and date filtering helpers. Simplify the Zoom surface by folding result content into the banner, and split Web information into product-like tabs plus a configuration editor for phrase content.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, localStorage-backed prototype state

---

### Task 1: Lock the new behavior with tests

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/components/WebShell.test.tsx`
- Modify: `src/state/prototypeStore.test.tsx`

- [ ] Add failing tests for the Zoom banner-only result state, removal of top-level metrics, date filtering, and phrase-library editing.
- [ ] Run the targeted Vitest commands and verify the failures describe the missing behavior.

### Task 2: Update shared state and helpers

**Files:**
- Modify: `src/types.ts`
- Modify: `src/state/prototypeStore.tsx`
- Modify: `src/state/helpers.ts`
- Modify: `src/data/emotions.ts`

- [ ] Extend the persisted store with editable kindness phrase arrays per emotion.
- [ ] Add helper functions for date-range filtering and phrase lookup.
- [ ] Keep check-ins meeting-linked while making the Zoom surface independent of meeting display.

### Task 3: Rebuild the Zoom and Web surfaces

**Files:**
- Modify: `src/components/ZoomCheckInPanel.tsx`
- Modify: `src/components/SupportCard.tsx`
- Modify: `src/components/WebShell.tsx`
- Modify: `src/components/MeetingHistoryPanel.tsx`
- Create or modify any small focused component needed for phrase-library editing or date filtering.
- Modify: `src/styles.css`

- [ ] Fold the support result into the banner and remove in-panel meeting presentation.
- [ ] Remove ambiguous `meetings` / `with history` metrics from Web.
- [ ] Add a Check-ins date filter UI and a separate Web page for editing kindness phrase libraries.
- [ ] Remove subhead labels such as `Common humanity` and show direct content only.

### Task 4: Verify the integrated prototype

**Files:**
- No source changes required unless verification finds regressions.

- [ ] Run `npm run test:run`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
