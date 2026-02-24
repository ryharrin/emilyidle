import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { GameProvider } from '../context/GameProvider'
import { FeatureErrorBoundary } from './FeatureErrorBoundary'
import { RootErrorBoundary } from './RootErrorBoundary'

function Thrower(): ReactElement {
  throw new Error('boom')
}

describe('error boundaries', () => {
  it('renders root fallback when a child throws', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(
      <GameProvider>
        <RootErrorBoundary>
          <Thrower />
        </RootErrorBoundary>
      </GameProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()

    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('isolates failures to a feature boundary', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(
      <GameProvider>
        <div>
          <FeatureErrorBoundary title="Feature had an issue">
            <Thrower />
          </FeatureErrorBoundary>
          <p>Other area OK</p>
        </div>
      </GameProvider>,
    )

    expect(screen.getByText('Other area OK')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Feature had an issue' }),
    ).toBeInTheDocument()

    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })
})
