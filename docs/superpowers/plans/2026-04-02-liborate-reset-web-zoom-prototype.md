# LibOrate Reset Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the prototype so Zoom only handles emotional check-ins, Web handles letter-to-self plus meeting-linked check-in history, and both surfaces share one consistent product UI language.

**Architecture:** Build a single React app with shared in-browser state and local persistence so a check-in created from the Zoom surface appears immediately on the Web surface. Use one design system across a split workspace, a narrow Zoom route, and a full Web route.

**Tech Stack:** Vite, React, TypeScript, React Router, Context + localStorage, CSS, Vitest, Testing Library

---

### Task 1: Recreate the app scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `.gitignore`

- [ ] Recreate a minimal React + TypeScript + Vite scaffold at the repo root.
- [ ] Add test and lint scripts plus the packages needed for React, Router, and Testing Library.
- [ ] Verify dependency installation succeeds.

### Task 2: Define the shared prototype state

**Files:**
- Create: `src/types.ts`
- Create: `src/data/emotions.ts`
- Create: `src/data/meetings.ts`
- Create: `src/state/prototypeStore.tsx`
- Test: `src/state/prototypeStore.test.tsx`

- [ ] Write a test that proves adding a Zoom check-in updates shared state with meeting info.
- [ ] Implement a shared state provider with local persistence for meetings, check-ins, and a web-only letter.
- [ ] Verify the store test passes.

### Task 3: Rebuild the Zoom emotional check-in surface

**Files:**
- Create: `src/components/ZoomChrome.tsx`
- Create: `src/components/ZoomCheckInPanel.tsx`
- Create: `src/components/SupportCard.tsx`
- Test: `src/components/ZoomCheckInPanel.test.tsx`

- [ ] Write a test that clicking a Zoom emotion saves a meeting-linked check-in.
- [ ] Implement the narrow Zoom surface with meeting header, emotion chips, and support card only.
- [ ] Verify the Zoom interaction test passes.

### Task 4: Rebuild the Web surface

**Files:**
- Create: `src/components/WebShell.tsx`
- Create: `src/components/LetterToSelfPanel.tsx`
- Create: `src/components/MeetingHistoryPanel.tsx`
- Create: `src/components/MeetingGroup.tsx`
- Test: `src/components/WebShell.test.tsx`

- [ ] Write a test that Web shows the check-in created from the shared state and keeps letter-to-self separate from meetings.
- [ ] Implement the Web dashboard with meeting-linked check-in history and a standalone letter-to-self editor.
- [ ] Verify the Web interaction test passes.

### Task 5: Wire routes, styling, and verification

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `README.md`

- [ ] Build a split workspace route plus dedicated `/zoom` and `/web` routes.
- [ ] Apply one consistent product-style visual system inspired by the Zoom reference.
- [ ] Run full verification with tests, lint, and production build.
