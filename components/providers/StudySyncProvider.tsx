"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { calculateFuzzy, FuzzyResult } from "@/lib/fuzzy-engine";
import { saveStudySession, getStudySessions } from "@/app/actions/session";
import { toast } from "@/components/ui/Toaster";
import { useMemo } from "react";

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
  focus: number;
  setFocus: (focus: number) => void;
  fatigue: number;
  setFatigue: (fatigue: number) => void;
  complexity: number;
  setComplexity: (complexity: number) => void;
  fuzzyResult: FuzzyResult;
}

const defaultFuzzyResult = calculateFuzzy({ focus: 85, fatigue: 20, complexity: 40 });

const StudySyncContext = createContext<StudySyncContextType>({
  sessions: [],
  isLoadingSessions: true,
  addSession: () => {},
  retrySession: () => {},
  clearSessions: () => {},
  focus: 85,
  setFocus: () => {},
  fatigue: 20,
  setFatigue: () => {},
  complexity: 40,
  setComplexity: () => {},
  fuzzyResult: defaultFuzzyResult,
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

  const [focus, setFocus] = useState<number>(85);
  const [fatigue, setFatigue] = useState<number>(20);
  const [complexity, setComplexity] = useState<number>(40);

  const fuzzyResult = useMemo(() => {
    return calculateFuzzy({ focus, fatigue, complexity });
  }, [focus, fatigue, complexity]);

  const retrySessionRef = useRef<(session: StudySession) => void>(() => {});

  const retrySession = useCallback((session: StudySession) => {
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
            title: "Coba Lagi Berhasil",
            description: "Sesi belajar Anda berhasil disimpan.",
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
          title: "Coba Lagi Gagal",
          description: "Masih tidak dapat menyimpan sesi Anda.",
          type: "error",
          action: {
            label: "Coba Lagi",
            onClick: () => retrySessionRef.current(session),
          }
        });
      });
  }, []);

  useEffect(() => {
    retrySessionRef.current = retrySession;
  }, [retrySession]);

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
              title: "Sesi Tersimpan",
              description: "Sesi belajar Anda berhasil disimpan ke cloud.",
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
            title: "Gagal Menyimpan",
            description: "Tidak dapat menyimpan sesi Anda ke database.",
            type: "error",
            action: {
              label: "Coba Lagi",
              onClick: () => retrySession(newSession),
            }
          });
        });
    },
    [retrySession]
  );

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
        focus,
        setFocus,
        fatigue,
        setFatigue,
        complexity,
        setComplexity,
        fuzzyResult,
      }}
    >
      {children}
    </StudySyncContext.Provider>
  );
}
