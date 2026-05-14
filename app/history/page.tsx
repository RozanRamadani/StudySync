"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Search, Filter, Flame, TrendingUp, ChevronLeft, ChevronRight, Sparkles, MoreVertical, AlertTriangle, Eye } from "lucide-react";
import { useStudySync } from "@/components/providers/StudySyncProvider";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Generate heatmap data (4 weeks × 7 days)
function generateHeatmap(): number[][] {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  );
}

const heatmapColors = ["var(--bg-primary)", "#DBEAFE", "#93C5FD", "#3B82F6", "#1D4ED8"];

// Fake chart data
const chartData = [
  { day: "Mon", value: 40 }, { day: "Tue", value: 55 },
  { day: "Wed", value: 45 }, { day: "Thu", value: 70 },
  { day: "Fri", value: 65 }, { day: "Sat", value: 80 },
  { day: "Sun", value: 75 },
];

export default function HistoryPage() {
  const { sessions } = useStudySync();
  const [period, setPeriod] = useState<"Today" | "Weekly" | "Monthly">("Weekly");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const heatmap = useMemo(() => generateHeatmap(), []);

  // Demo sessions if no real data
  const displaySessions = sessions.length > 0 ? sessions : [
    { id: "1", timestamp: new Date(), focus: 92, fatigue: 15, complexity: 60, duration: 45, category: "Sedang", confidence: 87 },
    { id: "2", timestamp: new Date(Date.now() - 86400000), focus: 78, fatigue: 45, complexity: 50, duration: 90, category: "Panjang", confidence: 74 },
    { id: "3", timestamp: new Date(Date.now() - 172800000), focus: 45, fatigue: 80, complexity: 85, duration: 20, category: "Pendek", confidence: 52 },
  ];

  const filtered = displaySessions.filter((s) =>
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.duration.toString().includes(searchTerm)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginatedSessions = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const maxChart = Math.max(...chartData.map((d) => d.value));
  const chartWidth = 600;
  const chartHeight = 160;

  const categoryColors: Record<string, string> = {
    "Sangat Pendek": "#EF4444",
    "Pendek": "#F59E0B",
    "Sedang": "#10B981",
    "Panjang": "#3B82F6",
    "Sangat Panjang": "#8B5CF6",
    "Mathematics": "#EF4444",
    "History": "#F59E0B",
    "Physics": "#3B82F6",
  };

  const getCatColor = (cat: string) => categoryColors[cat] || "var(--accent-blue)";

  function formatTimestamp(d: Date) {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return `Today, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    if (diff < 172800000) return `Yesterday, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + `, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}
        >
          <div>
            <h1 style={{ fontSize: "2.2rem", marginBottom: 4 }}>Learning Analytics</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Review your historical focus patterns and AI-driven efficiency metrics.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", cursor: "pointer", fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>
              <FileText size={14} /> Export PDF
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent-blue)", color: "white", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
              <Download size={14} /> Download Report
            </button>
          </div>
        </motion.div>

        {/* Period Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem" }}>
          {(["Today", "Weekly", "Monthly"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: "6px 18px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 500, border: "1px solid var(--border-color)", cursor: "pointer", background: period === p ? "var(--accent-blue)" : "transparent", color: period === p ? "white" : "var(--text-secondary)" }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Streak + Chart Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid-streak" style={{ marginBottom: "1.5rem" }}
        >
          {/* Streak Card */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Current Streak</span>
              <Flame size={18} color="#EF4444" />
            </div>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>
              <span style={{ color: "var(--accent-blue)" }}>12</span> <span style={{ fontSize: "1rem", fontWeight: 500 }}>Days</span>
            </p>
            <div style={{ width: "100%", height: 4, background: "var(--border-color)", borderRadius: 2, marginBottom: 8, marginTop: 12 }}>
              <div style={{ width: "80%", height: "100%", background: "var(--accent-blue)", borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--accent-blue)" }}>3 days until your next milestone</p>
          </div>

          {/* Productivity Trend */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Productivity Trend</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--accent-blue)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-blue)" }} /> Focus Score
              </div>
            </div>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} style={{ width: "100%" }}>
              {/* Area */}
              <path
                d={`M0,${chartHeight} ${chartData.map((d, i) => `L${(i / (chartData.length - 1)) * chartWidth},${chartHeight - (d.value / maxChart) * chartHeight}`).join(" ")} L${chartWidth},${chartHeight} Z`}
                fill="var(--accent-blue)" opacity={0.06}
              />
              {/* Line */}
              <path
                d={chartData.map((d, i) => `${i === 0 ? "M" : "L"}${(i / (chartData.length - 1)) * chartWidth},${chartHeight - (d.value / maxChart) * chartHeight}`).join(" ")}
                fill="none" stroke="var(--accent-blue)" strokeWidth={2}
              />
              {/* Points */}
              {chartData.map((d, i) => (
                <circle key={i}
                  cx={(i / (chartData.length - 1)) * chartWidth}
                  cy={chartHeight - (d.value / maxChart) * chartHeight}
                  r={4} fill="var(--accent-blue)" stroke="white" strokeWidth={2}
                />
              ))}
              {/* Labels */}
              {chartData.map((d, i) => (
                <text key={i} x={(i / (chartData.length - 1)) * chartWidth} y={chartHeight + 16} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{d.day}</text>
              ))}
            </svg>
          </div>
        </motion.div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--border-color)", marginBottom: "1.5rem" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Weekly Activity Heatmap</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Less {heatmapColors.map((c, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: i === 0 ? "1px solid var(--border-color)" : "none" }} />)} More
            </div>
          </div>
          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(7, 1fr)`, gap: 4, marginBottom: 4 }}>
            {weekDays.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>{d}</div>
            ))}
          </div>
          {/* Heatmap grid */}
          {heatmap.map((week, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
              {week.map((val, di) => (
                <motion.div key={di} whileHover={{ scale: 1.1 }}
                  style={{ aspectRatio: "1.5", borderRadius: "var(--radius-sm)", background: heatmapColors[val], border: val === 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer" }}
                  title={`${weekDays[di]}: Level ${val}`}
                />
              ))}
            </div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid-stats-3" style={{ marginBottom: "1.5rem" }}
        >
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border-color)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Productivity Score</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>88% <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 500, fontFamily: "Inter" }}>+4.2</span></p>
            <p style={{ fontSize: "0.72rem", color: "var(--accent-blue)", marginTop: 4 }}>↗ Above average this week</p>
          </div>
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border-color)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Session Completion</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>24<span style={{ fontWeight: 400, color: "var(--text-muted)" }}>/28</span></p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, background: "var(--border-color)", borderRadius: 2 }}>
                <div style={{ width: "85%", height: "100%", background: "var(--accent-blue)", borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>85%</span>
            </div>
          </div>
          <div style={{ background: "var(--accent-blue)", borderRadius: "var(--radius-lg)", padding: "1.25rem", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>AI Recommendation</span>
            </div>
            <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>Based on your history, you are 24% more focused during evening sessions for Complexity Level 8+ tasks.</p>
          </div>
        </motion.div>

        {/* Session Records */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.3rem" }}>Session Records</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "6px 14px" }}>
                <Search size={14} color="var(--text-muted)" />
                <input type="text" placeholder="Search sessions..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: "none", outline: "none", background: "none", fontSize: "0.82rem", color: "var(--text-primary)", width: 140 }}
                />
              </div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", cursor: "pointer", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    {["Timestamp", "Category", "Focus", "Fatigue", "Complexity", "Rec. Duration", "Action"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", textAlign: "left", fontFamily: "Inter, sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.map((session) => (
                    <tr key={session.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "var(--text-primary)" }}>{formatTimestamp(session.timestamp)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "3px 12px", borderRadius: 16, fontSize: "0.72rem", fontWeight: 600, background: `${getCatColor(session.category)}18`, color: getCatColor(session.category) }}>{session.category}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.82rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {session.focus >= 70 ? <Eye size={12} color="var(--success)" /> : session.focus >= 40 ? <Eye size={12} color="var(--warning)" /> : <AlertTriangle size={12} color="var(--danger)" />}
                          {session.focus}%
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: session.fatigue >= 70 ? "var(--danger)" : "var(--text-secondary)" }}>
                        {session.fatigue >= 70 ? "High" : session.fatigue >= 40 ? "Medium" : "Low"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ width: 6, height: 14, borderRadius: 1, background: i < Math.ceil(session.complexity / 20) ? "var(--accent-blue)" : "var(--border-color)" }} />
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{session.duration} min</td>
                      <td style={{ padding: "14px 16px" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} sessions</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                  style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", opacity: currentPage === 1 ? 0.4 : 1 }}
                ><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                  style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", opacity: currentPage === totalPages ? 0.4 : 1 }}
                ><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
