import React from 'react';
import { WorkflowConnection } from '../types';
import { useWorkflowStore } from '../core/workflow_store';

interface ConnectionBezierProps {
  connection: WorkflowConnection;
}

export const ConnectionBezier: React.FC<ConnectionBezierProps> = ({ connection }) => {
  const { workflow, deleteConnection } = useWorkflowStore();

  const fromNode = workflow.nodes.find((n) => n.id === connection.fromNodeId);
  const toNode = workflow.nodes.find((n) => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const outIdx = fromNode.outputs.findIndex((p) => p.id === connection.fromPortId);
  const inIdx = toNode.inputs.findIndex((p) => p.id === connection.toPortId);

  const x1 = fromNode.position.x + 256;
  const y1 = fromNode.position.y + 48 + Math.max(0, outIdx) * 26;

  const x2 = toNode.position.x;
  const y2 = toNode.position.y + 48 + Math.max(0, inIdx) * 26;

  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        deleteConnection(connection.id);
      }}
      className="cursor-pointer group"
    >
      {/* Invisible wider stroke for easy click/hover hit-testing */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="16"
      />
      {/* Glow path on hover */}
      <path
        d={path}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="4"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
      {/* Main Connection Curve */}
      <path
        d={path}
        fill="none"
        stroke="#64748b"
        strokeWidth="2.5"
        className="group-hover:stroke-sky-400 transition-colors"
      />
      {/* Animated flow particle */}
      <circle r="3" fill="#38bdf8">
        <animateMotion path={path} dur="2.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
};
