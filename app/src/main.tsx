import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { Toaster } from "@/components/ui/sonner"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <TRPCProvider>
      <App />
      <Toaster />
    </TRPCProvider>
  </HashRouter>,
)
