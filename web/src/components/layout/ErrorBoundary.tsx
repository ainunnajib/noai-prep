import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    console.error(error)
  }
  render() {
    if (this.state.error)
      return (
        this.props.fallback ?? (
          <div className="callout callout-warn" role="alert">
            <div className="callout-body">
              Something on this page failed to load: <code>{this.state.error.message}</code>. Try reloading the page.
            </div>
          </div>
        )
      )
    return this.props.children
  }
}
