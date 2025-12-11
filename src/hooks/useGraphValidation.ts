import { useMemo } from 'react';
import { detectCycle, findStartNodes, findEndNodes, findDisconnectedNodes } from '../utils/graph';
import type { WorkflowNode, WorkflowEdge, ValidationResult, TaskNodeData, ApprovalNodeData } from '../models/types';

/**
 * Validate a workflow and return validation results
 */
export function validateWorkflow(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if workflow is empty
  if (nodes.length === 0) {
    errors.push('Workflow is empty. Add at least one node to create a workflow.');
    return { ok: false, errors, warnings };
  }

  // Check for start nodes
  const startNodes = findStartNodes(nodes, edges);
  const actualStartNodes = nodes.filter(n => n.type === 'start');
  
  if (actualStartNodes.length === 0) {
    errors.push('No Start node found. Every workflow must begin with a Start node.');
  } else if (actualStartNodes.length > 1) {
    warnings.push(`Multiple Start nodes found (${actualStartNodes.length}). Consider using only one Start node.`);
  }

  // Check for end nodes
  const endNodes = findEndNodes(nodes, edges);
  const actualEndNodes = nodes.filter(n => n.type === 'end');
  
  if (actualEndNodes.length === 0) {
    warnings.push('No End node found. Consider adding an End node to mark workflow completion.');
  }

  // Check for cycles
  if (detectCycle(nodes, edges)) {
    errors.push('Cycle detected in workflow. Workflows must be acyclic (DAG).');
  }

  // Check for disconnected nodes
  const disconnectedNodes = findDisconnectedNodes(nodes, edges);
  if (disconnectedNodes.length > 0) {
    const nodeNames = disconnectedNodes.map(id => {
      const node = nodes.find(n => n.id === id);
      return node?.data?.title || id;
    }).join(', ');
    warnings.push(`Disconnected nodes found: ${nodeNames}. These nodes won't be executed.`);
  }

  // Check for nodes without outgoing connections (except end nodes)
  const nodesWithoutOutgoing = nodes.filter(node => {
    if (node.type === 'end') return false;
    return !edges.some(edge => edge.source === node.id);
  });
  
  if (nodesWithoutOutgoing.length > 0) {
    const nodeNames = nodesWithoutOutgoing.map(n => n.data?.title || n.id).join(', ');
    warnings.push(`Nodes without outgoing connections: ${nodeNames}`);
  }

  // Validate individual node configurations
  nodes.forEach(node => {
    switch (node.type) {
      case 'task':
        const taskData = node.data as TaskNodeData;
        if (!taskData?.title || taskData.title.trim() === '' || taskData.title === 'New Task') {
          warnings.push(`Task node "${node.id}" has default/missing title.`);
        }
        break;
        
      case 'approval':
        const approvalData = node.data as ApprovalNodeData;
        if (!approvalData?.approverRole || approvalData.approverRole.trim() === '') {
          errors.push(`Approval node "${approvalData?.title || node.id}" is missing approver role.`);
        }
        break;
        
      case 'automated':
        const automatedData = node.data as Record<string, unknown>;
        if (!automatedData?.actionId) {
          warnings.push(`Automated node "${automatedData?.title || node.id}" has no action selected.`);
        }
        break;
    }
  });

  // Check for edges connecting to non-existent nodes
  const nodeIds = new Set(nodes.map(n => n.id));
  edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} has invalid source: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} has invalid target: ${edge.target}`);
    }
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Hook to validate workflow reactively
 */
export function useGraphValidation(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): ValidationResult {
  return useMemo(() => validateWorkflow(nodes, edges), [nodes, edges]);
}

