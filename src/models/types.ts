import type { Node, Edge } from '@xyflow/react';

// Node Types
export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

// Base node data that all nodes share
export interface BaseNodeData {
  title: string;
  [key: string]: unknown;
}

// Start Node Data
export interface StartNodeData extends BaseNodeData {
  metadata?: Array<{ key: string; value: string }>;
}

// Task Node Data
export interface TaskNodeData extends BaseNodeData {
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: Array<{ key: string; value: string }>;
}

// Approval Node Data
export interface ApprovalNodeData extends BaseNodeData {
  approverRole?: string;
  autoApproveThreshold?: number;
}

// Automated Step Node Data
export interface AutomatedNodeData extends BaseNodeData {
  actionId?: string;
  actionParams?: Record<string, string>;
}

// End Node Data
export interface EndNodeData extends BaseNodeData {
  message?: string;
  summary?: boolean;
}

// Union type for all node data
export type WorkflowNodeData = 
  | StartNodeData 
  | TaskNodeData 
  | ApprovalNodeData 
  | AutomatedNodeData 
  | EndNodeData;

// Workflow Node (React Flow compatible)
export type WorkflowNode = Node<WorkflowNodeData, NodeType>;

// Workflow Edge
export type WorkflowEdge = Edge;

// Complete Workflow Structure
export interface Workflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  meta?: {
    name?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// API Types
export interface AutomationAction {
  id: string;
  label: string;
  description?: string;
  params: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
  }>;
}

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  status: 'pending' | 'completed' | 'approved' | 'awaiting_manual_approval' | 'executed' | 'failed';
  message: string;
  timestamp?: string;
}

export interface SimulationResult {
  status: 'ok' | 'error';
  execution: SimulationStep[];
  error?: string;
}

// Validation Types
export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings?: string[];
}

