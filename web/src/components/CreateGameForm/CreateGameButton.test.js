import { render, cleanup } from '@testing-library/react'

import CreateGameButton from './CreateGameButton'

describe('CreateGameButton', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders successfully', () => {
    expect(() => {
      render(<CreateGameButton />)
    }).not.toThrow()
  })
})
