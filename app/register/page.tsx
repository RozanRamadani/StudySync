"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <div className="page-wrapper min-h-[calc(100vh_-_72px)] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bg-secondary p-6 sm:p-10 rounded-2xl border border-border-color shadow-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl mb-2 font-serif font-bold text-text-primary">Buat Akun</h1>
          <p className="text-sm text-text-secondary">Mulai perjalanan belajar berbasis AI Anda.</p>
        </div>

        {state?.error && (
          <div className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-200 dark:border-red-800">
            <AlertCircle size={16} className="shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-primary">Nama Lengkap</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                name="fullName" 
                required 
                placeholder="John Doe"
                className="w-full py-3 pr-4 pl-10 rounded-xl border border-border-color bg-bg-primary text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-primary">Alamat Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="student@example.com"
                className="w-full py-3 pr-4 pl-10 rounded-xl border border-border-color bg-bg-primary text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-primary">Kata Sandi</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                className="w-full py-3 pr-4 pl-10 rounded-xl border border-border-color bg-bg-primary text-text-primary text-sm outline-none focus:border-accent-blue transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full py-3.5 mt-2 rounded-xl bg-accent-blue text-white border-none cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-accent-blue-hover ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : "Buat Akun"}
            {!isPending && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-accent-blue font-semibold no-underline hover:underline">
            Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  );
}