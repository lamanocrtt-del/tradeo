"use client"

import { useEffect, useState, createContext, useContext, useCallback } from "react"
import { AlertTriangle, X } from "lucide-react"

interface Toast {
  id: string
  message: string
  type: "error" | "success" | "info"
}

interface ToastContextType {
  showToast: (message: string, type?: "error" | "success" | "info") => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useErrorToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Return a no-op if used outside provider
    return { showToast: () => {} }
  }
  return ctx
}

export function ErrorToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: "error" | "success" | "info" = "error") => {
    const id = `toast-${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 left-4 right-4 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3 shadow-lg
              flex items-center gap-3 animate-in slide-in-from-top fade-in duration-300
              ${toast.type === "error" 
                ? "bg-[#1a0a0a] border border-red-500/30" 
                : toast.type === "success"
                  ? "bg-[#0a1a0a] border border-green-500/30"
                  : "bg-card border border-border"
              }
            `}
          >
            {toast.type === "error" && (
              <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            )}
            <p className={`flex-1 text-sm font-medium ${
              toast.type === "error" 
                ? "text-red-500" 
                : toast.type === "success"
                  ? "text-green-500"
                  : "text-foreground"
            }`}>
              {toast.message}
            </p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
