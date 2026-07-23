import { Brain, FileSearch } from 'lucide-react';

interface Props {
  assistant: { advice: string, evidence: string[] };
}

export function DecisionAssistant({ assistant }: Props) {
  return (
    <div className="bg-gradient-to-r from-accent-blue/10 to-purple-500/10 border border-accent-blue/20 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div className="bg-bg-primary p-3 rounded-full border border-border-color shrink-0 shadow-sm">
        <Brain className="text-accent-blue" size={28} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          Decision Assistant
        </h3>
        <p className="text-text-primary font-medium text-sm md:text-base leading-relaxed">
          {assistant.advice}
        </p>
        
        <div className="mt-3 bg-bg-primary/50 border border-border-color rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            <FileSearch size={14} /> Evidence & Reasoning
          </div>
          <ul className="text-xs text-text-muted space-y-1 ml-5 list-disc">
            {assistant.evidence.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
