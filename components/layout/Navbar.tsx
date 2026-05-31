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
  { href: "/calculator", label: "Calculator" },
  { href: "/fuzzy-logic", label: "Fuzzy Logic" },
  { href: "/study-tips", label: "Study Tips" },
  { href: "/history", label: "History" },
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
    <nav
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background-color 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle cx="14" cy="14" r="12" stroke="var(--accent-blue)" strokeWidth="2" />
            <circle cx="14" cy="14" r="6" fill="var(--accent-blue)" opacity="0.2" />
            <circle cx="14" cy="14" r="3" fill="var(--accent-blue)" />
            <path d="M14 2 L14 6" stroke="var(--accent-blue)" strokeWidth="1.5" />
            <path d="M14 22 L14 26" stroke="var(--accent-blue)" strokeWidth="1.5" />
            <path d="M2 14 L6 14" stroke="var(--accent-blue)" strokeWidth="1.5" />
            <path d="M22 14 L26 14" stroke="var(--accent-blue)" strokeWidth="1.5" />
          </svg>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--accent-blue)",
            }}
          >
            StudySync
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
          className="hidden md:flex"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                  textDecorationLine: isActive ? "underline" : "none",
                  textUnderlineOffset: "6px",
                  textDecorationThickness: "2px",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.target as HTMLElement).style.color = "var(--accent-blue)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.target as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }} title={`Sync Status: ${syncStatus}`}>
            {syncStatus === "syncing" && <RefreshCw size={18} color="var(--accent-blue)" className="animate-spin" />}
            {syncStatus === "synced" && <Cloud size={18} color="var(--success, #10B981)" />}
            {syncStatus === "failed" && <CloudOff size={18} color="var(--danger, #EF4444)" />}
          </div>

          <button
            onClick={toggleTheme}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid var(--border-color)",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div 
                style={{ 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "50%", 
                  background: "var(--accent-blue-soft)", 
                  color: "var(--accent-blue)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.9rem"
                }}
              >
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => signout()}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--danger, #EF4444)",
                  transition: "all 0.2s ease",
                }}
                title="Sign out"
                aria-label="Sign out menu"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "20px",
                backgroundColor: "var(--accent-blue)",
                color: "white",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <User size={16} />
              Sign in
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid var(--border-color)",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
            className="md:hidden"
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
            style={{
              overflow: "hidden",
              borderTop: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
            }}
            className="md:hidden"
          >
            <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                      textDecoration: "none",
                      padding: "0.5rem 0",
                    }}
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
