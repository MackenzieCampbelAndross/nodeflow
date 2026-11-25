import { WorkflowDefinition, PortType, WorkflowNode } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  executionOrder: string[]; // Topological node IDs order
}

export class DAGValidator {
  static arePortsCompatible(fromType: PortType, toType: PortType): boolean {
    if (fromType === 'ANY' || toType === 'ANY') return true;
    if (fromType === toType) return true;
    // Allow Number to String coercion
    if (fromType === 'NUMBER' && toType === 'STRING') return true;
    // Allow Boolean to String coercion
    if (fromType === 'BOOLEAN' && toType === 'STRING') return true;
    return false;
  }

  static validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const nodeMap = new Map<string, WorkflowNode>();

    for (const node of workflow.nodes) {
      nodeMap.set(node.id, node);
    }

    // 1. Validate connection endpoints and type compatibility
    const targetPortSeen = new Set<string>();

    for (const conn of workflow.connections) {
      const fromNode = nodeMap.get(conn.fromNodeId);
      const toNode = nodeMap.get(conn.toNodeId);

      if (!fromNode) {
        errors.push(`Connection ${conn.id} references non-existent source node: ${conn.fromNodeId}`);
        continue;
      }
      if (!toNode) {
        errors.push(`Connection ${conn.id} references non-existent target node: ${conn.toNodeId}`);
        continue;
      }

      const outPort = fromNode.outputs.find((p) => p.id === conn.fromPortId);
      const inPort = toNode.inputs.find((p) => p.id === conn.toPortId);

      if (!outPort) {
        errors.push(`Node ${fromNode.name} (${fromNode.id}) has no output port: ${conn.fromPortId}`);
      }
      if (!inPort) {
        errors.push(`Node ${toNode.name} (${toNode.id}) has no input port: ${conn.toPortId}`);
      }

      if (outPort && inPort) {
        if (!this.arePortsCompatible(outPort.type, inPort.type)) {
          errors.push(
            `Type mismatch on connection: ${fromNode.name}.${outPort.name} (${outPort.type}) is incompatible with ${toNode.name}.${inPort.name} (${inPort.type})`
          );
        }
      }

      // Check for multiple inputs to same port
      const targetKey = `${conn.toNodeId}:${conn.toPortId}`;
      if (targetPortSeen.has(targetKey)) {
        errors.push(`Input port ${conn.toPortId} on node ${toNode.name} has multiple incoming connections`);
      }
      targetPortSeen.add(targetKey);
    }

    // 2. Cycle Detection using Kahn's Algorithm
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const node of workflow.nodes) {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    }

    for (const conn of workflow.connections) {
      if (nodeMap.has(conn.fromNodeId) && nodeMap.has(conn.toNodeId)) {
        inDegree.set(conn.toNodeId, (inDegree.get(conn.toNodeId) || 0) + 1);
        adjList.get(conn.fromNodeId)!.push(conn.toNodeId);
      }
    }

    const queue: string[] = [];
    for (const [nodeId, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(nodeId);
      }
    }

    const executionOrder: string[] = [];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      executionOrder.push(curr);

      for (const neighbor of adjList.get(curr) || []) {
        const newDeg = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (executionOrder.length !== workflow.nodes.length) {
      errors.push('Cycle detected in workflow! Workflow graph must be a Directed Acyclic Graph (DAG).');
    }

    // Check for trigger nodes
    const hasTrigger = workflow.nodes.some((n) => n.category === 'TRIGGER');
    if (!hasTrigger && workflow.nodes.length > 0) {
      warnings.push('Workflow has no Trigger node (e.g. Manual Trigger or Webhook).');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      executionOrder,
    };
  }
}
