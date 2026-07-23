import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Download, Trash2 } from 'lucide-react';
import { useStudySync } from '@/components/providers/StudySyncProvider';

export function PrivacySettings() {
  const { clearSessions, sessions } = useStudySync();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "studysync_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClear = () => {
    clearSessions();
    setShowConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-color rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-accent-blue/10 p-2 rounded-lg">
          <ShieldAlert className="text-accent-blue" size={24} />
        </div>
        <h3 className="text-xl font-bold">Privacy & Transparency</h3>
      </div>

      <p className="text-sm text-text-secondary mb-6 leading-relaxed">
        StudySync analyzes your past sessions to adapt its recommendations. Your data is processed securely and is never used to infer personal identity. 
        You have full control over your learning history.
      </p>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-bg-primary hover:bg-border-color border border-border-color px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} /> Export Learning History
        </button>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={16} /> Reset Learning Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-500 font-medium">Are you sure?</span>
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-bg-primary hover:bg-border-color border border-border-color px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
