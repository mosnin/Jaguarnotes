import React, { Component, ReactNode } from "react";
import { trackError } from "@/lib/telemetry";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    trackError("ErrorBoundary", error);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-ink-2">Something went wrong loading this note.</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded-lg bg-raised px-4 py-2 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink-1"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
