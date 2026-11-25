/**
 * Domain types and models for NodeFlow (Visual Node-Based Workflow Automation Editor).
 */

export type PortType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'ANY';

export interface PortDefinition {
  id: string;
  name: string;
  type: PortType;
  description?: string;
}

export type NodeCategory =
  | 'TRIGGER'
  | 'TRANSFORM'
  | 'LOGIC'
  | 'MATH'
  | 'INTEGRATION'
  | 'OUTPUT';

export type NodeType =
  | 'MANUAL_TRIGGER'
  | 'WEBHOOK'
  | 'MATH_OPERATION'
  | 'STRING_FORMATTER'
  | 'FILTER'
  | 'TRANSFORM_JS'
  | 'JSON_PARSER'
  | 'HTTP_REQUEST'
  | 'LOG_OUTPUT';

export type NodeStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'ERROR';

export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeType;
  category: NodeCategory;
  position: { x: number; y: number };
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  config: Record<string, any>;
  status?: NodeStatus;
  lastOutput?: any;
  error?: string;
}

export interface WorkflowConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: number;
  updatedAt: number;
}

export interface ExecutionLog {
  timestamp: number;
  nodeId: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  data?: any;
}

export interface ExecutionResult {
  workflowId: string;
  status: 'SUCCESS' | 'FAILED';
  executionTimeMs: number;
  nodeOutputs: Record<string, any>;
  logs: ExecutionLog[];
}
