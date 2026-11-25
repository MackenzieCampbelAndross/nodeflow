import React, { useState } from 'react';
import { useWorkflowStore } from '../core/workflow_store';

interface JSONModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JSONModal: React.FC<JSONModalProps> = ({ isOpen, onClose }) => {
  const { workflow, loadWorkflow } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>('EXPORT');
  const [importInput, setImportInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonStr = JSON.stringify(workflow, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.nodeflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      setErrorMessage(null);
      const parsed = JSON.parse(importInput);
      if (!parsed.nodes || !parsed.connections) {
        throw new Error('Invalid NodeFlow schema: missing nodes or connections array.');
      }
      loadWorkflow(parsed);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📋</span>
            <h3 className="text-base font-bold text-slate-100">Workflow JSON DSL</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'EXPORT'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export JSON
          </button>
          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'IMPORT'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import JSON
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'EXPORT' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Complete workflow definition:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm"
                  >
                    Download File
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={jsonStr}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 h-80 outline-none resize-none"
              />
            </div>
          )}

          {activeTab === 'IMPORT' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Paste valid NodeFlow workflow JSON schema to replace the current canvas:
              </p>

              <textarea
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste NodeFlow JSON here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 h-64 outline-none focus:border-sky-500"
              />

              {errorMessage && (
                <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
              )}

              <button
                onClick={handleImport}
                disabled={!importInput.trim()}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all"
              >
                Import and Render Canvas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
