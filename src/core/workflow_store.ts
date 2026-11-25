import { create } from 'zustand';
import {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowConnection,
  ExecutionResult,
  PortType,
} from '../types';
import { createInitialWorkflow, NodeTemplate } from './templates';
import { ExecutionEngine } from './execution_engine';
import { DAGValidator } from './dag_validator';

export interface WorkflowState {
  workflow: WorkflowDefinition;
  selectedNodeId: string | null;
  pan: { x: number; y: number };
  zoom: number;
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  connectingFrom: { nodeId: string; portId: string; type: PortType } | null;

  // Actions
  addNode: (template: NodeTemplate, position?: { x: number; y: number }) => WorkflowNode;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>) => void;
  deleteNode: (nodeId: string) => void;
  addConnection: (
    fromNodeId: string,
    fromPortId: string,
    toNodeId: string,
    toPortId: string
  ) => boolean;
  deleteConnection: (connId: string) => void;
  setConnectingFrom: (info: { nodeId: string; portId: string; type: PortType } | null) => void;
  selectNode: (nodeId: string | null) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  runWorkflow: () => Promise<ExecutionResult>;
  resetWorkflow: () => void;
  loadWorkflow: (wf: WorkflowDefinition) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflow: createInitialWorkflow(),
  selectedNodeId: 'node_trigger_1',
  pan: { x: 0, y: 0 },
  zoom: 1,
  executionResult: null,
  isExecuting: false,
  connectingFrom: null,

  addNode: (template, position) => {
    const id = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNode: WorkflowNode = {
      id,
      name: template.name,
      type: template.type,
      category: template.category,
      position: position || { x: 250, y: 250 },
      inputs: [...template.inputs],
      outputs: [...template.outputs],
      config: { ...template.defaultConfig },
      status: 'IDLE',
    };

    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: [...state.workflow.nodes, newNode],
        updatedAt: Date.now(),
      },
      selectedNodeId: newNode.id,
    }));

    return newNode;
  },

  updateNodePosition: (nodeId, position) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.map((n) =>
          n.id === nodeId ? { ...n, position } : n
        ),
      },
    }));
  },

  updateNodeConfig: (nodeId, config) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.map((n) =>
          n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n
        ),
        updatedAt: Date.now(),
      },
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.filter((n) => n.id !== nodeId),
        connections: state.workflow.connections.filter(
          (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
        ),
        updatedAt: Date.now(),
      },
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  addConnection: (fromNodeId, fromPortId, toNodeId, toPortId) => {
    if (fromNodeId === toNodeId) return false;

    const currentWf = get().workflow;
    const fromNode = currentWf.nodes.find((n) => n.id === fromNodeId);
    const toNode = currentWf.nodes.find((n) => n.id === toNodeId);
    if (!fromNode || !toNode) return false;

    const outPort = fromNode.outputs.find((p) => p.id === fromPortId);
    const inPort = toNode.inputs.find((p) => p.id === toPortId);
    if (!outPort || !inPort) return false;

    // Check type compatibility
    if (!DAGValidator.arePortsCompatible(outPort.type, inPort.type)) {
      return false;
    }

    // Check duplicate or multiple target inputs
    const exists = currentWf.connections.some(
      (c) => c.toNodeId === toNodeId && c.toPortId === toPortId
    );
    if (exists) return false;

    const newConn: WorkflowConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromNodeId,
      fromPortId,
      toNodeId,
      toPortId,
    };

    set((state) => ({
      workflow: {
        ...state.workflow,
        connections: [...state.workflow.connections, newConn],
        updatedAt: Date.now(),
      },
      connectingFrom: null,
    }));

    return true;
  },

  deleteConnection: (connId) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        connections: state.workflow.connections.filter((c) => c.id !== connId),
        updatedAt: Date.now(),
      },
    }));
  },

  setConnectingFrom: (info) => {
    set({ connectingFrom: info });
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  setPan: (pan) => {
    set({ pan });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.3, Math.min(2.5, zoom)) });
  },

  runWorkflow: async () => {
    set({ isExecuting: true });
    const engine = new ExecutionEngine();
    const result = await engine.executeWorkflow(get().workflow);
    set({ executionResult: result, isExecuting: false });
    return result;
  },

  resetWorkflow: () => {
    const initial = createInitialWorkflow();
    set({
      workflow: initial,
      selectedNodeId: initial.nodes[0]?.id || null,
      executionResult: null,
      pan: { x: 0, y: 0 },
      zoom: 1,
    });
  },

  loadWorkflow: (wf) => {
    set({
      workflow: wf,
      selectedNodeId: wf.nodes[0]?.id || null,
      executionResult: null,
    });
  },
}));
