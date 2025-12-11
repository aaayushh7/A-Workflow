import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Flag, FileText } from 'lucide-react';
import type { EndNodeData, WorkflowNode } from '../../../models/types';

export default function EndNode({ data }: NodeProps<WorkflowNode>) {
  const nodeData = data as EndNodeData;

  return (
    <div className="workflow-node end">
      <div className="node-header">
        <div className="node-icon end">
          <Flag size={14} />
        </div>
        <div className="node-title">{nodeData.title || 'End'}</div>
      </div>
      
      <div className="node-content">
        {nodeData.message && (
          <div className="node-subtitle">
            {nodeData.message}
          </div>
        )}
        {nodeData.summary && (
          <div className="node-subtitle node-subtitle-with-icon node-subtitle-info">
            <FileText size={12} />
            Summary enabled
          </div>
        )}
      </div>
      
      <div className="node-badge end">End</div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target" 
      />
    </div>
  );
}

