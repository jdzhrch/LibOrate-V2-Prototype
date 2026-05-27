import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('design feedback regressions', () => {
  it('does not use the old asymmetric chip span or left-rail treatments', () => {
    const styles = readFileSync(join(root, 'src/styles.css'), 'utf8')

    expect(styles).not.toContain('.chip-grid > :last-child:nth-child(odd)')
    expect(styles).not.toContain('.emotion-chip::before')
    expect(styles).not.toContain('.meeting-group-card::before')
  })

  it('keeps the insights analytics controls flat and spaced', () => {
    const styles = readFileSync(join(root, 'src/styles.css'), 'utf8')

    expect(styles).toMatch(
      /\.analytics-view-tabs\s*{[^}]*background:\s*transparent;[^}]*border:\s*0;[^}]*box-shadow:\s*none;/s,
    )
    expect(styles).toMatch(
      /\.analytics-flat-section\s*{[^}]*display:\s*grid;[^}]*gap:\s*24px;/s,
    )
    expect(styles).toMatch(
      /\.history-visual-grid\s*{[^}]*grid-template-columns:\s*1fr;/s,
    )
    expect(styles).not.toContain('grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr)')
  })
})
