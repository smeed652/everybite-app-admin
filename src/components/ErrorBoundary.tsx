import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Reusable error boundary that triggers a toast and renders a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log error details (future integration with logger service)
    console.error('[ErrorBoundary]', error, info);

    // Show toast notification
    toast.error('Something went wrong. Please refresh or contact support.');
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;
    if (hasError) {
      return fallback ?? (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Oops!</h1>
          <p className="text-gray-600">An unexpected error occurred.</p>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
