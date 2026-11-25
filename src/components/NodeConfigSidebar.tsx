import React from 'react';
import { useWorkflowStore } from '../core/workflow_store';

export const NodeConfigSidebar: React.FC = () => {
  const { workflow, selectedNodeId, updateNodeConfig, selectNode } = useWorkflowStore();

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-[calc(100vh-56px)] select-none z-10 text-slate-200">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
            {selectedNode.category}
          </span>
          <h3 className="text-sm font-bold text-slate-100">{selectedNode.name}</h3>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-slate-400 hover:text-white p-1 text-xs"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Type-Specific Configurations */}
        {selectedNode.type === 'MANUAL_TRIGGER' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Trigger Payload (JSON)
            </label>
            <textarea
              value={
                typeof selectedNode.config.payload === 'object'
                  ? JSON.stringify(selectedNode.config.payload, null, 2)
                  : selectedNode.config.payload || ''
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateNodeConfig(selectedNode.id, { payload: parsed });
                } catch {
                  updateNodeConfig(selectedNode.id, { payload: e.target.value });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 h-32 outline-none focus:border-sky-500"
            />
          </div>
        )}

        {selectedNode.type === 'MATH_OPERATION' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Operation
              </label>
              <select
                value={selectedNode.config.operation || 'ADD'}
                onChange={(e) => updateNodeConfig(selectedNode.id, { operation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none"
              >
                <option value="ADD">Add (+)</option>
                <option value="SUBTRACT">Subtract (-)</option>
                <option value="MULTIPLY">Multiply (×)</option>
                <option value="DIVIDE">Divide (÷)</option>
                <option value="MODULO">Modulo (%)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Fallback A:</span>
                <input
                  type="number"
                  value={selectedNode.config.operandA ?? 0}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { operandA: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Fallback B:</span>
                <input
                  type="number"
                  value={selectedNode.config.operandB ?? 0}
                  onChange={(e) => updateNodeConfig(selectedNode.id, { operandB: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {selectedNode.type === 'STRING_FORMATTER' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Template Pattern
            </label>
            <p className="text-[11px] text-slate-500">
              Interpolate fields using <code className="text-sky-400">{'{{fieldName}}'}</code> syntax.
            </p>
            <textarea
              value={selectedNode.config.template || ''}
              onChange={(e) => updateNodeConfig(selectedNode.id, { template: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 h-28 outline-none focus:border-sky-500"
            />
          </div>
        )}

        {selectedNode.type === 'FILTER' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Condition Operator
              </label>
              <select
                value={selectedNode.config.operator || 'EQUALS'}
                onChange={(e) => updateNodeConfig(selectedNode.id, { operator: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none"
              >
                <option value="EQUALS">Equals (==)</option>
                <option value="NOT_EQUALS">Not Equals (!=)</option>
                <option value="GREATER_THAN">Greater Than (&gt;)</option>
                <option value="LESS_THAN">Less Than (&lt;)</option>
                <option value="CONTAINS">Contains Substring</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Comparison Target
              </label>
              <input
                type="text"
                value={selectedNode.config.compareValue ?? ''}
                onChange={(e) => updateNodeConfig(selectedNode.id, { compareValue: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
          </div>
        )}

        {selectedNode.type === 'HTTP_REQUEST' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Method
              </label>
              <select
                value={selectedNode.config.method || 'POST'}
                onChange={(e) => updateNodeConfig(selectedNode.id, { method: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Endpoint URL
              </label>
              <input
                type="text"
                value={selectedNode.config.url || ''}
                onChange={(e) => updateNodeConfig(selectedNode.id, { url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        )}

        {/* Live Output Inspector */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Execution Data Output
          </span>
          {selectedNode.lastOutput ? (
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 overflow-x-auto max-h-48 whitespace-pre-wrap">
              {JSON.stringify(selectedNode.lastOutput, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-slate-500 italic">No output yet. Run workflow to evaluate.</p>
          )}
        </div>
      </div>
    </aside>
  );
};
