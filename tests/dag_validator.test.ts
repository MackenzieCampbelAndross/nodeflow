import { describe, it, expect } from 'vitest';
import { DAGValidator } from '../src/core/dag_validator';
import { WorkflowDefinition, WorkflowNode } from '../src/types';

describe('DAGValidator', () => {
  const nodeA: WorkflowNode = {
    id: 'A',
    name: 'Node A',
    type: 'MANUAL_TRIGGER',
    category: 'TRIGGER',
    position: { x: 0, y: 0 },
    inputs: [],
    outputs: [{ id: 'out', name: 'Out', type: 'NUMBER' }],
    config: {},
  };

  const nodeB: WorkflowNode = {
    id: 'B',
    name: 'Node B',
    type: 'MATH_OPERATION',
    category: 'MATH',
    position: { x: 100, y: 0 },
    inputs: [{ id: 'a', name: 'In', type: 'NUMBER' }],
    outputs: [{ id: 'result', name: 'Out', type: 'NUMBER' }],
    config: {},
  };

  const nodeC: WorkflowNode = {
    id: 'C',
    name: 'Node C',
    type: 'LOG_OUTPUT',
    category: 'OUTPUT',
    position: { x: 200, y: 0 },
    inputs: [{ id: 'data', name: 'In', type: 'NUMBER' }],
    outputs: [],
    config: {},
  };

  it('validates a valid DAG pipeline and returns topological execution order', () => {
    const wf: WorkflowDefinition = {
      id: 'wf_valid',
      name: 'Valid Workflow',
      nodes: [nodeC, nodeA, nodeB], // Unordered nodes
      connections: [
        { id: 'c1', fromNodeId: 'A', fromPortId: 'out', toNodeId: 'B', toPortId: 'a' },
        { id: 'c2', fromNodeId: 'B', fromPortId: 'result', toNodeId: 'C', toPortId: 'data' },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const res = DAGValidator.validateWorkflow(wf);
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
    expect(res.executionOrder).toEqual(['A', 'B', 'C']);
  });

  it('detects cycles and marks workflow as invalid', () => {
    const wfWithCycle: WorkflowDefinition = {
      id: 'wf_cycle',
      name: 'Cyclic Workflow',
      nodes: [nodeA, nodeB, nodeC],
      connections: [
        { id: 'c1', fromNodeId: 'A', fromPortId: 'out', toNodeId: 'B', toPortId: 'a' },
        { id: 'c2', fromNodeId: 'B', fromPortId: 'result', toNodeId: 'C', toPortId: 'data' },
        { id: 'c3', fromNodeId: 'C', fromPortId: 'data', toNodeId: 'A', toPortId: 'out' }, // Cycle back
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const res = DAGValidator.validateWorkflow(wfWithCycle);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.includes('Cycle detected'))).toBe(true);
  });

  it('enforces port type compatibility', () => {
    expect(DAGValidator.arePortsCompatible('NUMBER', 'NUMBER')).toBe(true);
    expect(DAGValidator.arePortsCompatible('NUMBER', 'STRING')).toBe(true); // Coercion allowed
    expect(DAGValidator.arePortsCompatible('ANY', 'JSON')).toBe(true);
    expect(DAGValidator.arePortsCompatible('JSON', 'ANY')).toBe(true);
    expect(DAGValidator.arePortsCompatible('JSON', 'NUMBER')).toBe(false); // Incompatible
  });
});
