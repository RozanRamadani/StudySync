"use client";

import { motion } from "framer-motion";

interface ConfidenceRingProps {
  value: number;
  size?: number;
}

export function ConfidenceRing({ value, size = 100 }: ConfidenceRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--accent-blue)" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ fontSize: size * 0.26, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Playfair Display', serif" }}
        >
          {value}%
        </motion.span>
        <span style={{ fontSize: size * 0.1, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
          Kep. AI
        </span>
      </div>
    </div>
  );
}
