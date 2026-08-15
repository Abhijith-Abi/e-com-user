import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-background">
          <div className="max-w-md w-full p-10 rounded-[2.5rem] bg-secondary/30 backdrop-blur-xl border border-border shadow-2xl relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10">
              <div className="mb-8 flex justify-center">
                <div className="p-5 bg-primary/10 rounded-3xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <AlertTriangle className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl font-display mb-4 text-foreground">Application Error</h1>
              <p className="text-muted-foreground font-sans text-sm mb-10 leading-relaxed">
                We apologize for the inconvenience. A technical error occurred while rendering this part of the application.
              </p>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={this.handleReset}
                  className="w-full py-6 rounded-2xl bg-primary text-primary-foreground font-sans font-semibold tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full py-6 rounded-2xl border-border font-sans font-medium hover:bg-secondary transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-left overflow-auto max-h-40 custom-scrollbar">
                  <p className="text-[10px] font-mono text-red-500/70 whitespace-pre-wrap">
                    {this.state.error?.stack}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
