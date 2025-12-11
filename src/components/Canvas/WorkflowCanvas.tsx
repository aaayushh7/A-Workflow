import { useCallback, useMemo, DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react';
import { useWorkflow } from '../../hooks/useWorkflow';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import ApprovalNode from './nodes/ApprovalNode';
import AutomatedNode from './nodes/AutomatedNode';
import EndNode from './nodes/EndNode';
import type { NodeType, WorkflowNode } from '../../models/types';

interface WorkflowCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
}

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

export default function WorkflowCanvas({ onNodeSelect }: WorkflowCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useWorkflow();

  // Handle double-click on node to open edit panel
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: WorkflowNode) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  // Handle single click to select node
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: WorkflowNode) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  // Handle click on pane to deselect
  const handlePaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Handle drag over for dropping new nodes
  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop to create new node
  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      // Get canvas bounds
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      
      // Calculate position relative to canvas
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 30,
      };

      addNode(type, position);
    },
    [addNode]
  );

  // Minimap colors based on node type
  const nodeColor = useCallback((node: WorkflowNode) => {
    switch (node.type) {
      case 'start':
        return '#10b981';
      case 'task':
        return '#3b82f6';
      case 'approval':
        return '#f59e0b';
      case 'automated':
        return '#8b5cf6';
      case 'end':
        return '#f43f5e';
      default:
        return '#64748b';
    }
  }, []);

  return (
    <div 
      className="canvas-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          type: 'smoothstep',
        }}
        connectionLineStyle={{ strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e293b"
        />
        <Controls 
          showZoom
          showFitView
          showInteractive
          position="bottom-left"
        />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-right"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
          }}
        />
      </ReactFlow>
    </div>
  );
}

