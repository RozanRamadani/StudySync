"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdaptiveIntelligence } from "@/lib/adaptive-engine/hooks";
import { usePredictiveIntelligence } from "@/lib/predictive-engine/hooks";
import { LearningProfileCard } from "@/components/dashboard/LearningProfileCard";
import { PatternRecognitionCard } from "@/components/dashboard/PatternRecognitionCard";
import { HabitScoreCard } from "@/components/dashboard/HabitScoreCard";
import { ImprovementTimeline } from "@/components/dashboard/ImprovementTimeline";
import { SessionComparison } from "@/components/dashboard/SessionComparison";
import { TomorrowForecast } from "@/components/dashboard/TomorrowForecast";
import { WeeklyForecast } from "@/components/dashboard/WeeklyForecast";
import { TrendForecast } from "@/components/dashboard/TrendForecast";
import { PredictionAccuracyCard } from "@/components/dashboard/PredictionAccuracy";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { Brain, Activity, TrendingUp, BarChart2, Beaker } from "lucide-react";
import { useStudySync } from "@/components/providers/StudySyncProvider";

type Tab = 'Overview' | 'Adaptive' | 'Predictive' | 'Decision Analysis' | 'Simulation';

const TABS: { id: Tab, icon: React.ReactNode, label: string }[] = [
  { id: 'Overview', icon: <Brain size={18} />, label: 'Overview' },
  { id: 'Adaptive', icon: <Activity size={18} />, label: 'Adaptive' },
  { id: 'Predictive', icon: <TrendingUp size={18} />, label: 'Predictive' },
  { id: 'Decision Analysis', icon: <BarChart2 size={18} />, label: 'Decision Analysis' },
  { id: 'Simulation', icon: <Beaker size={18} />, label: 'Simulation' },
];

export default function IntelligenceCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const { sessions } = useStudySync();

  const { 
    hasData, 
    profile, 
    patterns, 
    habitScore, 
    sessionComparison, 
    isLoading 
  } = useAdaptiveIntelligence();

  const {
    tomorrowForecast,
    weeklyForecast,
    predictionAccuracy
  } = usePredictiveIntelligence();

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted animate-pulse">Loading Intelligence Center...</div>;
  }

  if (!hasData) {
    return (
      <div className="page-wrapper">
        <div className="max-w-[1200px] mx-auto w-full text-center py-20">
          <h2 className="text-2xl font-bold mb-3">Insufficient Data</h2>
          <p className="text-text-muted max-w-md mx-auto">
            The Learning Intelligence Center requires historical study sessions to analyze your behavior and predict trends. Please complete some study sessions first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper pb-20">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Learning Intelligence Center</h1>
          <p className="text-text-secondary">
            Deep analysis of your historical behavior, pattern recognition, and future trend forecasting.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-border-color">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-bg-secondary text-accent-blue border-t border-x border-border-color border-b-0 -mb-[1px] z-10' 
                  : 'bg-transparent text-text-muted hover:text-text-secondary hover:bg-bg-primary border border-transparent'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-2 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <LearningProfileCard profile={profile} />
                  </div>
                  <div className="lg:col-span-1">
                    <HabitScoreCard score={habitScore} />
                  </div>
                  <div className="lg:col-span-3">
                    <ImprovementTimeline />
                  </div>
                </div>
              )}

              {activeTab === 'Adaptive' && (
                <div className="flex flex-col gap-6">
                  <PatternRecognitionCard patterns={patterns} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HabitScoreCard score={habitScore} />
                    <LearningProfileCard profile={profile} />
                  </div>
                </div>
              )}

              {activeTab === 'Predictive' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TomorrowForecast data={tomorrowForecast} />
                    <WeeklyForecast data={weeklyForecast} />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                       <TrendForecast />
                    </div>
                    <div className="lg:col-span-1">
                       <PredictionAccuracyCard data={predictionAccuracy} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Decision Analysis' && (
                <div className="flex flex-col gap-6">
                  {/* Decision History & Trends (Inline implementation) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">Decision History</h3>
                        <p className="text-sm text-text-muted mb-4">Your most recent study strategies chosen from the Decision Dashboard.</p>
                        <div className="space-y-3">
                           {/* Using session data as proxy for decision history */}
                           {[...sessions].reverse().slice(0, 3).map((s, i) => (
                              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-bg-primary border border-border-color">
                                 <div>
                                    <div className="font-bold text-sm">{s.duration}m Session</div>
                                    <div className="text-xs text-text-muted">{new Date(s.timestamp).toLocaleDateString()}</div>
                                 </div>
                                 <div className="text-xs font-semibold bg-accent-blue/10 text-accent-blue px-2 py-1 rounded">
                                    {s.duration >= 90 ? 'Deep Work' : s.duration <= 30 ? 'Recovery' : 'Standard'}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="bg-bg-secondary border border-border-color rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">Decision Trends</h3>
                        <p className="text-sm text-text-muted mb-6">How your strategy choices distribute over time.</p>
                        <div className="flex items-end h-32 gap-2">
                           {/* Mock bars based on simple session heuristics */}
                           <div className="flex-1 flex flex-col justify-end items-center gap-2">
                              <div className="w-full bg-accent-blue rounded-t-sm" style={{ height: '40%' }}></div>
                              <span className="text-[10px] text-text-muted">Deep Work</span>
                           </div>
                           <div className="flex-1 flex flex-col justify-end items-center gap-2">
                              <div className="w-full bg-purple-500 rounded-t-sm" style={{ height: '70%' }}></div>
                              <span className="text-[10px] text-text-muted">Standard</span>
                           </div>
                           <div className="flex-1 flex flex-col justify-end items-center gap-2">
                              <div className="w-full bg-green-500 rounded-t-sm" style={{ height: '25%' }}></div>
                              <span className="text-[10px] text-text-muted">Recovery</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Decision Comparison */}
                  <SessionComparison data={sessionComparison} />
                </div>
              )}

              {activeTab === 'Simulation' && (
                <div className="max-w-2xl mx-auto">
                  <WhatIfSimulator />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
