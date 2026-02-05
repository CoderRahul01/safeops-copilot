"use client";

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 SafeOps Error Boundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback = ({ error, retry }: { error?: Error; retry: () => void }) => (
  <div className="flex items-center justify-center min-h-[200px] p-8">
    <div className="text-center space-y-4 max-w-md">
      <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
          SafeOps Component Error
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {error?.message || 'An unexpected error occurred in the safety monitoring system.'}
        </p>
      </div>
      
      <button
        onClick={retry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry Component
      </button>
      
      <p className="text-xs text-zinc-500 dark:text-zinc-600">
        If this error persists, check your network connection and backend services.
      </p>
    </div>
  </div>
);

// Specialized error boundary for Tambo components
export const TamboErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    fallback={({ error, retry }) => (
      <div className="p-6 border border-red-200 dark:border-red-800 rounded-2xl bg-red-50 dark:bg-red-900/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
              Tambo Component Error
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              {error?.message || 'Failed to render safety component'}
            </p>
            <button
              onClick={retry}
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
            >
              Retry Component
            </button>
          </div>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;