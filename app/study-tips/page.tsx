"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Timer, Brain, BookOpen, Repeat, Layers, Bookmark, CheckCircle2 } from "lucide-react";

const categories = ["All Methods", "Retention", "Time Management", "Memory"];

const studyMethods = [
  {
    id: 1, icon: <Timer size={22} />, title: "Pomodoro Technique", badge: "TOP PICK",
    description: "A time management method that uses a timer to break work into intervals, traditionally 25 minutes in length.",
    tags: ["Beginner", "25-min cycles"], effectiveness: 85, category: "Time Management",
  },
  {
    id: 2, icon: <Brain size={22} />, title: "Deep Work",
    description: "Professional activities performed in a state of distraction-free concentration that push your cognitive capabilities.",
    tags: ["Advanced", "90+ min sessions"], effectiveness: 95, category: "Time Management",
  },
  {
    id: 3, icon: <BookOpen size={22} />, title: "Active Recall", badge: "RECOMMENDED",
    description: "Testing yourself as you learn by actively retrieving information from memory instead of passively reviewing notes.",
    tags: ["Intermediate", "Memory hack"], effectiveness: 98, category: "Retention",
  },
  {
    id: 4, icon: <Layers size={22} />, title: "The Feynman Technique", image: true,
    description: "Named after Nobel Prize-winning physicist Richard Feynman, this method involves explaining a concept in simple terms as if teaching it to a child to identify gaps in your knowledge.",
    tags: ["All Levels", "Conceptual Mastery"], effectiveness: 92, category: "Retention",
  },
  {
    id: 5, icon: <Repeat size={22} />, title: "Spaced Repetition",
    description: "Reviewing information at increasing intervals to combat the forgetting curve and solidify long-term retention.",
    tags: ["Long-term", "Consistent Effort"], effectiveness: 97, category: "Memory",
  },
  {
    id: 6, icon: <Brain size={22} />, title: "Blurting Method",
    description: "Writing everything you know about a topic from memory, then checking against notes to identify knowledge gaps.",
    tags: ["Beginner", "Quick assessment"], effectiveness: 82, category: "Memory",
  },
];

export default function StudyTipsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Methods");
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  const filtered = studyMethods.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All Methods" || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const toggleBookmark = (id: number) => {
    setBookmarked((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: 8 }}>Master Your Learning</h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 550 }}>
            Discover evidence-based methodologies curated by our AI to transform your academic potential. Science-backed techniques for the modern scholar.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}
        >
          <div style={{ flex: 1, minWidth: 250, display: "flex", alignItems: "center", gap: 10, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "10px 16px" }}>
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search methods (e.g. Memory, Focus...)" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: "0.85rem", color: "var(--text-primary)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: "8px 18px", borderRadius: 24, fontSize: "0.8rem", fontWeight: 500, border: "1px solid var(--border-color)", cursor: "pointer", background: activeCategory === cat ? "var(--accent-blue)" : "transparent", color: activeCategory === cat ? "white" : "var(--text-secondary)", transition: "all 0.2s", whiteSpace: "nowrap" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Study Methods Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
          {filtered.map((method, i) => (
            <motion.div key={method.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
              style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", padding: method.image ? 0 : "1.5rem", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "box-shadow 0.3s" }}
            >
              {method.image && (
                <div style={{ height: 140, background: "linear-gradient(135deg, #f5f0e8, #e8ddd0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "3rem" }}>📝</span>
                </div>
              )}
              <div style={{ padding: method.image ? "1.25rem" : 0, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: "var(--accent-blue)" }}>{method.icon}</div>
                    {method.badge && (
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent-blue)", background: "var(--accent-blue-light)", padding: "2px 8px", borderRadius: 10, letterSpacing: "0.03em" }}>{method.badge}</span>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(method.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: bookmarked.includes(method.id) ? "var(--accent-blue)" : "var(--text-muted)" }}
                  >
                    <Bookmark size={16} fill={bookmarked.includes(method.id) ? "var(--accent-blue)" : "none"} />
                  </button>
                </div>

                <h3 style={{ fontSize: "1.05rem", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>{method.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, flex: 1, marginBottom: 12 }}>{method.description}</p>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {method.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: "0.7rem", padding: "3px 10px", borderRadius: 16, border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>{tag}</span>
                  ))}
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <span>Effectiveness</span>
                    <span>{method.effectiveness}%</span>
                  </div>
                  <div style={{ width: "100%", height: 4, background: "var(--border-color)", borderRadius: 2 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${method.effectiveness}%` }} transition={{ duration: 0.8, delay: 0.1 * i }}
                      style={{ height: "100%", background: "var(--accent-blue)", borderRadius: 2 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Daily Study Insights Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-xl)", padding: "3rem 2rem", marginBottom: "2rem" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", alignItems: "center" }} className="grid-2col">
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--bg-secondary)", padding: "4px 14px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-blue)", marginBottom: 16, border: "1px solid var(--border-color)" }}>
                ✨ AI Generated Insights
              </span>
              <h2 style={{ fontSize: "2rem", marginBottom: 12 }}>Daily Study Insights</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
                Every morning, our AI analyzes academic trends and cognitive science research to provide you with one actionable study tip to boost your efficiency.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {["Personalized tips based on your major and study habits.", "Weekly summaries of your focus and retention metrics."].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={16} color="var(--accent-blue)" /> {item}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="email" placeholder="Enter your email"
                  style={{ flex: 1, padding: "10px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
                />
                <button style={{ padding: "10px 20px", background: "var(--accent-blue)", color: "white", borderRadius: "var(--radius-md)", border: "none", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>Subscribe Now</button>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 8 }}>Join 15,000+ students leveling up their learning game.</p>
            </div>
            <div style={{ background: "linear-gradient(135deg, #d4c5a9, #b8a88a)", borderRadius: "var(--radius-xl)", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "4rem" }}>💻</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
