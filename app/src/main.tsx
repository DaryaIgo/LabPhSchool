import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "./index.css";
import { TRPCProvider } from "@/providers/trpc";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";
import { ErrorBoundary } from "@/components/ErrorFallback";

window.addEventListener("error", e => {
  console.error("Global error:", e.error);
});

window.addEventListener("unhandledrejection", e => {
  console.error("Unhandled rejection:", e.reason);
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <HashRouter>
      <TRPCProvider>
        <App />
        <Toaster />
      </TRPCProvider>
    </HashRouter>
  </ErrorBoundary>
);
