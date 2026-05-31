"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { FuzzyResult, FuzzyInput } from "@/lib/fuzzy-engine";
import { saveStudySession, getStudySessions } from "@/app/actions/session";
import { toast } from "@/components/ui/Toaster";

export interface StudySession {
  id: string;
  timestamp: Date;
  focus: number;
  fatigue: number;
  complexity: number;
  duration: number;
  category: string;
  confidence: number;
  syncStatus?: 'syncing' | 'synced' | 'failed';
}

interface StudySyncContextType {
  sessions: StudySession[];
  isLoadingSessions: boolean;
  addSession: (session: Omit<StudySession, "id" | "timestamp">) => void;
  retrySession: (session: StudySession) => void;
  clearSessions: () => void;
  lastResult: FuzzyResult | null;
  setLastResult: (result: FuzzyResult | null) => void;
  lastInput: FuzzyInput | null;
  setLastInput: (input: FuzzyInput | null) => void;
}

const StudySyncContext = createContext<StudySyncContextType>({
  sessions: [],
  isLoadingSessions: true,
  addSession: () => {},
  retrySession: () => {},
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
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const data = await getStudySessions();
        if (mounted && data) {
          setSessions(
            data.map((s: any) => ({
              id: s.id,
              timestamp: new Date(s.created_at),
              focus: s.focus,
              fatigue: s.fatigue,
              complexity: s.complexity,
              duration: s.duration,
              category: s.category,
              confidence: s.confidence,
              syncStatus: "synced",
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        if (mounted) setIsLoadingSessions(false);
      }
    };

    loadSessions();
    return () => {
      mounted = false;
    };
  }, []);

  const [lastResult, setLastResult] = useState<FuzzyResult | null>(null);
  const [lastInput, setLastInput] = useState<FuzzyInput | null>(null);

  const addSession = useCallback(
    (session: Omit<StudySession, "id" | "timestamp" | "syncStatus">) => {
      const tempId = `temp-${crypto.randomUUID()}`;
      const newSession: StudySession = {
        ...session,
        id: tempId,
        timestamp: new Date(),
        syncStatus: "syncing",
      };
      
      // Optimistic update
      setSessions((prev) => [newSession, ...prev]);

      // DB requires INTEGER types for inputs, ensure they are rounded
      const sanitizedSession = {
        ...session,
        focus: Math.round(session.focus),
        fatigue: Math.round(session.fatigue),
        complexity: Math.round(session.complexity),
      };

      // Save to Supabase
      saveStudySession(sanitizedSession)
        .then((res) => {
          if (res.success && res.data) {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === tempId
                  ? { ...s, id: res.data.id, timestamp: new Date(res.data.created_at), syncStatus: "synced" }
                  : s
              )
            );
            toast({
              title: "Session Saved",
              description: "Your study session was successfully saved to the cloud.",
              type: "success"
            });
          } else {
            throw new Error(res.error || "Unknown error");
          }
        })
        .catch((err) => {
          console.error("Failed to save session to DB", err);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === tempId ? { ...s, syncStatus: "failed" } : s
            )
          );
          toast({
            title: "Save Failed",
            description: "Could not save your session to the database.",
            type: "error",
            action: {
              label: "Retry",
              onClick: () => retrySessionRef(newSession),
            }
          });
        });
    },
    []
  );

  const retrySessionRef = (session: StudySession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, syncStatus: "syncing" } : s))
    );

    const sanitizedSession = {
      ...session,
      focus: Math.round(session.focus),
      fatigue: Math.round(session.fatigue),
      complexity: Math.round(session.complexity),
    };

    saveStudySession(sanitizedSession)
      .then((res) => {
        if (res.success && res.data) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === session.id
                ? { ...s, id: res.data.id, timestamp: new Date(res.data.created_at), syncStatus: "synced" }
                : s
            )
          );
          toast({
            title: "Retry Successful",
            description: "Your study session was successfully saved.",
            type: "success"
          });
        } else {
          throw new Error(res.error || "Unknown error");
        }
      })
      .catch((err) => {
        console.error("Retry failed:", err);
        setSessions((prev) =>
          prev.map((s) => (s.id === session.id ? { ...s, syncStatus: "failed" } : s))
        );
        toast({
          title: "Retry Failed",
          description: "Still could not save your session.",
          type: "error",
          action: {
            label: "Try Again",
            onClick: () => retrySessionRef(session),
          }
        });
      });
  };

  const retrySession = useCallback(retrySessionRef, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, []);

  return (
    <StudySyncContext.Provider
      value={{
        sessions,
        isLoadingSessions,
        addSession,
        retrySession,
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
