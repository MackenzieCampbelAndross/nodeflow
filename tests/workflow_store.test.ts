import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '../src/core/workflow_store';
import { NODE_TEMPLATES } from '../src/core/templates';

describe('WorkflowStore (Zustand)', () => {
  beforeEach(() => {
    useWorkflowStore.getState().resetWorkflow();
  });

  it('initializes with default starter workflow containing 3 nodes and 2 connections', () => {
    const state = useWorkflowStore.getState();
    expect(state.workflow.nodes.length).toBe(3);
    expect(state.workflow.connections.length).toBe(2);
    expect(state.zoom).toBe(1);
  });

  it('adds and positions a new node from catalog template', () => {
    const store = useWorkflowStore.getState();
    const filterTemplate = NODE_TEMPLATES.find((t) => t.type === 'FILTER')!;

    const added = store.addNode(filterTemplate, { x: 500, y: 300 });
    expect(useWorkflowStore.getState().workflow.nodes.length).toBe(4);
    expect(added.position).toEqual({ x: 500, y: 300 });
    expect(useWorkflowStore.getState().selectedNodeId).toBe(added.id);
  });

  it('connects compatible ports and updates connections list', () => {
    const store = useWorkflowStore.getState();
    const mathTemplate = NODE_TEMPLATES.find((t) => t.type === 'MATH_OPERATION')!;
    const logTemplate = NODE_TEMPLATES.find((t) => t.type === 'LOG_OUTPUT')!;

    const n1 = store.addNode(mathTemplate, { x: 100, y: 100 });
    const n2 = store.addNode(logTemplate, { x: 400, y: 100 });

    const connected = store.addConnection(n1.id, 'result', n2.id, 'data');
    expect(connected).toBe(true);
    expect(useWorkflowStore.getState().workflow.connections.some((c) => c.fromNodeId === n1.id && c.toNodeId === n2.id)).toBe(true);
  });

  it('deletes a node and cleans up connected edges', () => {
    const store = useWorkflowStore.getState();
    const nodeToDelete = store.workflow.nodes[1]; // node_formatter_2

    store.deleteNode(nodeToDelete.id);
    const updated = useWorkflowStore.getState().workflow;
    expect(updated.nodes.some((n) => n.id === nodeToDelete.id)).toBe(false);
    expect(updated.connections.some((c) => c.fromNodeId === nodeToDelete.id || c.toNodeId === nodeToDelete.id)).toBe(false);
  });
});
