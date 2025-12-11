import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { StartNodeData, WorkflowNode } from '../../../models/types';

export default function StartNode({ data }: NodeProps<WorkflowNode>) {
  const nodeData = data as StartNodeData;
  const metadataCount = nodeData?.metadata?.length ?? 0;

  return (
    <div className="workflow-node start">
      <div className="node-header">
        <div className="node-icon start">
          <Play size={14} />
        </div>
        <div className="node-title">{nodeData.title || 'Start'}</div>
      </div>
      <div className="node-subtitle">
        {metadataCount > 0 
          ? `${metadataCount} metadata field${metadataCount > 1 ? 's' : ''}`
          : 'Workflow entry point'}
      </div>
      <div className="node-badge start">Start</div>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source" 
      />
    </div>
  );
}

