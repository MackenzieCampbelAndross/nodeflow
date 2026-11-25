import { describe, it, expect } from 'vitest';
import { useWorkflowStore } from '../src/core/workflow_store';
import { NODE_TEMPLATES } from '../src/core/templates';

describe('NodeFlow End-to-End Workflow Lifecycle', () => {
  it('constructs an end-to-end multi-step DAG pipeline and executes successfully', async () => {
    const store = useWorkflowStore.getState();
    store.resetWorkflow();

    // 1. Clear initial nodes
    for (const node of [...useWorkflowStore.getState().workflow.nodes]) {
      store.deleteNode(node.id);
    }
    expect(useWorkflowStore.getState().workflow.nodes.length).toBe(0);

    // 2. Add Trigger Node (Order Total = $200)
    const triggerTemplate = NODE_TEMPLATES.find((t) => t.type === 'MANUAL_TRIGGER')!;
    const trigger = store.addNode(triggerTemplate, { x: 50, y: 150 });
    store.updateNodeConfig(trigger.id, { payload: { orderId: 'ORD-77', total: 200 } });

    // 3. Add JSON Extractor Node
    const parserTemplate = NODE_TEMPLATES.find((t) => t.type === 'JSON_PARSER')!;
    const parser = store.addNode(parserTemplate, { x: 350, y: 150 });
    store.updateNodeConfig(parser.id, { path: 'total' });

    // 4. Add Math Node (Apply 10% tax: multiply by 1.1)
    const mathTemplate = NODE_TEMPLATES.find((t) => t.type === 'MATH_OPERATION')!;
    const math = store.addNode(mathTemplate, { x: 650, y: 150 });
    store.updateNodeConfig(math.id, { operation: 'MULTIPLY', operandB: 1.1 });

    // 5. Add Log Sink Node
    const logTemplate = NODE_TEMPLATES.find((t) => t.type === 'LOG_OUTPUT')!;
    const logger = store.addNode(logTemplate, { x: 950, y: 150 });

    // 6. Connect Nodes in Pipeline
    store.addConnection(trigger.id, 'output', parser.id, 'jsonString');
    store.addConnection(parser.id, 'parsedData', math.id, 'a');
    store.addConnection(math.id, 'result', logger.id, 'data');

    expect(useWorkflowStore.getState().workflow.nodes.length).toBe(4);
    expect(useWorkflowStore.getState().workflow.connections.length).toBe(3);

    // 7. Execute DAG Workflow
    const result = await store.runWorkflow();
    expect(result.status).toBe('SUCCESS');
    expect(result.nodeOutputs[math.id].result).toBeCloseTo(220); // 200 * 1.1
    expect(result.nodeOutputs[logger.id].logged).toBeCloseTo(220);
    expect(result.logs.length).toBeGreaterThan(4);
  });
});
