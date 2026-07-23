"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FuzzyResult } from "@/lib/fuzzy-engine";
import { SessionTimeline } from "./SessionTimeline";
import { SmartStudyTips } from "./SmartStudyTips";
import { RecommendationSummary } from "./RecommendationSummary";
import { StudyReadinessCard } from "./StudyReadinessCard";
import { AdaptivePomodoro } from "./AdaptivePomodoro";
import { AdaptiveBreak } from "./AdaptiveBreak";
import { MotivationCard } from "./MotivationCard";
import { PreSessionChecklist } from "./PreSessionChecklist";
import { SessionOverviewCard } from "./SessionOverviewCard";
import { OneClickStart } from "./OneClickStart";
import { TimerModal } from "@/components/timer/TimerModal";

interface AIStudyCoachDashboardProps {
  fuzzyResult: FuzzyResult;
  input: { focus: number; fatigue: number; complexity: number };
}

export function AIStudyCoachDashboard({ fuzzyResult, input }: AIStudyCoachDashboardProps) {
  
  const [estimatedFinishTime, setEstimatedFinishTime] = useState<string>("TBD");
  const [checklistComplete, setChecklistComplete] = useState<boolean>(false);
  const [showTimer, setShowTimer] = useState<boolean>(false);

  // Calculate dynamic durations based on fuzzyResult
  const studyDuration = fuzzyResult.duration;
  
  let breakDuration = 5; 
  if (input.fatigue >= 70) breakDuration = 15;
  else if (input.fatigue >= 40) breakDuration = 10;
  
  let reviewDuration = 10;
  if (input.complexity >= 70) reviewDuration = 20;
  else if (input.complexity >= 40) reviewDuration = 15;
  
  let nextSessionDuration = 60;
  if (studyDuration < 45 && input.fatigue < 50) nextSessionDuration = 90; 
  else if (studyDuration > 90 || input.fatigue >= 70) nextSessionDuration = 30;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.1 }}
      className="w-full mt-8 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={24} className="text-accent-blue" />
          <h2 className="text-2xl font-bold font-serif">AI Study Coach</h2>
        </div>
        <span className="bg-accent-blue-soft text-accent-blue font-bold px-3 py-1 rounded-full text-xs tracking-wider uppercase">Pro Mode</span>
      </div>

      {/* Dynamic Session Scheduler */}
      <SessionTimeline 
        studyDuration={studyDuration}
        breakDuration={breakDuration}
        reviewDuration={reviewDuration}
        nextSessionDuration={nextSessionDuration}
        onFinishTimeCalculated={setEstimatedFinishTime}
      />

      {/* Row 1: Readiness & Pomodoro & Break */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <StudyReadinessCard input={input} fuzzyResult={fuzzyResult} />
        <AdaptivePomodoro fuzzyResult={fuzzyResult} />
        <AdaptiveBreak input={input} />
      </div>

      {/* Row 2: Tips & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <SmartStudyTips fuzzyResult={fuzzyResult} input={input} />
        <RecommendationSummary fuzzyResult={fuzzyResult} />
      </div>

      {/* Row 3: Motivation, Overview, Checklist, Start */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-stretch">
        <div className="col-span-1 lg:col-span-1">
          <MotivationCard input={input} />
        </div>
        <div className="col-span-1 lg:col-span-1">
          <SessionOverviewCard 
            fuzzyResult={fuzzyResult} 
            breakDuration={breakDuration} 
            reviewDuration={reviewDuration} 
            estimatedFinishTime={estimatedFinishTime} 
          />
        </div>
        <div className="col-span-1 lg:col-span-1">
          <PreSessionChecklist onCompletionChange={setChecklistComplete} />
        </div>
        <div className="col-span-1 lg:col-span-1 flex flex-col justify-end">
          <OneClickStart 
            isReady={checklistComplete} 
            estimatedFinishTime={estimatedFinishTime} 
            onStart={() => setShowTimer(true)} 
          />
        </div>
      </div>

      {showTimer && (
        <TimerModal duration={fuzzyResult.duration} onClose={() => setShowTimer(false)} />
      )}
    </motion.div>
  );
}
