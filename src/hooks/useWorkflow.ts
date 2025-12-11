import { createContext, useContext, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { 
  WorkflowNode, 
  WorkflowEdge, 
  Workflow, 
  NodeType,
  WorkflowNodeData 
} from '../models/types';

// Default data for each node type
const getDefaultData = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':
      return { title: 'Start', metadata: [] };
    case 'task':
      return { title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval':
      return { title: 'Approval Step', approverRole: '', autoApproveThreshold: 0 };
    case 'automated':
      return { title: 'Automated Action', actionId: '', actionParams: {} };
    case 'end':
      return { title: 'End', message: '', summary: true };
    default:
      return { title: 'Node' };
  }
};

// Context type
export interface WorkflowContextType {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<WorkflowEdge[]>>;
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange<WorkflowEdge>;
  onConnect: OnConnect;
  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  getNode: (nodeId: string) => WorkflowNode | undefined;
  exportWorkflow: () => Workflow;
  importWorkflow: (workflow: Workflow) => void;
  clearWorkflow: () => void;
}

// Create context
export const WorkflowContext = createContext<WorkflowContextType | null>(null);

// Custom hook to use workflow context
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

// Hook to create workflow state (used in provider)
export function useWorkflowState() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection) => {
      const newEdge: WorkflowEdge = {
        id: `edge-${nanoid(6)}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Add a new node
  const addNode = useCallback(
    (type: NodeType, position = { x: 100, y: 100 }) => {
      const id = `${type}-${nanoid(6)}`;
      const newNode: WorkflowNode = {
        id,
        type,
        position,
        data: getDefaultData(type),
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
    },
    [setNodes]
  );

  // Delete a node and its connected edges
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Delete an edge
  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  // Get a specific node
  const getNode = useCallback(
    (nodeId: string) => {
      return nodes.find((node) => node.id === nodeId);
    },
    [nodes]
  );

  // Export workflow as JSON
  const exportWorkflow = useCallback((): Workflow => {
    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })) as WorkflowNode[],
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      meta: {
        updatedAt: new Date().toISOString(),
      },
    };
  }, [nodes, edges]);

  // Import workflow from JSON
  const importWorkflow = useCallback(
    (workflow: Workflow) => {
      if (workflow.nodes) {
        setNodes(workflow.nodes);
      }
      if (workflow.edges) {
        setEdges(workflow.edges);
      }
    },
    [setNodes, setEdges]
  );

  // Clear workflow
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    deleteEdge,
    getNode,
    exportWorkflow,
    importWorkflow,
    clearWorkflow,
  };
}

