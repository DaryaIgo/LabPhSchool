import * as React from "react";
import type { ReactNode } from "react";

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div
      style={{
        padding: 40,
        fontFamily: "system-ui, sans-serif",
        background: "#1a1a1a",
        color: "#ff6b6b",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>⚠️ Ошибка приложения</h1>
      <pre
        style={{
          background: "#111",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {error.stack ?? error.message}
      </pre>
    </div>
  );
}

export class ErrorBoundary extends React.Component<{
  children: ReactNode;
  fallback?: ReactNode;
}> {
  state: { hasError: boolean; error?: Error } = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("React ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback ?? <ErrorFallback error={this.state.error} />
      );
    }
    return this.props.children;
  }
}
