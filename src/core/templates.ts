import { NodeType, NodeCategory, PortDefinition, WorkflowNode, WorkflowDefinition } from '../types';

export interface NodeTemplate {
  type: NodeType;
  name: string;
  category: NodeCategory;
  description: string;
  defaultConfig: Record<string, any>;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'MANUAL_TRIGGER',
    name: 'Manual Trigger',
    category: 'TRIGGER',
    description: 'Initiates workflow manually with customizable JSON payload',
    defaultConfig: { payload: { orderId: 'ORD-9821', amount: 150, customer: 'Alice' } },
    inputs: [],
    outputs: [{ id: 'output', name: 'Payload', type: 'JSON' }],
  },
  {
    type: 'MATH_OPERATION',
    name: 'Math Calculator',
    category: 'MATH',
    description: 'Performs arithmetic calculation on numeric inputs',
    defaultConfig: { operation: 'ADD', operandA: 10, operandB: 20 },
    inputs: [
      { id: 'a', name: 'Operand A', type: 'NUMBER' },
      { id: 'b', name: 'Operand B', type: 'NUMBER' },
    ],
    outputs: [{ id: 'result', name: 'Result', type: 'NUMBER' }],
  },
  {
    type: 'STRING_FORMATTER',
    name: 'String Formatter',
    category: 'TRANSFORM',
    description: 'Interpolates variables into a template string',
    defaultConfig: { template: 'Order {{orderId}} processed for ${{amount}}!' },
    inputs: [{ id: 'data', name: 'Data', type: 'ANY' }],
    outputs: [{ id: 'formattedText', name: 'Formatted Text', type: 'STRING' }],
  },
  {
    type: 'FILTER',
    name: 'Conditional Filter',
    category: 'LOGIC',
    description: 'Filters incoming data matching comparison condition',
    defaultConfig: { operator: 'GREATER_THAN', compareValue: 100 },
    inputs: [{ id: 'input', name: 'Input', type: 'ANY' }],
    outputs: [
      { id: 'output', name: 'Passed Data', type: 'ANY' },
      { id: 'passed', name: 'Condition Met', type: 'BOOLEAN' },
    ],
  },
  {
    type: 'JSON_PARSER',
    name: 'JSON Parser & Extractor',
    category: 'TRANSFORM',
    description: 'Parses raw JSON string and extracts nested field paths',
    defaultConfig: { path: '' },
    inputs: [{ id: 'jsonString', name: 'JSON Input', type: 'ANY' }],
    outputs: [{ id: 'parsedData', name: 'Extracted Data', type: 'ANY' }],
  },
  {
    type: 'HTTP_REQUEST',
    name: 'HTTP Webhook Dispatcher',
    category: 'INTEGRATION',
    description: 'Dispatches HTTP payload to remote REST API endpoint',
    defaultConfig: { method: 'POST', url: 'https://api.crm.example/leads' },
    inputs: [{ id: 'body', name: 'Payload Body', type: 'ANY' }],
    outputs: [
      { id: 'statusCode', name: 'Status Code', type: 'NUMBER' },
      { id: 'responseBody', name: 'Response', type: 'JSON' },
    ],
  },
  {
    type: 'LOG_OUTPUT',
    name: 'Execution Logger',
    category: 'OUTPUT',
    description: 'Terminal sink recording workflow outputs and traces',
    defaultConfig: {},
    inputs: [{ id: 'data', name: 'Input', type: 'ANY' }],
    outputs: [{ id: 'logged', name: 'Logged Data', type: 'ANY' }],
  },
];

export const createInitialWorkflow = (): WorkflowDefinition => {
  const triggerNode: WorkflowNode = {
    id: 'node_trigger_1',
    name: 'Start Trigger',
    type: 'MANUAL_TRIGGER',
    category: 'TRIGGER',
    position: { x: 80, y: 150 },
    inputs: [],
    outputs: [{ id: 'output', name: 'Payload', type: 'JSON' }],
    config: { payload: { orderId: 'ORD-5402', amount: 250, customer: 'Mackenzie' } },
  };

  const formatterNode: WorkflowNode = {
    id: 'node_formatter_2',
    name: 'Notification Formatter',
    type: 'STRING_FORMATTER',
    category: 'TRANSFORM',
    position: { x: 420, y: 150 },
    inputs: [{ id: 'data', name: 'Data', type: 'ANY' }],
    outputs: [{ id: 'formattedText', name: 'Formatted Text', type: 'STRING' }],
    config: { template: 'High-value order {{orderId}} received from {{customer}} for ${{amount}}!' },
  };

  const logNode: WorkflowNode = {
    id: 'node_log_3',
    name: 'Audit Logger',
    type: 'LOG_OUTPUT',
    category: 'OUTPUT',
    position: { x: 780, y: 150 },
    inputs: [{ id: 'data', name: 'Input', type: 'ANY' }],
    outputs: [{ id: 'logged', name: 'Logged Data', type: 'ANY' }],
    config: {},
  };

  return {
    id: 'wf_starter_pipeline',
    name: 'E-Commerce Order Notification Pipeline',
    description: 'Parses incoming order payload, constructs template notification, and logs to terminal sink',
    nodes: [triggerNode, formatterNode, logNode],
    connections: [
      {
        id: 'conn_1_2',
        fromNodeId: 'node_trigger_1',
        fromPortId: 'output',
        toNodeId: 'node_formatter_2',
        toPortId: 'data',
      },
      {
        id: 'conn_2_3',
        fromNodeId: 'node_formatter_2',
        fromPortId: 'formattedText',
        toNodeId: 'node_log_3',
        toPortId: 'data',
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};
