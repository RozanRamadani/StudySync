import { motion } from 'framer-motion';
import { User, Clock, Target, Calendar, Flame, Activity } from 'lucide-react';
import { LearningProfile } from '@/lib/adaptive-engine';

export function LearningProfileCard({ profile }: { profile: LearningProfile | null }) {
  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent-blue/10 p-2 rounded-lg">
          <User className="text-accent-blue" size={24} />
        </div>
        <h3 className="text-xl font-bold">Learning Profile</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ProfileStat icon={<Clock size={16} />} label="Preferred Duration" value={`${profile.preferredDuration}m`} />
        <ProfileStat icon={<Target size={16} />} label="Average Focus" value={`${profile.averageFocus}%`} />
        <ProfileStat icon={<Activity size={16} />} label="Average Fatigue" value={`${profile.averageFatigue}%`} />
        <ProfileStat icon={<Calendar size={16} />} label="Best Day" value={profile.mostProductiveDay} />
        <ProfileStat icon={<Flame size={16} className="text-orange-500" />} label="Current Streak" value={`${profile.currentStreak} days`} />
        <ProfileStat icon={<Target size={16} className="text-green-500" />} label="Consistency" value={`${profile.consistencyScore}%`} />
      </div>
    </motion.div>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-bg-primary rounded-xl p-4 border border-border-color">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold font-serif text-text-primary">{value}</p>
    </div>
  );
}
