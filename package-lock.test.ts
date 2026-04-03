import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('package lock integrity', () => {
  it('includes emnapi peer packages required by the wasm runtime lock entry', () => {
    const lockSource = readFileSync(join(root, 'package-lock.json'), 'utf8')

    expect(lockSource).toContain('"node_modules/@napi-rs/wasm-runtime"')
    expect(lockSource).toContain('"node_modules/@emnapi/core"')
    expect(lockSource).toContain('"node_modules/@emnapi/runtime"')
  })
})
