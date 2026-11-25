import React, { useState } from 'react';
import { useWorkflowStore } from '../core/workflow_store';
import { NODE_TEMPLATES, NodeTemplate } from '../core/templates';

interface ToolbarProps {
  onOpenJSONModal: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenJSONModal }) => {
  const {
    workflow,
    runWorkflow,
    isExecuting,
    addNode,
    zoom,
    setZoom,
    setPan,
    resetWorkflow,
  } = useWorkflowStore();

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const handleAddNode = (template: NodeTemplate) => {
    addNode(template, { x: 300 + Math.random() * 80, y: 200 + Math.random() * 80 });
    setIsCatalogOpen(false);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20 select-none">
      {/* Brand & Workflow Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-lg shadow-md shadow-sky-500/20">
          ⚡
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            NODEFLOW
          </span>
          <span className="text-slate-500 text-xs ml-2 font-mono">
            {workflow.nodes.length} nodes • {workflow.connections.length} edges
          </span>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Run Workflow button */}
        <button
          onClick={() => runWorkflow()}
          disabled={isExecuting}
          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Executing DAG...</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>Execute Workflow</span>
            </>
          )}
        </button>

        {/* Add Node Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1"
          >
            <span>+ Add Node</span>
            <span className="text-[10px]">▼</span>
          </button>

          {isCatalogOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 block">
                Node Library
              </span>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {NODE_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.type}
                    onClick={() => handleAddNode(tmpl)}
                    className="p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{tmpl.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {tmpl.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs text-slate-400 space-x-2">
          <button
            onClick={() => setZoom(zoom * 0.85)}
            className="hover:text-white font-bold"
            title="Zoom out"
          >
            −
          </button>
          <span className="font-mono text-[11px] w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(zoom * 1.15)}
            className="hover:text-white font-bold"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="text-[10px] hover:text-white px-1 border-l border-slate-800"
            title="Reset Pan & Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Auxiliary Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenJSONModal}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
        >
          JSON DSL
        </button>

        <button
          onClick={resetWorkflow}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 text-xs transition-colors"
          title="Reset to Template"
        >
          🔄
        </button>
      </div>
    </header>
  );
};
