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
})
