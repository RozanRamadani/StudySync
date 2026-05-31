"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Search, Filter, Flame, TrendingUp, ChevronLeft, ChevronRight, Sparkles, MoreVertical, AlertTriangle, Eye, Loader2, BrainCircuit, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useStudySync, StudySession } from "@/components/providers/StudySyncProvider";

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const heatmapColors = ["var(--bg-primary)", "#DBEAFE", "#93C5FD", "#3B82F6", "#1D4ED8"];

function normalizeDate(d: Date) {
  const norm = new Date(d);
  norm.setHours(0, 0, 0, 0);
  return norm.getTime();
}

function calculateAnalytics(sessions: StudySession[]) {
  const now = new Date();
  const todayVal = normalizeDate(now);
  const oneDay = 86400000;

  const dayMap = new Map<number, StudySession[]>();
  sessions.forEach(s => {
    const dVal = normalizeDate(s.timestamp);
    if (!dayMap.has(dVal)) dayMap.set(dVal, []);
    dayMap.get(dVal)!.push(s);
  });

  // Calculate Streak
  let streak = 0;
  let checkVal = todayVal;
  
  if (!dayMap.has(checkVal)) {
    checkVal -= oneDay; // start checking from yesterday if no session today
  }
  
  while (dayMap.has(checkVal) && dayMap.get(checkVal)!.length > 0) {
    streak++;
    checkVal -= oneDay;
  }

  // Calculate Focus Efficiency (avg confidence)
  const totalConf = sessions.reduce((acc, s) => acc + s.confidence, 0);
  const avgConfidence = sessions.length ? Math.round(totalConf / sessions.length) : 0;

  // Week Productivity vs Last Week
  const thisWeekStart = todayVal - (7 * oneDay);
  const lastWeekStart = thisWeekStart - (7 * oneDay);
  
  let thisWeekFocusSum = 0;
  let thisWeekCount = 0;
  let lastWeekFocusSum = 0;
  let lastWeekCount = 0;

  sessions.forEach(s => {
    const t = s.timestamp.getTime();
    if (t >= thisWeekStart) {
      thisWeekFocusSum += s.focus;
      thisWeekCount++;
    } else if (t >= lastWeekStart && t < thisWeekStart) {
      lastWeekFocusSum += s.focus;
      lastWeekCount++;
    }
  });

  const thisWeekAvg = thisWeekCount ? Math.round(thisWeekFocusSum / thisWeekCount) : 0;
  const lastWeekAvg = lastWeekCount ? Math.round(lastWeekFocusSum / lastWeekCount) : 0;
  const diff = thisWeekAvg - lastWeekAvg;

  // Chart Data (Last 7 days, ascending)
  const chartData = [];
  const standardDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  for (let i = 6; i >= 0; i--) {
    const dVal = todayVal - (i * oneDay);
    const dDate = new Date(dVal);
    const dayLabel = standardDays[dDate.getDay()];
    const daySessions = dayMap.get(dVal) || [];
    const avgFocus = daySessions.length ? Math.round(daySessions.reduce((acc, s) => acc + s.focus, 0) / daySessions.length) : 0;
    chartData.push({ day: dayLabel, value: avgFocus });
  }

  // Heatmap Data (4 weeks * 7 days) mapped to Mon-Sun cols
  const heatmap: number[][] = [];
  const currDay = now.getDay(); 
  const daysSinceMonday = currDay === 0 ? 6 : currDay - 1; 
  const thisMondayVal = todayVal - (daysSinceMonday * oneDay);
  const hmStart = thisMondayVal - (21 * oneDay); // go back exactly 3 prior weeks + this week = 4 weeks
  
  for (let w = 0; w < 4; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const dVal = hmStart + ((w * 7 + d) * oneDay);
      if (dVal > todayVal) {
        row.push(0);
        continue;
      }
      const ct = (dayMap.get(dVal) || []).length;
      let intensity = 0;
      if (ct === 1) intensity = 1;
      else if (ct === 2) intensity = 2;
      else if (ct >= 3 && ct <= 4) intensity = 3;
      else if (ct > 4) intensity = 4;
      row.push(intensity);
    }
    heatmap.push(row);
  }

  return { streak, avgConfidence, thisWeekAvg, diff, chartData, heatmap, totalSessions: sessions.length, thisWeekCount };
}

