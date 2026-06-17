import { Component, type ErrorInfo, type ReactNode } from "react";
import Button from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#3d0000]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#ff3d3d]/30">
              <svg
                className="w-10 h-10 text-[#ff3d3d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-white text-3xl font-bold mb-4">
              Oops! Something went wrong.
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-8">
              We encountered an unexpected error. Please try refreshing the page
              or navigating back home.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
              >
                Go to Home
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-8 p-4 bg-[#111] rounded-lg border border-[rgba(255,255,255,0.1)] text-left overflow-auto max-h-60 text-xs text-red-400">
                <code>{this.state.error.toString()}</code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
