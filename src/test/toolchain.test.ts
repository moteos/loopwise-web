import { describe, it, expect } from 'vitest'

describe('test toolchain', () => {
  it('runs in a jsdom environment', () => {
    expect(document.body).toBeTruthy()
  })

  it('registers jest-dom matchers via the setup file', () => {
    expect(document.body.appendChild(document.createElement('div'))).toBeInTheDocument()
  })
})
