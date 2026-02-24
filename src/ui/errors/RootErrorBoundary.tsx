import { ErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'
import { log } from '../../game/log'

export function RootErrorBoundary(props: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={(fallbackProps) => (
        <ErrorFallback {...fallbackProps} title="Something went wrong" />
      )}
      onError={(error, info) => {
        log({
          level: 'ERROR',
          scope: 'error-boundary',
          msg: 'root boundary caught error',
          data: {
            error: error instanceof Error ? error.message : String(error),
            componentStack: info.componentStack,
          },
        })
      }}
    >
      {props.children}
    </ErrorBoundary>
  )
}
