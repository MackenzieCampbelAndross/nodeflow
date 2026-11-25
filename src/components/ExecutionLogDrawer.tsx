import React, { useState } from 'react';
import { useWorkflowStore } from '../core/workflow_store';

export const ExecutionLogDrawer: React.FC = () => {
  const { executionResult } = useWorkflowStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!executionResult) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 transition-all duration-300 z-30 shadow-2xl select-none ${
        isExpanded ? 'h-72' : 'h-11'
      }`}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 h-11 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 border-b border-slate-800/60"
      >
        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              executionResult.status === 'SUCCESS'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {executionResult.status}
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Execution Log Trace ({executionResult.logs.length} events • {executionResult.executionTimeMs}ms)
          </span>
        </div>

        <button className="text-xs text-slate-400 hover:text-white">
          {isExpanded ? '▼ Minimize' : '▲ View Logs'}
        </button>
      </div>

      {isExpanded && (
        <div className="h-[calc(100%-44px)] overflow-y-auto p-4 space-y-1.5 font-mono text-xs bg-slate-950/80">
          {executionResult.logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-[11px]">
              <span className="text-slate-500 select-none">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span
                className={`font-semibold uppercase ${
                  log.level === 'ERROR'
                    ? 'text-rose-400'
                    : log.level === 'WARN'
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`}
              >
                [{log.level}]
              </span>
              <span className="text-slate-300 flex-1">{log.message}</span>
              {log.data && (
                <span className="text-slate-500 truncate max-w-xs">
                  {JSON.stringify(log.data)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
