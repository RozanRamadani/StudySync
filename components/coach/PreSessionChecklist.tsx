"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, ListTodo } from "lucide-react";

interface PreSessionChecklistProps {
  onCompletionChange: (isComplete: boolean) => void;
}

export function PreSessionChecklist({ onCompletionChange }: PreSessionChecklistProps) {
  const [items, setItems] = useState([
    { id: 1, label: "Water Ready", checked: false },
    { id: 2, label: "Phone Silent / Away", checked: false },
    { id: 3, label: "Learning Material Ready", checked: false },
    { id: 4, label: "Comfortable Workspace", checked: false },
  ]);

  const allChecked = items.every((i) => i.checked);

  useEffect(() => {
    onCompletionChange(allChecked);
  }, [allChecked, onCompletionChange]);

  const toggleItem = (id: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <ListTodo size={20} className="text-accent-blue" />
        <h3 className="text-lg font-bold font-serif">Pre-Session Checklist</h3>
      </div>
      
      <p className="text-xs text-text-secondary mb-4">
        Ensure you have a distraction-free environment before starting the timer.
      </p>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleItem(item.id)}
            className={`flex items-center gap-3 w-full text-left p-3 rounded-xl border transition-colors ${item.checked ? 'bg-accent-blue-soft/20 border-accent-blue text-accent-blue' : 'bg-bg-primary border-border-color text-text-primary hover:border-accent-blue/50'}`}
          >
            {item.checked ? <CheckSquare size={18} /> : <Square size={18} className="text-text-muted" />}
            <span className={`text-sm font-medium ${item.checked ? 'line-through opacity-70' : ''}`}>{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
