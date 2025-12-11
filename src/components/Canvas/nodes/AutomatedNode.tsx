import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap, Settings } from 'lucide-react';
import type { AutomatedNodeData, WorkflowNode } from '../../../models/types';

export default function AutomatedNode({ data }: NodeProps<WorkflowNode>) {
  const nodeData = data as AutomatedNodeData;
  const paramsCount = nodeData.actionParams 
    ? Object.keys(nodeData.actionParams).filter(k => nodeData.actionParams![k]).length 
    : 0;

  return (
    <div className="workflow-node automated">
      <div className="node-header">
        <div className="node-icon automated">
          <Zap size={14} />
        </div>
        <div className="node-title">{nodeData.title || 'Automated'}</div>
      </div>
      
      <div className="node-content">
        {nodeData.actionId ? (
          <div className="node-subtitle node-subtitle-with-icon">
            <Settings size={12} />
            {nodeData.actionId.replace(/_/g, ' ')}
          </div>
        ) : (
          <div className="node-subtitle node-subtitle-warning">
            No action selected
          </div>
        )}
        {paramsCount > 0 && (
          <div className="node-subtitle">
            {paramsCount} param{paramsCount > 1 ? 's' : ''} configured
          </div>
        )}
      </div>
      
      <div className="node-badge automated">Automated</div>
      
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

