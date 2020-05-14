import { render, cleanup } from '@testing-library/react'

import LobbyPage from './LobbyPage'

describe('LobbyPage', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders successfully', () => {
    expect(() => {
      render(<LobbyPage />)
    }).not.toThrow()
  })
})
