import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400">
          <h2 className="text-lg font-bold mb-2">页面渲染出错</h2>
          <p className="mb-4 text-red-300/80">很抱歉，加载此模块时遇到了问题。</p>
          <pre className="bg-black-card p-4 rounded text-xs overflow-auto border border-red-900/30 text-gray-300">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
