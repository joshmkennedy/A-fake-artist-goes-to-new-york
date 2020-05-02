import { render, cleanup } from '@testing-library/react'

import PaperPage from './PaperPage'

describe('PaperPage', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders successfully', () => {
    expect(() => {
      render(<PaperPage />)
    }).not.toThrow()
  })
})
