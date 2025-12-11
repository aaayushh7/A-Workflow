import type { WorkflowNode, WorkflowEdge } from '../models/types';

/**
 * Build an adjacency list from nodes and edges
 */
export function buildAdjacency(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  
  // Initialize all nodes with empty adjacency lists
  nodes.forEach(node => adj.set(node.id, []));
  
  // Add edges to adjacency list
  edges.forEach(edge => {
    if (!adj.has(edge.source)) {
      adj.set(edge.source, []);
    }
    adj.get(edge.source)!.push(edge.target);
  });
  
  return adj;
}

/**
 * Detect cycles in the workflow graph using DFS
 * Returns true if a cycle is detected
 */
export function detectCycle(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): boolean {
  const adj = buildAdjacency(nodes, edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adj.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Back edge found - cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

/**
 * Find nodes that should be start nodes (type 'start' or in-degree 0)
 */
export function findStartNodes(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const inDegree = new Map<string, number>();
  
  // Initialize in-degree for all nodes
  nodes.forEach(node => inDegree.set(node.id, 0));
  
  // Count incoming edges
  edges.forEach(edge => {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  });
  
  // Return nodes with type 'start' OR in-degree 0
  return nodes.filter(node => 
    node.type === 'start' || (inDegree.get(node.id) ?? 0) === 0
  );
}

/**
 * Find nodes that should be end nodes (type 'end' or out-degree 0)
 */
export function findEndNodes(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const outDegree = new Map<string, number>();
  
  // Initialize out-degree for all nodes
  nodes.forEach(node => outDegree.set(node.id, 0));
  
  // Count outgoing edges
  edges.forEach(edge => {
    outDegree.set(edge.source, (outDegree.get(edge.source) ?? 0) + 1);
  });
  
  // Return nodes with type 'end' OR out-degree 0
  return nodes.filter(node => 
    node.type === 'end' || (outDegree.get(node.id) ?? 0) === 0
  );
}

/**
 * Check if all nodes are reachable from start nodes
 * Returns list of disconnected node IDs
 */
export function findDisconnectedNodes(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): string[] {
  if (nodes.length === 0) return [];
  
  const adj = buildAdjacency(nodes, edges);
  const startNodes = findStartNodes(nodes, edges);
  
  if (startNodes.length === 0) {
    return nodes.map(n => n.id);
  }

  const visited = new Set<string>();
  const stack = startNodes.map(n => n.id);

  while (stack.length > 0) {
    const nodeId = stack.pop()!;
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      const neighbors = adj.get(nodeId) ?? [];
      neighbors.forEach(neighbor => stack.push(neighbor));
    }
  }

  return nodes.filter(node => !visited.has(node.id)).map(node => node.id);
}

/**
 * Perform topological sort on the workflow graph
 * Returns null if the graph has cycles
 */
export function topologicalSort(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): WorkflowNode[] | null {
  if (detectCycle(nodes, edges)) {
    return null;
  }

  const adj = buildAdjacency(nodes, edges);
  const inDegree = new Map<string, number>();
  
  // Initialize in-degree
  nodes.forEach(node => inDegree.set(node.id, 0));
  edges.forEach(edge => {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  });

  // Start with nodes that have in-degree 0
  const queue: string[] = [];
  nodes.forEach(node => {
    if ((inDegree.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
    }
  });

  const result: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      result.push(node);
    }

    const neighbors = adj.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result.length === nodes.length ? result : null;
}

/**
 * Get execution order for simulation
 * Uses topological sort, falling back to simple node order if cycles exist
 */
export function getExecutionOrder(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const sorted = topologicalSort(nodes, edges);
  return sorted ?? nodes;
}

