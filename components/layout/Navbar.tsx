"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, User, Menu, X, LogOut, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/app/actions/auth";
import { useStudySync } from "@/components/providers/StudySyncProvider";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/calculator", label: "Rekomendasi Belajar" },
  { href: "/fuzzy-logic", label: "Logika Fuzzy" },
  { href: "/study-tips", label: "Tips Belajar" },
  { href: "/history", label: "Riwayat" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { sessions } = useStudySync();

  const isClientReady = typeof window !== 'undefined';
  const syncStatus = sessions.some(s => s.syncStatus === "syncing")
    ? "syncing"
    : sessions.some(s => s.syncStatus === "failed")
    ? "failed"
    : "synced";

  return (
    <nav className="bg-bg-secondary border-b border-border-color sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
            <circle cx="14" cy="14" r="12" stroke="var(--accent-blue)" strokeWidth="2" />
            <circle cx="14" cy="14" r="6" fill="var(--accent-blue)" opacity="0.2" />
            <circle cx="14" cy="14" r="3" fill="var(--accent-blue)" />
            <path d="M14 2 L14 6" stroke="var(--accent-blue)" strokeWidth="1.5" />
            <path d="M14 22 L14 26" stroke="var(--accent-blue)" strokeWidth="1.5" />
            <path d="M2 14 L6 14" stroke="var(--accent-blue)" strokeWidth="1.5" />
            <path d="M22 14 L26 14" stroke="var(--accent-blue)" strokeWidth="1.5" />
          </svg>
          <span className="font-serif text-xl font-bold text-accent-blue">
            StudySync
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? "text-accent-blue underline underline-offset-[6px] decoration-2" 
                    : "text-text-secondary hover:text-accent-blue"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center mr-2" title={`Sync Status: ${syncStatus}`}>
            {syncStatus === "syncing" && <RefreshCw size={18} className="text-accent-blue animate-spin" />}
            {syncStatus === "synced" && <Cloud size={18} className="text-success" />}
            {syncStatus === "failed" && <CloudOff size={18} className="text-danger" />}
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-border-color bg-transparent flex items-center justify-center cursor-pointer text-text-secondary transition-all duration-200 hover:bg-bg-tertiary"
            aria-label="Ganti Tema"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent-blue-soft text-accent-blue flex items-center justify-center font-semibold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => signout()}
                className="w-10 h-10 rounded-full border border-border-color bg-transparent flex items-center justify-center cursor-pointer text-danger transition-all duration-200 hover:bg-bg-tertiary"
                title="Keluar"
                aria-label="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-blue text-white text-sm font-semibold no-underline hover:bg-accent-blue-hover transition-colors"
            >
              <User size={16} />
              Masuk
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-full border border-border-color bg-transparent flex items-center justify-center cursor-pointer text-text-secondary md:hidden transition-colors hover:bg-bg-tertiary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-color bg-bg-secondary md:hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-base font-medium py-2 no-underline ${
                      isActive ? "text-accent-blue" : "text-text-secondary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
