"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
}

export function Tooltip({ content, children, delay = 0.1 }: TooltipProps) {
  const [active, setActive] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, delay }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 text-zinc-100 text-[11px] rounded-lg shadow-md border border-zinc-800 min-w-[200px] pointer-events-none text-center leading-normal"
            style={{ x: "-50%" }}
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
