"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, X, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export type ToastType = "success" | "error" | "loading";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

let tCounter = 0;
const listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

export const toast = (t: Omit<Toast, "id">) => {
  const id = `toast-${tCounter++}`;
  const newToast = { ...t, id };
  toasts = [...toasts, newToast];
  listeners.forEach((l) => l(toasts));

  if (t.type !== "loading") {
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }

  return id;
};

export const dismiss = (id: string) => {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l(toasts));
};

export const updateToast = (id: string, updates: Partial<Toast>) => {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...updates } : t));
  listeners.forEach((l) => l(toasts));

  if (updates.type && updates.type !== "loading") {
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }
};

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    setCurrentToasts(toasts);
    return () => {
      const idx = listeners.indexOf(setCurrentToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 100, display: "flex", flexDirection: "column", gap: "0.5rem", pointerEvents: "none" }}>
      <AnimatePresence>
        {currentToasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-md)",
              borderRadius: "var(--radius-lg)",
              padding: "1rem",
              minWidth: "300px",
              maxWidth: "400px",
              pointerEvents: "auto",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ marginTop: 2 }}>
              {t.type === "success" && <CheckCircle2 size={18} color="var(--success, #10B981)" />}
              {t.type === "error" && <AlertCircle size={18} color="var(--danger, #EF4444)" />}
              {t.type === "loading" && <Loader2 size={18} color="var(--accent-blue)" className="animate-spin" />}
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: t.description ? 4 : 0 }}>
                {t.title}
              </h4>
              {t.description && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {t.description}
                </p>
              )}
              {t.action && (
                <button
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  style={{
                    marginTop: "8px",
                    background: "var(--accent-blue-soft)",
                    color: "var(--accent-blue)",
                    border: "none",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <RefreshCw size={12} /> {t.action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}