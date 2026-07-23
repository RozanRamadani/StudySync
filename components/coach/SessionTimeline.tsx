"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Coffee, Repeat, ArrowRight, Calendar, Clock } from "lucide-react";

interface SessionTimelineProps {
  studyDuration: number;
  breakDuration: number;
  reviewDuration: number;
  nextSessionDuration: number;
  onFinishTimeCalculated: (time: string) => void;
}

export function SessionTimeline({ studyDuration, breakDuration, reviewDuration, nextSessionDuration, onFinishTimeCalculated }: SessionTimelineProps) {
  
  const [startTimeStr, setStartTimeStr] = useState<string>("");
  const [currentSystemTime, setCurrentSystemTime] = useState<Date>(new Date());

  useEffect(() => {
    // Just to have a stable current time if user doesn't input one
    setCurrentSystemTime(new Date());
  }, []);

  const { steps, finishTime } = useMemo(() => {
    let baseTime = currentSystemTime;
    if (startTimeStr) {
      const [hours, minutes] = startTimeStr.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        baseTime = new Date(currentSystemTime);
        baseTime.setHours(hours, minutes, 0, 0);
      }
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    let currentTime = new Date(baseTime);
    const studyStart = formatTime(currentTime);
    currentTime = new Date(currentTime.getTime() + studyDuration * 60000);
    const studyEnd = formatTime(currentTime);

    const breakStart = studyEnd;
    currentTime = new Date(currentTime.getTime() + breakDuration * 60000);
    const breakEnd = formatTime(currentTime);

    const reviewStart = breakEnd;
    currentTime = new Date(currentTime.getTime() + reviewDuration * 60000);
    const reviewEnd = formatTime(currentTime);

    const finish = reviewEnd;

    return {
      finishTime: finish,
      steps: [
        { id: "study", title: "Study", duration: studyDuration, icon: <BookOpen size={20} />, color: "bg-blue-500", shadow: "shadow-blue-500/20", start: studyStart, end: studyEnd },
        { id: "break", title: "Break", duration: breakDuration, icon: <Coffee size={20} />, color: "bg-green-500", shadow: "shadow-green-500/20", start: breakStart, end: breakEnd },
        { id: "review", title: "Review", duration: reviewDuration, icon: <Repeat size={20} />, color: "bg-purple-500", shadow: "shadow-purple-500/20", start: reviewStart, end: reviewEnd },
        { id: "next", title: "Next Session", duration: nextSessionDuration, icon: <Calendar size={20} />, color: "bg-orange-500", shadow: "shadow-orange-500/20", start: reviewEnd, end: "TBD" },
      ]
    };
  }, [studyDuration, breakDuration, reviewDuration, nextSessionDuration, startTimeStr, currentSystemTime]);

  // Lift state up
  useEffect(() => {
    onFinishTimeCalculated(finishTime);
  }, [finishTime, onFinishTimeCalculated]);

  return (
    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-color shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-bold font-serif flex items-center gap-2">
          <span className="bg-accent-blue text-white px-2 py-0.5 rounded text-xs">Today's</span>
          Study Plan
        </h3>
        
        <div className="flex items-center gap-2 bg-bg-primary px-3 py-1.5 rounded-lg border border-border-color">
          <Clock size={16} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-secondary">Start Time</span>
          <input 
            type="time" 
            value={startTimeStr} 
            onChange={(e) => setStartTimeStr(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-mono font-bold text-text-primary"
          />
        </div>
      </div>
      
      <div className="relative">
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-border-color -translate-y-1/2 z-0" />
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0 relative z-10">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col lg:flex-row items-center w-full lg:w-auto">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col items-center bg-bg-primary p-4 rounded-xl border border-border-color shadow-md w-full lg:w-40 text-center ${step.shadow}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mb-3 ${step.color}`}>
                  {step.icon}
                </div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">{step.title}</h4>
                <div className="text-lg font-mono font-bold text-text-secondary mb-2">
                  {step.duration} <span className="text-xs font-sans text-text-muted">Min</span>
                </div>
                <div className="text-[10px] font-mono text-text-muted bg-bg-secondary px-2 py-1 rounded w-full">
                  {step.start} - {step.end}
                </div>
              </motion.div>
              
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center px-2 text-text-muted">
                  <ArrowRight size={24} />
                </div>
              )}
              {idx < steps.length - 1 && (
                <div className="lg:hidden py-2 text-text-muted">
                  <ArrowRight size={20} className="rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
