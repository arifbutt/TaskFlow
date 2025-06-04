'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto p-4 max-w-4xl">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mb-4">
              {process.env.NODE_ENV === 'development' ? (
                <pre className="whitespace-pre-wrap text-sm">
                  {this.state.error?.message}
                  {this.state.error?.stack}
                </pre>
              ) : (
                'An unexpected error occurred. Please try again.'
              )}
            </AlertDescription>
            <Button variant="outline" onClick={this.resetError}>
              Try again
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for using error boundaries in function components
export function useErrorHandler(error?: Error) {
  if (error) {
    throw error;
  }
}
