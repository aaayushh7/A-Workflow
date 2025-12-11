import { Handle, Position, type NodeProps } from '@xyflow/react';
import { UserCheck, Shield } from 'lucide-react';
import type { ApprovalNodeData, WorkflowNode } from '../../../models/types';

export default function ApprovalNode({ data }: NodeProps<WorkflowNode>) {
  const nodeData = data as ApprovalNodeData;
  const hasAutoApprove = nodeData.autoApproveThreshold && nodeData.autoApproveThreshold > 0;

  return (
    <div className="workflow-node approval">
      <div className="node-header">
        <div className="node-icon approval">
          <UserCheck size={14} />
        </div>
        <div className="node-title">{nodeData.title || 'Approval'}</div>
      </div>
      
      <div className="node-content">
        {nodeData.approverRole && (
          <div className="node-subtitle node-subtitle-with-icon">
            <Shield size={12} />
            {nodeData.approverRole}
          </div>
        )}
        {hasAutoApprove && (
          <div className="node-subtitle node-subtitle-success">
            Auto-approve: {nodeData.autoApproveThreshold}
          </div>
        )}
      </div>
      
      <div className="node-badge approval">Approval</div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source" 
      />
    </div>
  );
}

