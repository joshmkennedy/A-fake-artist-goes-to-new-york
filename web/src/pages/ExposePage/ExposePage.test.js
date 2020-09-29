import { render, cleanup } from '@testing-library/react'

import ExposePage from './ExposePage'

describe('ExposePage', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders successfully', () => {
    expect(() => {
      render(<ExposePage />)
    }).not.toThrow()
  })
})
