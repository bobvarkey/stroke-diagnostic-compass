import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered instead of the children when they fail. Defaults to nothing. */
  fallback?: ReactNode;
  /** Optional label used in the console warning. */
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates a non-critical widget so a failure inside it can never blank the page.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[${this.props.label ?? "widget"}] failed to render`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <>{this.props.fallback ?? null}</>;
    return <>{this.props.children}</>;
  }
}
