/* eslint-disable react/prop-types */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "../lib/logger";
import { useToast } from "./ui/ToastProvider";

// Create a wrapper component that provides toast functionality
const ErrorBoundaryWithToast: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  const { showToast } = useToast();

  return (
    <ErrorBoundary showToast={showToast} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showToast: (opts: {
    title: string;
    variant?: "default" | "success" | "error";
  }) => void;
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
    logger.error("[ErrorBoundary]", error, info);

    // Show toast notification
    this.props.showToast({
      title: "Something went wrong. Please refresh or contact support.",
      variant: "error",
    });
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;
    if (hasError) {
      return (
        fallback ?? (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-semibold mb-2">Oops!</h1>
            <p className="text-gray-600">An unexpected error occurred.</p>
          </div>
        )
      );
    }

    return children;
  }
}

// Export the wrapper as the default
export default ErrorBoundaryWithToast;
