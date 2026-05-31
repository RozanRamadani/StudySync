"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <div className="page-wrapper" style={{ minHeight: "calc(100vh - 72px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--bg-secondary)",
          padding: "2.5rem",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", fontFamily: "'Playfair Display', serif" }}>Buat Akun</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Mulai perjalanan belajar berbasis AI Anda.</p>
        </div>

        {state?.error && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={16} />
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "8px", color: "var(--text-primary)" }}>Nama Lengkap</label>
            <div style={{ position: "relative" }}>
              <User size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                name="fullName" 
                required 
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "8px", color: "var(--text-primary)" }}>Alamat Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="student@example.com"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, marginBottom: "8px", color: "var(--text-primary)" }}>Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "0.5rem",
              borderRadius: "var(--radius-md)",
              background: "var(--accent-blue)",
              color: "white",
              border: "none",
              cursor: isPending ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : "Buat Akun"}
            {!isPending && <ArrowRight size={16} />}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>
            Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  );
}