import { describe, it, expect } from 'vitest';
import { ExecutionEngine } from '../src/core/execution_engine';
import { WorkflowDefinition } from '../src/types';

describe('ExecutionEngine', () => {
  const engine = new ExecutionEngine();

  it('executes a math calculation workflow', async () => {
    const wf: WorkflowDefinition = {
      id: 'wf_math',
      name: 'Math Pipeline',
      nodes: [
        {
          id: 'n1',
          name: 'Trigger Numbers',
          type: 'MANUAL_TRIGGER',
          category: 'TRIGGER',
          position: { x: 0, y: 0 },
          inputs: [],
          outputs: [{ id: 'output', name: 'Out', type: 'JSON' }],
          config: { payload: { a: 40, b: 10 } },
        },
        {
          id: 'n2',
          name: 'Add Numbers',
          type: 'MATH_OPERATION',
          category: 'MATH',
          position: { x: 100, y: 0 },
          inputs: [
            { id: 'a', name: 'A', type: 'NUMBER' },
            { id: 'b', name: 'B', type: 'NUMBER' },
          ],
          outputs: [{ id: 'result', name: 'Result', type: 'NUMBER' }],
          config: { operation: 'ADD', operandA: 15, operandB: 25 },
        },
      ],
      connections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await engine.executeWorkflow(wf);
    expect(result.status).toBe('SUCCESS');
    expect(result.nodeOutputs['n2'].result).toBe(40); // 15 + 25 fallback
  });

  it('executes string template interpolation', async () => {
    const wf: WorkflowDefinition = {
      id: 'wf_string',
      name: 'String Formatter',
      nodes: [
        {
          id: 'n_trig',
          name: 'Data Source',
          type: 'MANUAL_TRIGGER',
          category: 'TRIGGER',
          position: { x: 0, y: 0 },
          inputs: [],
          outputs: [{ id: 'output', name: 'Payload', type: 'JSON' }],
          config: { payload: { user: 'Alice', role: 'Architect' } },
        },
        {
          id: 'n_fmt',
          name: 'Formatter',
          type: 'STRING_FORMATTER',
          category: 'TRANSFORM',
          position: { x: 100, y: 0 },
          inputs: [{ id: 'data', name: 'Data', type: 'JSON' }],
          outputs: [{ id: 'formattedText', name: 'Formatted', type: 'STRING' }],
          config: { template: 'Welcome {{user}} ({{role}})' },
        },
      ],
      connections: [
        { id: 'c1', fromNodeId: 'n_trig', fromPortId: 'output', toNodeId: 'n_fmt', toPortId: 'data' },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await engine.executeWorkflow(wf);
    expect(result.status).toBe('SUCCESS');
    expect(result.nodeOutputs['n_fmt'].formattedText).toBe('Welcome Alice (Architect)');
  });

  it('handles division by zero error gracefully', async () => {
    const wf: WorkflowDefinition = {
      id: 'wf_err',
      name: 'Div Zero',
      nodes: [
        {
          id: 'n1',
          name: 'Divide Node',
          type: 'MATH_OPERATION',
          category: 'MATH',
          position: { x: 0, y: 0 },
          inputs: [],
          outputs: [{ id: 'result', name: 'Out', type: 'NUMBER' }],
          config: { operation: 'DIVIDE', operandA: 10, operandB: 0 },
        },
      ],
      connections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await engine.executeWorkflow(wf);
    expect(result.status).toBe('FAILED');
    expect(result.logs.some((l) => l.level === 'ERROR' && l.message.includes('Division by zero'))).toBe(true);
  });
});
