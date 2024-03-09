import { cleanup, render } from '@testing-library/react'
import type { ReactTestRenderer } from 'react-test-renderer' // Add this line
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

function customRender (ui: React.ReactElement, options = {}): ReactTestRenderer {
  return render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options
  })
}
export { customRender as render }
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
// override render export
