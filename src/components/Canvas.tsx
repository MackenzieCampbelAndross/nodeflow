import React, { useRef } from 'react';
import { useWorkflowStore } from '../core/workflow_store';
import { NodeCard } from './NodeCard';
import { ConnectionBezier } from './ConnectionBezier';

export const Canvas: React.FC = () => {
  const {
    workflow,
    selectedNodeId,
    pan,
    zoom,
    setPan,
    setZoom,
    selectNode,
    setConnectingFrom,
  } = useWorkflowStore();

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only pan if clicking canvas background directly
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      selectNode(null);
      setConnectingFrom(null);
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({
      x: Math.round(panStartRef.current.panX + dx),
      y: Math.round(panStartRef.current.panY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPanningRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(zoom * zoomFactor);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing select-none"
      style={{
        backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Scaled & Panned Content Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        {/* SVG Connections Layer */}
        <svg
          className="absolute top-0 left-0 w-[8000px] h-[8000px] overflow-visible pointer-events-auto"
          style={{ transform: 'translate(-2000px, -2000px)' }}
        >
          <g transform="translate(2000, 2000)">
            {workflow.connections.map((conn) => (
              <ConnectionBezier key={conn.id} connection={conn} />
            ))}
          </g>
        </svg>

        {/* Nodes Layer */}
        <div className="absolute top-0 left-0 pointer-events-auto">
          {workflow.nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={() => selectNode(node.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
