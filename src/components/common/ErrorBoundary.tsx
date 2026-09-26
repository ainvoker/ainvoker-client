import { Component, Suspense, type ErrorInfo, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import ErrorFallback from "./ErrorFallback"
import PageLoader from "./PageLoader"

export type ErrorBoundaryFallbackProps = {
  error: Error
  reset: () => void
}

type ErrorBoundaryProps = {
  children?: ReactNode
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode)
  onError?: (error: Error, info: ErrorInfo) => void
  /** When these values change, a caught error is cleared (typically the pathname). */
  resetKeys?: readonly unknown[]
}

type ErrorBoundaryState = {
  error: Error | null
}

function resetKeysChanged(
  prev: readonly unknown[] | undefined,
  next: readonly unknown[] | undefined,
): boolean {
  if (prev === next) return false
  if (!prev || !next) return true
  if (prev.length !== next.length) return true
  return prev.some((key, index) => !Object.is(key, next[index]))
}

/**
 * Catches render throws under `children`. Event-handler and async errors are unaffected.
 * Logs the error and component stack only — no extra context that might include user data.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.error &&
      resetKeysChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset()
    }
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const { fallback } = this.props
    if (typeof fallback === "function") {
      return fallback({ error, reset: this.reset })
    }
    if (fallback !== undefined) return fallback
    return <ErrorFallback error={error} reset={this.reset} />
  }
}

type RouteErrorBoundaryProps = {
  children?: ReactNode
  /** Viewport-sized fallback when no surrounding chrome will remain. */
  fullScreen?: boolean
}

/**
 * Route-level boundary. Resets when `location.pathname` changes so in-app
 * navigation leaves a crashed page. Suspense uses the existing page loader
 * if a child suspends; routes are still eager, so this only reserves a fallback.
 */
export function RouteErrorBoundary({
  children,
  fullScreen = false,
}: RouteErrorBoundaryProps) {
  const { pathname } = useLocation()

  return (
    <ErrorBoundary
      resetKeys={[pathname]}
      fallback={({ error, reset }) => (
        <ErrorFallback error={error} reset={reset} fullScreen={fullScreen} />
      )}
    >
      <Suspense fallback={<PageLoader fullScreen={fullScreen} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export default ErrorBoundary
