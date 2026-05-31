"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Play, Pause, RotateCcw } from "lucide-react";

interface TimerModalProps {
  duration: number; // minutes
  onClose: () => void;
}

export function TimerModal({ duration, onClose }: TimerModalProps) {
  const totalSeconds = duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = 1 - remaining / totalSeconds;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((p) => {
          if (p <= 1) {
            setRunning(false);
            setCompleted(true);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(totalSeconds);
    setCompleted(false);
  }, [totalSeconds]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-2xl)", padding: "3rem 2.5rem", maxWidth: 420, width: "100%", textAlign: "center", position: "relative", border: "1px solid var(--border-color)" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "1.3rem", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
          {completed ? "🎉 Sesi Selesai!" : "Sesi Fokus"}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
          {completed ? "Kerja bagus! Istirahatlah dengan tenang." : `${duration} menit sesi belajar`}
        </p>

        {/* Progress Ring */}
        <div style={{ position: "relative", width: 250, height: 250, margin: "0 auto 2rem" }}>
          <svg width={250} height={250} viewBox="0 0 250 250">
            <circle cx={125} cy={125} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={8} />
            <circle
              cx={125} cy={125} r={radius} fill="none" stroke="var(--accent-blue)" strokeWidth={8}
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 125 125)" style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "3rem", fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--text-primary)" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>tersisa</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            onClick={() => setRunning(!running)}
            style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent-blue)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {running ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button
            onClick={reset}
            style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
