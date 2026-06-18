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
    <div className="page-wrapper px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="w-full">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-1">Analitik Belajar</h1>
            <p className="text-sm text-text-secondary">Tinjau pola fokus historis Anda dan metrik efisiensi berbasis AI.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {isLoadingSessions && <Loader2 className="animate-spin text-accent-blue mr-2" size={18} />}
            <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary text-sm font-medium hover:bg-bg-tertiary transition-colors">
              <FileText size={14} /> Ekspor PDF
            </button>
            <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue hover:bg-accent-blue-hover text-white text-sm font-semibold transition-colors">
              <Download size={14} /> Unduh Laporan
            </button>
          </div>
        </motion.div>

        {/* Period Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {(["Hari Ini", "Mingguan", "Bulanan"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${period === p ? 'bg-accent-blue text-white border-accent-blue' : 'bg-transparent text-text-secondary border-border-color hover:bg-bg-tertiary'}`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Streak + Chart Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] gap-4 mb-6"
        >
          {/* Streak Card */}
          <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color shadow-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Konsistensi Belajar</span>
              <Flame size={18} color={streak > 0 ? "#EF4444" : "var(--text-muted)"} />
            </div>
            <p className="text-4xl lg:text-5xl font-bold font-serif mb-1">
              <span className="text-accent-blue">{streak}</span> <span className="text-base font-medium text-text-primary">Hari</span>
            </p>
            <div className="w-full h-1.5 bg-border-color rounded-full mb-2 mt-4 overflow-hidden">
              <div className="h-full bg-accent-blue rounded-full transition-all duration-500" style={{ width: `${Math.min((streak % 7) / 7 * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-accent-blue">{7 - (streak % 7)} hari menuju pencapaian selanjutnya</p>
          </div>

          {/* Productivity Trend */}
          <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color shadow-sm w-full overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Tren Produktivitas</span>
              <div className="flex items-center gap-1.5 text-xs text-accent-blue">
                <span className="w-2 h-2 rounded-full bg-accent-blue" /> Skor Fokus
              </div>
            </div>
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="min-w-[400px] w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-auto">
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
            </div>
          </div>
        </motion.div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-bg-secondary rounded-2xl p-6 border border-border-color mb-6 shadow-sm w-full overflow-x-auto scrollbar-hide"
        >
          <div className="min-w-[300px]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Heatmap Aktivitas Mingguan</span>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-text-muted">
                Kurang {heatmapColors.map((c, i) => <span key={i} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${i === 0 ? 'border border-border-color' : ''}`} style={{ background: c }} />)} Lebih
              </div>
            </div>
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-[10px] sm:text-xs text-text-muted font-medium">{d}</div>
              ))}
            </div>
            {/* Heatmap grid */}
            {heatmap.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((val, di) => (
                  <motion.div key={di} whileHover={{ scale: 1.1 }}
                    className={`aspect-[1.5] rounded-sm cursor-pointer ${val === 0 ? 'border border-border-color' : ''}`}
                    style={{ background: heatmapColors[val] }}
                    title={`${weekDays[di]}: Level ${val}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-bg-secondary rounded-xl p-5 border border-border-color shadow-sm">
            <p className="text-xs font-semibold text-text-muted uppercase mb-1">Weekly Avg Focus</p>
            <p className="text-3xl font-bold font-serif">{thisWeekAvg}% <span className={`text-xs font-medium font-sans ${diff >= 0 ? 'text-success' : 'text-danger'}`}>{diff >= 0 ? `+${diff}` : diff}</span></p>
            <p className="text-xs text-accent-blue mt-1">{diff >= 0 ? "↗ Above" : "↘ Below"} average from last week</p>
          </div>
          <div className="bg-bg-secondary rounded-xl p-5 border border-border-color shadow-sm">
            <p className="text-xs font-semibold text-text-muted uppercase mb-1">Focus Efficiency (Conf.)</p>
            <p className="text-3xl font-bold font-serif">{avgConfidence}%</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-border-color rounded-full overflow-hidden">
                <div className="h-full bg-accent-blue rounded-full" style={{ width: `${avgConfidence}%` }} />
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">{totalSessions} Session{totalSessions !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="bg-accent-blue rounded-xl p-5 text-white shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={14} />
              <span className="text-xs font-semibold uppercase">AI Insights</span>
            </div>
            <p className="text-sm leading-relaxed">
              {totalSessions === 0 
                ? "Start studying to get personalized insights from the Mamdani engine."
                : `You've completed ${thisWeekCount} session${thisWeekCount !== 1 ? 's' : ''} in the last 7 days. Your focus peaks around an average of ${thisWeekAvg}%.`
              }
            </p>
          </div>
        </motion.div>

        {/* Session Records */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-bold">Riwayat Sesi</h2>
            <div className="flex w-full sm:w-auto gap-2">
              <div className="flex-1 sm:flex-none flex items-center gap-2 bg-bg-secondary border border-border-color rounded-lg px-3 py-1.5">
                <Search size={14} className="text-text-muted" />
                <input type="text" placeholder="Cari sesi..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none outline-none text-sm w-full sm:w-32 text-text-primary"
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-color bg-bg-secondary text-text-secondary text-sm hover:bg-bg-tertiary transition-colors cursor-pointer">
                <Filter size={14} /> Saring
              </button>
            </div>
          </div>

          <div className="bg-bg-secondary rounded-2xl border border-border-color overflow-hidden shadow-sm w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border-color bg-bg-tertiary">
                    {["Status", "Waktu", "Kategori", "Fokus", "Lelah", "Kompleksitas", "Durasi Rek.", "Aksi"].map((h) => (
                      <th key={h} className="p-3 lg:p-4 text-left text-xs font-bold uppercase tracking-wider text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          {isLoadingSessions ? (
                             <Loader2 size={32} className="animate-spin text-accent-blue" />
                          ) : (
                             <>
                               <BrainCircuit size={40} className="text-border-color" />
                               <span className="text-sm text-text-muted">Belum ada sesi belajar. Pergi ke Kalkulator untuk memulai sesi pertama Anda.</span>
                             </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSessions.map((session) => (
                      <tr key={session.id} className="border-b border-border-light hover:bg-bg-tertiary transition-colors">
                        <td className="p-3 lg:p-4 text-sm">
                          {session.syncStatus === "syncing" && <RefreshCw size={14} className="text-accent-blue animate-spin" aria-label="Syncing" role="img" />}
                          {session.syncStatus === "synced" && <Cloud size={14} className="text-success" aria-label="Synced with cloud" role="img" />}
                          {session.syncStatus === "failed" && <CloudOff size={14} className="text-danger" aria-label="Sync failed" role="img" />}
                        </td>
                        <td className="p-3 lg:p-4 text-sm text-text-primary">{formatTimestamp(session.timestamp)}</td>
                        <td className="p-3 lg:p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${getCatColor(session.category)}18`, color: getCatColor(session.category) }}>{session.category}</span>
                        </td>
                        <td className="p-3 lg:p-4 text-sm">
                          <span className="flex items-center gap-1">
                            {session.focus >= 70 ? <Eye size={12} className="text-success" /> : session.focus >= 40 ? <Eye size={12} className="text-warning" /> : <AlertTriangle size={12} className="text-danger" />}
                            {session.focus}%
                          </span>
                        </td>
                        <td className={`p-3 lg:p-4 text-sm ${session.fatigue >= 70 ? 'text-danger' : 'text-text-secondary'}`}>
                          {session.fatigue >= 70 ? "Tinggi" : session.fatigue >= 40 ? "Sedang" : "Rendah"}
                        </td>
                        <td className="p-3 lg:p-4">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-1.5 h-3.5 rounded-sm ${i < Math.ceil(session.complexity / 20) ? 'bg-accent-blue' : 'bg-border-color'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="p-3 lg:p-4 text-sm font-semibold text-text-primary">{session.duration} min</td>
                        <td className="p-3 lg:p-4">
                          <button className="bg-transparent border-none cursor-pointer text-text-muted hover:text-text-primary transition-colors"><MoreVertical size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col">
              {paginatedSessions.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  {isLoadingSessions ? (
                     <Loader2 size={32} className="animate-spin text-accent-blue" />
                  ) : (
                     <>
                       <BrainCircuit size={40} className="text-border-color" />
                       <span className="text-sm text-text-muted">Belum ada sesi belajar. Pergi ke Kalkulator untuk memulai sesi pertama Anda.</span>
                     </>
                  )}
                </div>
              ) : (
                paginatedSessions.map((session) => (
                  <div key={session.id} className="p-4 border-b border-border-light flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {session.syncStatus === "syncing" && <RefreshCw size={14} className="text-accent-blue animate-spin" />}
                        {session.syncStatus === "synced" && <Cloud size={14} className="text-success" />}
                        {session.syncStatus === "failed" && <CloudOff size={14} className="text-danger" />}
                        <span className="text-sm font-semibold text-text-primary">{formatTimestamp(session.timestamp)}</span>
                      </div>
                      <button className="bg-transparent border-none text-text-muted"><MoreVertical size={16} /></button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${getCatColor(session.category)}18`, color: getCatColor(session.category) }}>{session.category}</span>
                      <span className="text-sm font-bold ml-auto">{session.duration} min</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border-light">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted uppercase mb-1">Fokus</span>
                        <span className="flex items-center gap-1 text-sm">
                          {session.focus >= 70 ? <Eye size={12} className="text-success" /> : session.focus >= 40 ? <Eye size={12} className="text-warning" /> : <AlertTriangle size={12} className="text-danger" />}
                          {session.focus}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted uppercase mb-1">Lelah</span>
                        <span className={`text-sm ${session.fatigue >= 70 ? 'text-danger' : 'text-text-secondary'}`}>
                          {session.fatigue >= 70 ? "Tinggi" : session.fatigue >= 40 ? "Sedang" : "Rendah"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted uppercase mb-1">Materi</span>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1.5 h-3 rounded-sm ${i < Math.ceil(session.complexity / 20) ? 'bg-accent-blue' : 'bg-border-color'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-border-color bg-bg-secondary">
              <span className="text-xs text-text-muted">
                Menampilkan {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filtered.length)} dari {filtered.length}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-md border border-border-color bg-bg-secondary flex items-center justify-center transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-bg-tertiary text-text-secondary'}`}
                ><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                  className={`w-8 h-8 rounded-md border border-border-color bg-bg-secondary flex items-center justify-center transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-bg-tertiary text-text-secondary'}`}
                ><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
