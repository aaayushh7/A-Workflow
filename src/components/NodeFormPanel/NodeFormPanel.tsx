import { X, Settings } from 'lucide-react';
import { useWorkflow } from '../../hooks/useWorkflow';
import StartForm from './forms/StartForm';
import TaskForm from './forms/TaskForm';
import ApprovalForm from './forms/ApprovalForm';
import AutomatedForm from './forms/AutomatedForm';
import EndForm from './forms/EndForm';
import type { 
  NodeType, 
  StartNodeData, 
  TaskNodeData, 
  ApprovalNodeData, 
  AutomatedNodeData, 
  EndNodeData,
  WorkflowNodeData
} from '../../models/types';

interface NodeFormPanelProps {
  selectedNodeId: string | null;
  onClose: () => void;
}

// Type-safe form components mapping
const FormComponents: Record<NodeType, React.ComponentType<{ data: WorkflowNodeData; onSave: (data: WorkflowNodeData) => void }>> = {
  start: StartForm as React.ComponentType<{ data: WorkflowNodeData; onSave: (data: WorkflowNodeData) => void }>,
  task: TaskForm as React.ComponentType<{ data: WorkflowNodeData; onSave: (data: WorkflowNodeData) => void }>,
  approval: ApprovalForm as React.ComponentType<{ data: WorkflowNodeData; onSave: (data: WorkflowNodeData) => void }>,
  automated: AutomatedForm as React.ComponentType<{ data: WorkflowNodeData; onSave: (data: WorkflowNodeData) => void }>,
  end: EndForm as React.ComponentType<{ data: WorkflowNodeData; onSave: (data: WorkflowNodeData) => void }>,
};

const NodeTypeLabels: Record<NodeType, string> = {
  start: 'Start Node',
  task: 'Task Node',
  approval: 'Approval Node',
  automated: 'Automated Step',
  end: 'End Node',
};

export default function NodeFormPanel({ selectedNodeId, onClose }: NodeFormPanelProps) {
  const { getNode, updateNodeData } = useWorkflow();

  const selectedNode = selectedNodeId ? getNode(selectedNodeId) : undefined;

  if (!selectedNode) {
    return (
      <div className="panel form-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Settings size={16} />
            Node Configuration
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Settings size={24} />
          </div>
          <h3>No Node Selected</h3>
          <p>Double-click a node on the canvas to edit its configuration</p>
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.type as NodeType;
  const FormComponent = FormComponents[nodeType];

  if (!FormComponent) {
    return (
      <div className="panel form-panel">
        <div className="panel-header">
          <div className="panel-title">Unknown Node Type</div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="empty-state">
          <p>This node type is not supported for editing.</p>
        </div>
      </div>
    );
  }

  const handleSave = (data: WorkflowNodeData) => {
    updateNodeData(selectedNode.id, data);
  };

  return (
    <div className="panel form-panel">
      <div className="panel-header">
        <div className="panel-header-info">
          <div className="panel-title">
            {NodeTypeLabels[nodeType]}
          </div>
          <div className="panel-subtitle">
            ID: {selectedNode.id}
          </div>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="form-content">
        <FormComponent 
          data={selectedNode.data as WorkflowNodeData} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
}

