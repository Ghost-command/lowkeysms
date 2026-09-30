import { Component } from 'react'
import { AlertTriangleIcon } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
          padding: 32,
          textAlign: 'center',
        }}>
          <div style={{
            width: 72,
            height: 72,
            background: 'rgba(212,175,55,0.1)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AlertTriangleIcon size={36} color="var(--gold)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
