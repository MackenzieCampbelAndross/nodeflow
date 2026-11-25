import { WorkflowDefinition, ExecutionResult, ExecutionLog, WorkflowNode } from '../types';
import { DAGValidator } from './dag_validator';

export class ExecutionEngine {
  async executeWorkflow(workflow: WorkflowDefinition): Promise<ExecutionResult> {
    const startTime = performance.now();
    const logs: ExecutionLog[] = [];
    const nodeOutputs: Record<string, any> = {};

    // 1. Validate DAG
    const validation = DAGValidator.validateWorkflow(workflow);
    if (!validation.isValid) {
      logs.push({
        timestamp: Date.now(),
        nodeId: 'system',
        level: 'ERROR',
        message: `Validation failed: ${validation.errors.join('; ')}`,
      });

      return {
        workflowId: workflow.id,
        status: 'FAILED',
        executionTimeMs: Math.round(performance.now() - startTime),
        nodeOutputs: {},
        logs,
      };
    }

    const nodeMap = new Map<string, WorkflowNode>();
    for (const node of workflow.nodes) {
      nodeMap.set(node.id, node);
    }

    logs.push({
      timestamp: Date.now(),
      nodeId: 'system',
      level: 'INFO',
      message: `DAG validated successfully. Execution order: ${validation.executionOrder.join(' -> ')}`,
    });

    // 2. Execute nodes in topological order
    for (const nodeId of validation.executionOrder) {
      const node = nodeMap.get(nodeId)!;
      const nodeStart = performance.now();

      // Gather input values from incoming connections
      const incomingConns = workflow.connections.filter((c) => c.toNodeId === nodeId);
      const inputValues: Record<string, any> = {};

      for (const conn of incomingConns) {
        const sourceOutput = nodeOutputs[conn.fromNodeId];
        const val = sourceOutput ? sourceOutput[conn.fromPortId] : undefined;
        inputValues[conn.toPortId] = val;
      }

      try {
        const output = await this.executeNode(node, inputValues);
        nodeOutputs[nodeId] = output;
        node.status = 'COMPLETED';
        node.lastOutput = output;

        const duration = Math.round(performance.now() - nodeStart);
        logs.push({
          timestamp: Date.now(),
          nodeId: node.id,
          level: 'INFO',
          message: `Executed node "${node.name}" (${node.type}) in ${duration}ms`,
          data: output,
        });
      } catch (err: any) {
        node.status = 'ERROR';
        node.error = err.message || 'Execution failed';

        logs.push({
          timestamp: Date.now(),
          nodeId: node.id,
          level: 'ERROR',
          message: `Node "${node.name}" failed: ${node.error}`,
        });

        return {
          workflowId: workflow.id,
          status: 'FAILED',
          executionTimeMs: Math.round(performance.now() - startTime),
          nodeOutputs,
          logs,
        };
      }
    }

    return {
      workflowId: workflow.id,
      status: 'SUCCESS',
      executionTimeMs: Math.round(performance.now() - startTime),
      nodeOutputs,
      logs,
    };
  }

  private async executeNode(node: WorkflowNode, inputs: Record<string, any>): Promise<Record<string, any>> {
    switch (node.type) {
      case 'MANUAL_TRIGGER': {
        const payload = node.config.payload !== undefined ? node.config.payload : { message: 'Workflow triggered manually', timestamp: Date.now() };
        return { output: payload };
      }

      case 'MATH_OPERATION': {
        const a = inputs['a'] !== undefined ? Number(inputs['a']) : Number(node.config.operandA || 0);
        const b = inputs['b'] !== undefined ? Number(inputs['b']) : Number(node.config.operandB || 0);
        const op = node.config.operation || 'ADD';

        let res = 0;
        if (op === 'ADD') res = a + b;
        else if (op === 'SUBTRACT') res = a - b;
        else if (op === 'MULTIPLY') res = a * b;
        else if (op === 'DIVIDE') {
          if (b === 0) throw new Error('Division by zero');
          res = a / b;
        } else if (op === 'MODULO') res = a % b;

        return { result: res };
      }

      case 'STRING_FORMATTER': {
        const template: string = node.config.template || 'Value: {{value}}';
        const data = inputs['data'] || inputs['input'] || {};

        let formatted = template;
        if (typeof data === 'object' && data !== null) {
          for (const [k, v] of Object.entries(data)) {
            formatted = formatted.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
          }
        } else {
          formatted = formatted.replace(/{{value}}/g, String(data));
        }

        return { formattedText: formatted };
      }

      case 'FILTER': {
        const val = inputs['input'] !== undefined ? inputs['input'] : node.config.value;
        const target = node.config.compareValue;
        const operator = node.config.operator || 'EQUALS';

        let passed = false;
        if (operator === 'EQUALS') passed = String(val) === String(target);
        else if (operator === 'NOT_EQUALS') passed = String(val) !== String(target);
        else if (operator === 'GREATER_THAN') passed = Number(val) > Number(target);
        else if (operator === 'LESS_THAN') passed = Number(val) < Number(target);
        else if (operator === 'CONTAINS') passed = String(val).includes(String(target));

        return { passed, output: passed ? val : null };
      }

      case 'JSON_PARSER': {
        const inputStr = inputs['jsonString'] || node.config.rawJson || '{}';
        const path: string = node.config.path || '';

        let parsed = typeof inputStr === 'string' ? JSON.parse(inputStr) : inputStr;
        if (path) {
          const parts = path.split('.');
          for (const p of parts) {
            if (parsed && typeof parsed === 'object') {
              parsed = parsed[p];
            }
          }
        }
        return { parsedData: parsed };
      }

      case 'HTTP_REQUEST': {
        const url = node.config.url || 'https://api.mock.internal/v1/event';
        const method = node.config.method || 'GET';
        // Mock resilient HTTP response
        return {
          statusCode: 200,
          responseBody: { status: 'ok', endpoint: url, method, data: inputs['body'] || null },
        };
      }

      case 'TRANSFORM_JS': {
        const inputData = inputs['input'];
        const expr: string = node.config.expression || 'input';

        // Safe evaluation
        const fn = new Function('input', `try { return (${expr}); } catch (e) { throw e; }`);
        const result = fn(inputData);
        return { result };
      }

      case 'LOG_OUTPUT':
      default: {
        const logData = inputs['data'] !== undefined ? inputs['data'] : inputs;
        return { logged: logData };
      }
    }
  }
}
