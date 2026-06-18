"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Timer, Brain, BookOpen, Repeat, Layers, Bookmark, CheckCircle2 } from "lucide-react";

const categories = ["Semua Metode", "Retensi", "Manajemen Waktu", "Daya Ingat"];

const studyMethods = [
  {
    id: 1, icon: <Timer size={22} />, title: "Teknik Pomodoro", badge: "PILIHAN UTAMA",
    description: "Metode manajemen waktu yang menggunakan pengatur waktu untuk membagi pekerjaan menjadi jeda, biasanya berdurasi 25 menit.",
    tags: ["Pemula", "Siklus 25-menit"], effectiveness: 85, category: "Manajemen Waktu",
  },
  {
    id: 2, icon: <Brain size={22} />, title: "Fokus Mendalam",
    description: "Tingkat fokus profesional yang dilakukan tanpa gangguan untuk mendorong kemampuan kognitif Anda.",
    tags: ["Lanjutan", "Sesi 90+ menit"], effectiveness: 95, category: "Manajemen Waktu",
  },
  {
    id: 3, icon: <BookOpen size={22} />, title: "Pengingat Aktif", badge: "DIREKOMENDASIKAN",
    description: "Menguji diri sendiri dengan mengambil informasi secara aktif dari ingatan alih-alih cuma membaca ulang catatan secara pasif.",
    tags: ["Menengah", "Trik Ingatan"], effectiveness: 98, category: "Retensi",
  },
  {
    id: 4, icon: <Layers size={22} />, title: "The Feynman Technique", image: true,
    description: "Berasal dari nama fisikawan pemenang Hadiah Nobel Richard Feynman, metode ini menjelaskan konsep dengan menggunakan bahasa yang lebih simpel untuk melihat apa yang kurang dari konsep yang di pelajari.",
    tags: ["Semua Level", "Penguasaan Konsep"], effectiveness: 92, category: "Retensi",
  },
  {
    id: 5, icon: <Repeat size={22} />, title: "Pengulangan Berjarak",
    description: "Menyampaikan ulang informasi dengan interval yang lebih panjang untuk memerangi kurva melupakan untuk ingatan jangka panjang.",
    tags: ["Jangka panjang", "Usaha Konsisten"], effectiveness: 97, category: "Daya Ingat",
  },
  {
    id: 6, icon: <Brain size={22} />, title: "Blurting Method",
    description: "Menulis ulang semua hal yang teringat di kepala dari suatu topik, kemudian menyesuaikannya bersama catatan sebenarnya.",
    tags: ["Pemula", "Evaluasi cepat"], effectiveness: 82, category: "Daya Ingat",
  },
];

export default function StudyTipsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua Metode");
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  const filtered = studyMethods.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "Semua Metode" || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const toggleBookmark = (id: number) => {
    setBookmarked((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  return (
    <div className="page-wrapper px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="w-full">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 font-serif">Kuasai Pembelajaran Anda</h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">
            Temukan metodologi berbasis bukti yang dikurasi oleh AI kami untuk mengubah potensi akademis Anda. Teknik yang didukung sains untuk pelajar modern.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center"
        >
          <div className="flex-1 w-full min-w-[250px] flex items-center gap-2.5 bg-bg-secondary border border-border-color rounded-lg px-4 py-2.5 shadow-sm">
            <Search size={16} className="text-text-muted" />
            <input type="text" placeholder="Cari metode (contoh. Memori, Fokus...)" value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary w-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap transition-all duration-200 ${activeCategory === cat ? 'bg-accent-blue text-white border-accent-blue shadow-sm' : 'bg-transparent text-text-secondary border-border-color hover:bg-bg-tertiary'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Study Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((method, i) => (
            <motion.div key={method.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
              className={`bg-bg-secondary rounded-2xl border border-border-color overflow-hidden flex flex-col cursor-pointer transition-shadow duration-300 ${!method.image ? 'p-6' : ''}`}
            >
              {method.image && (
                <div className="h-36 bg-gradient-to-br from-[#f5f0e8] to-[#e8ddd0] flex items-center justify-center">
                  <span className="text-5xl drop-shadow-md">📝</span>
                </div>
              )}
              <div className={`${method.image ? 'p-5' : ''} flex-1 flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="text-accent-blue">{method.icon}</div>
                    {method.badge && (
                      <span className="text-[10px] font-bold text-accent-blue bg-accent-blue-light px-2 py-0.5 rounded-full tracking-wider uppercase">{method.badge}</span>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(method.id); }}
                    className={`bg-transparent border-none cursor-pointer p-1 rounded-full transition-colors ${bookmarked.includes(method.id) ? 'text-accent-blue' : 'text-text-muted hover:bg-bg-tertiary'}`}
                    aria-label="Bookmark"
                  >
                    <Bookmark size={18} fill={bookmarked.includes(method.id) ? "var(--accent-blue)" : "none"} />
                  </button>
                </div>

                <h3 className="text-lg font-semibold mb-2 font-serif">{method.title}</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed flex-1 mb-4">{method.description}</p>

                <div className="flex gap-2 flex-wrap mb-4">
                  {method.tags.map((tag) => (
                    <span key={tag} className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-border-color text-text-muted">{tag}</span>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-[10px] sm:text-xs text-text-muted mb-1.5 uppercase tracking-wider font-semibold">
                    <span>Tingkat Efektivitas</span>
                    <span className="text-accent-blue">{method.effectiveness}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-border-color rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${method.effectiveness}%` }} transition={{ duration: 0.8, delay: 0.1 * i }}
                      className="h-full bg-accent-blue rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Daily Study Insights Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-bg-tertiary rounded-2xl p-6 sm:p-10 lg:p-12 mb-8 shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-bg-secondary px-3.5 py-1 rounded-full text-xs font-bold text-accent-blue mb-4 border border-border-color shadow-sm">
                ✨ Wawasan Generasi AI
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-serif">Wawasan Belajar Harian</h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
                Setiap pagi, AI kami menganalisis tren akademis dan riset ilmu kognitif untuk memberikan satu langkah praktis untuk meningkatkan efisiensi Anda.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {["Saran terpersonalisasi berdasarkan jurusan dan kebiasaan belajar Anda.", "Rangkuman mingguan skor fokus dan matriks memori Anda."].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <CheckCircle2 size={18} className="text-accent-blue shrink-0 mt-0.5" /> 
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" placeholder="Masukkan email Anda"
                  className="flex-1 px-4 py-3 rounded-xl border border-border-color bg-bg-secondary text-sm text-text-primary outline-none focus:border-accent-blue transition-colors w-full"
                />
                <button className="px-6 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-xl border-none text-sm font-semibold cursor-pointer transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
                  Berlangganan Sekarang
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-text-muted mt-3">Bergabung bersama 15.000+ pelajar lainnya untuk membawa performa pembelajaran kalian ke level selanjutnya.</p>
            </div>
            <div className="bg-gradient-to-br from-[#d4c5a9] to-[#b8a88a] rounded-2xl h-48 sm:h-64 md:h-full min-h-[250px] flex items-center justify-center shadow-inner">
              <motion.span 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-6xl sm:text-7xl drop-shadow-lg"
              >
                💻
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
