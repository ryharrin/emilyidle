import { ErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'
import { log } from '../../game/log'

export function FeatureErrorBoundary(props: { title: string; children: ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={(fallbackProps) => (
        <ErrorFallback {...fallbackProps} title={props.title} />
      )}
      onError={(error, info) => {
        log({
          level: 'ERROR',
          scope: 'error-boundary',
          msg: 'feature boundary caught error',
          data: {
            title: props.title,
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