export default function HistoryPage() {
  const { sessions, isLoadingSessions } = useStudySync();
  const [period, setPeriod] = useState<"Hari Ini" | "Mingguan" | "Bulanan">("Mingguan");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { streak, avgConfidence, thisWeekAvg, diff, chartData, heatmap, totalSessions, thisWeekCount } = useMemo(() => calculateAnalytics(sessions), [sessions]);

  const filtered = sessions.filter((s) =>
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.duration.toString().includes(searchTerm)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginatedSessions = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const maxChart = Math.max(...chartData.map((d) => d.value), 10); // ensure we don't divide by 0
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
    if (diff < 86400000) return `Hari Ini, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    if (diff < 172800000) return `Kemarin, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("id-ID", { month: "short", day: "numeric" }) + `, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}
        >
          <div>
            <h1 style={{ fontSize: "2.2rem", marginBottom: 4 }}>Analitik Belajar</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Tinjau pola fokus historis Anda dan metrik efisiensi berbasis AI.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {isLoadingSessions && <Loader2 className="animate-spin" size={18} color="var(--accent-blue)" style={{ alignSelf: "center", marginRight: "1rem" }} />}
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", cursor: "pointer", fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500 }}>
              <FileText size={14} /> Ekspor PDF
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent-blue)", color: "white", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
              <Download size={14} /> Unduh Laporan
            </button>
          </div>
        </motion.div>

        {/* Period Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem" }}>
          {(["Hari Ini", "Mingguan", "Bulanan"] as const).map((p) => (
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
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Konsistensi Belajar</span>
              <Flame size={18} color={streak > 0 ? "#EF4444" : "var(--text-muted)"} />
            </div>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>
              <span style={{ color: "var(--accent-blue)" }}>{streak}</span> <span style={{ fontSize: "1rem", fontWeight: 500 }}>Hari</span>
            </p>
            <div style={{ width: "100%", height: 4, background: "var(--border-color)", borderRadius: 2, marginBottom: 8, marginTop: 12 }}>
              <div style={{ width: `${Math.min((streak % 7) / 7 * 100, 100)}%`, height: "100%", background: "var(--accent-blue)", borderRadius: 2, transition: "width 0.5s" }} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--accent-blue)" }}>{7 - (streak % 7)} hari menuju pencapaian selanjutnya</p>
          </div>

          {/* Productivity Trend */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Tren Produktivitas</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--accent-blue)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-blue)" }} /> Skor Fokus
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
            <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Heatmap Aktivitas Mingguan</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Kurang {heatmapColors.map((c, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: i === 0 ? "1px solid var(--border-color)" : "none" }} />)} Lebih
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
            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Weekly Avg Focus</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{thisWeekAvg}% <span style={{ fontSize: "0.75rem", color: diff >= 0 ? "var(--success)" : "var(--danger)", fontWeight: 500, fontFamily: "Inter" }}>{diff >= 0 ? `+${diff}` : diff}</span></p>
            <p style={{ fontSize: "0.72rem", color: "var(--accent-blue)", marginTop: 4 }}>{diff >= 0 ? "↗ Above" : "↘ Below"} average from last week</p>
          </div>
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border-color)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Focus Efficiency (Conf.)</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{avgConfidence}%</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 4, background: "var(--border-color)", borderRadius: 2 }}>
                <div style={{ width: `${avgConfidence}%`, height: "100%", background: "var(--accent-blue)", borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{totalSessions} Session{totalSessions !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div style={{ background: "var(--accent-blue)", borderRadius: "var(--radius-lg)", padding: "1.25rem", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} />
              <span style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>AI Insights</span>
            </div>
            <p style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
              {totalSessions === 0 
                ? "Start studying to get personalized insights from the Mamdani engine."
                : `You've completed ${thisWeekCount} session${thisWeekCount !== 1 ? 's' : ''} in the last 7 days. Your focus peaks around an average of ${thisWeekAvg}%.`
              }
            </p>
          </div>
        </motion.div>

        {/* Session Records */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.3rem" }}>Riwayat Sesi</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "6px 14px" }}>
                <Search size={14} color="var(--text-muted)" />
                <input type="text" placeholder="Cari sesi..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ border: "none", outline: "none", background: "none", fontSize: "0.82rem", color: "var(--text-primary)", width: 140 }}
                />
              </div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", cursor: "pointer", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                <Filter size={14} /> Saring
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    {["Status", "Waktu", "Kategori", "Fokus", "Lelah", "Kompleksitas", "Durasi Rek.", "Aksi"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", textAlign: "left", fontFamily: "Inter, sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "3rem", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                          {isLoadingSessions ? (
                             <Loader2 size={32} className="animate-spin" color="var(--accent-blue)" />
                          ) : (
                             <>
                               <BrainCircuit size={40} color="var(--border-color)" />
                               <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Belum ada sesi belajar. Pergi ke Kalkulator untuk memulai sesi pertama Anda.</span>
                             </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSessions.map((session) => (
                      <tr key={session.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "14px 16px", fontSize: "0.82rem" }}>
                          {session.syncStatus === "syncing" && <RefreshCw size={14} color="var(--accent-blue)" className="animate-spin" title="Syncing" />}
                          {session.syncStatus === "synced" && <Cloud size={14} color="var(--success, #10B981)" title="Synced with cloud" />}
                          {session.syncStatus === "failed" && <CloudOff size={14} color="var(--danger, #EF4444)" title="Sync failed" />}
                        </td>
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
                          {session.fatigue >= 70 ? "Tinggi" : session.fatigue >= 40 ? "Sedang" : "Rendah"}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Menampilkan {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} dari {filtered.length} sesi</span>
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
