import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('GitHub Pages deployment setup', () => {
  it('uses hash routing for static hosting', () => {
    const mainSource = readFileSync(join(root, 'src/main.tsx'), 'utf8')

    expect(mainSource).toContain('HashRouter')
    expect(mainSource).not.toContain('BrowserRouter')
  })

  it('uses a relative Vite base path', () => {
    const viteConfigSource = readFileSync(join(root, 'vite.config.ts'), 'utf8')

    expect(viteConfigSource).toContain("base: './'")
  })

  it('includes a GitHub Pages workflow', () => {
    const workflowPath = join(root, '.github/workflows/deploy-pages.yml')

    expect(existsSync(workflowPath)).toBe(true)

    const workflowSource = readFileSync(workflowPath, 'utf8')

    expect(workflowSource).toContain('actions/deploy-pages')
    expect(workflowSource).toContain('pages')
  })
})
