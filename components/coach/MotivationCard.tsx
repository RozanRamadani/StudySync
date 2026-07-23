"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";

interface MotivationCardProps {
  input: { focus: number; fatigue: number; complexity: number };
}

export function MotivationCard({ input }: MotivationCardProps) {
  
  const messages = useMemo(() => {
    let msgs: string[] = [];
    
    if (input.focus >= 70) {
      msgs = [
        "You're ready for deep work. Take advantage of your current concentration.",
        "Your focus is incredibly sharp right now. Dive into the hardest material first.",
        "High focus detected! This is the perfect time for complex problem-solving."
      ];
    } else if (input.fatigue >= 70) {
      msgs = [
        "Your body needs recovery. A short break now can improve your learning quality.",
        "Don't push too hard. Rest is a crucial part of memory consolidation.",
        "High fatigue is completely normal. Take it easy and stick to lighter reviews."
      ];
    } else if (input.complexity >= 70) {
      msgs = [
        "Challenging topics require persistence. Small consistent progress is better than rushing.",
        "It's okay to feel stuck. Break the complex concepts down into smaller, digestible pieces.",
        "Hard material builds strong mental muscles. You've got this!"
      ];
    } else {
      msgs = [
        "Consistent pacing wins the race. Stay focused and follow the plan.",
        "Every minute of focused study brings you closer to your goal.",
        "You're in a great state for steady, productive learning."
      ];
    }
    
    return msgs;
  }, [input]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate messages every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 rounded-2xl border border-border-color shadow-sm h-full relative overflow-hidden flex flex-col justify-center">
      <Quote size={40} className="text-white/10 absolute top-4 left-4" />
      
      <div className="relative z-10">
        <span className="text-[10px] text-accent-blue font-bold uppercase tracking-wider mb-2 block">AI Motivation</span>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5 }}
            className="text-lg font-serif text-white leading-relaxed italic"
          >
            "{messages[currentIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Indicators */}
      <div className="flex gap-1.5 mt-6 z-10 relative">
        {messages.map((_, idx) => (
          <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-4 bg-accent-blue' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}
