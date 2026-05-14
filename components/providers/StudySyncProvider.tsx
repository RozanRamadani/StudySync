"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { FuzzyResult, FuzzyInput } from "@/lib/fuzzy-engine";

export interface StudySession {
  id: string;
  timestamp: Date;
  focus: number;
  fatigue: number;
  complexity: number;
  duration: number;
  category: string;
  confidence: number;
}

interface StudySyncContextType {
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, "id" | "timestamp">) => void;
  clearSessions: () => void;
  lastResult: FuzzyResult | null;
  setLastResult: (result: FuzzyResult | null) => void;
  lastInput: FuzzyInput | null;
  setLastInput: (input: FuzzyInput | null) => void;
}

const StudySyncContext = createContext<StudySyncContextType>({
  sessions: [],
  addSession: () => {},
  clearSessions: () => {},
  lastResult: null,
  setLastResult: () => {},
  lastInput: null,
  setLastInput: () => {},
});

export function useStudySync() {
  return useContext(StudySyncContext);
}

export function StudySyncProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("studysync-sessions");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((s: StudySession & { timestamp: string }) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [lastResult, setLastResult] = useState<FuzzyResult | null>(null);
  const [lastInput, setLastInput] = useState<FuzzyInput | null>(null);

  const addSession = useCallback(
    (session: Omit<StudySession, "id" | "timestamp">) => {
      const newSession: StudySession = {
        ...session,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setSessions((prev) => {
        const updated = [newSession, ...prev];
        try {
          localStorage.setItem("studysync-sessions", JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const clearSessions = useCallback(() => {
    setSessions([]);
    try {
      localStorage.removeItem("studysync-sessions");
    } catch {
      // ignore
    }
  }, []);

  return (
    <StudySyncContext.Provider
      value={{
        sessions,
        addSession,
        clearSessions,
        lastResult,
        setLastResult,
        lastInput,
        setLastInput,
      }}
    >
      {children}
    </StudySyncContext.Provider>
  );
}
