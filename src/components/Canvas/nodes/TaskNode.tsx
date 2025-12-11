import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ClipboardList, User, Calendar } from 'lucide-react';
import type { TaskNodeData, WorkflowNode } from '../../../models/types';

export default function TaskNode({ data }: NodeProps<WorkflowNode>) {
  const nodeData = data as TaskNodeData;

  return (
    <div className="workflow-node task">
      <div className="node-header">
        <div className="node-icon task">
          <ClipboardList size={14} />
        </div>
        <div className="node-title">{nodeData.title || 'Task'}</div>
      </div>
      
      {nodeData.description && (
        <div className="node-subtitle node-description">
          {nodeData.description}
        </div>
      )}
      
      <div className="node-content">
        {nodeData.assignee && (
          <div className="node-subtitle node-subtitle-with-icon">
            <User size={12} />
            {nodeData.assignee}
          </div>
        )}
        {nodeData.dueDate && (
          <div className="node-subtitle node-subtitle-with-icon">
            <Calendar size={12} />
            {nodeData.dueDate}
          </div>
        )}
      </div>
      
      <div className="node-badge task">Task</div>
      
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

