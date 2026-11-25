import React, { useRef } from 'react';
import { WorkflowNode, PortType } from '../types';
import { useWorkflowStore } from '../core/workflow_store';

interface NodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, isSelected, onSelect }) => {
  const {
    updateNodePosition,
    deleteNode,
    setConnectingFrom,
    addConnection,
    connectingFrom,
  } = useWorkflowStore();

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, nodeX: node.position.x, nodeY: node.position.y });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    updateNodePosition(node.id, {
      x: Math.round(dragStartRef.current.nodeX + dx),
      y: Math.round(dragStartRef.current.nodeY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const getPortColor = (type: PortType) => {
    switch (type) {
      case 'STRING':
        return 'bg-emerald-500 border-emerald-300';
      case 'NUMBER':
        return 'bg-amber-500 border-amber-300';
      case 'BOOLEAN':
        return 'bg-purple-500 border-purple-300';
      case 'JSON':
        return 'bg-sky-500 border-sky-300';
      case 'ANY':
      default:
        return 'bg-slate-400 border-slate-200';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'TRIGGER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MATH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'TRANSFORM':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'LOGIC':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'INTEGRATION':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'OUTPUT':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
      className={`absolute w-64 rounded-2xl bg-slate-900 border transition-shadow select-none shadow-xl cursor-default ${
        isSelected
          ? 'border-sky-500 ring-2 ring-sky-500/40 shadow-sky-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Node Header (Draggable handle) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-4 py-2.5 bg-slate-950/80 rounded-t-2xl border-b border-slate-800/80 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center space-x-2">
          <span
            className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(
              node.category
            )}`}
          >
            {node.category}
          </span>
          <h4 className="text-xs font-bold text-slate-100 truncate max-w-[110px]">{node.name}</h4>
        </div>

        <div className="flex items-center space-x-1">
          {node.status === 'COMPLETED' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="Completed" />
          )}
          {node.status === 'ERROR' && (
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-ping" title="Error" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            className="text-slate-500 hover:text-rose-400 p-0.5 text-xs transition-colors"
            title="Delete node"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Ports Body */}
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-start text-[11px] gap-2">
          {/* Input Ports (Left) */}
          <div className="space-y-2 flex-1">
            {node.inputs.map((inPort) => (
              <div
                key={inPort.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (connectingFrom && connectingFrom.nodeId !== node.id) {
                    addConnection(connectingFrom.nodeId, connectingFrom.portId, node.id, inPort.id);
                  }
                }}
                className={`flex items-center space-x-1.5 p-1 rounded hover:bg-slate-800/50 cursor-pointer ${
                  connectingFrom ? 'ring-1 ring-sky-500/50' : ''
                }`}
                title={`Input: ${inPort.name} (${inPort.type})`}
              >
                <div className={`w-2.5 h-2.5 rounded-full border ${getPortColor(inPort.type)}`} />
                <span className="text-slate-300 font-medium truncate">{inPort.name}</span>
              </div>
            ))}
          </div>

          {/* Output Ports (Right) */}
          <div className="space-y-2 flex-1 text-right">
            {node.outputs.map((outPort) => (
              <div
                key={outPort.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setConnectingFrom({
                    nodeId: node.id,
                    portId: outPort.id,
                    type: outPort.type,
                  });
                }}
                className={`flex items-center justify-end space-x-1.5 p-1 rounded hover:bg-slate-800/50 cursor-pointer ${
                  connectingFrom?.portId === outPort.id ? 'bg-sky-500/20' : ''
                }`}
                title={`Output: ${outPort.name} (${outPort.type}) - Click to connect`}
              >
                <span className="text-slate-300 font-medium truncate">{outPort.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full border ${getPortColor(outPort.type)}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Live Output Mini-preview */}
        {node.lastOutput && (
          <div className="pt-2 border-t border-slate-800/60 font-mono text-[10px] text-slate-400 truncate bg-slate-950/40 px-2 py-1 rounded">
            Output: {JSON.stringify(node.lastOutput)}
          </div>
        )}
      </div>
    </div>
  );
};
