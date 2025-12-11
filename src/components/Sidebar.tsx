import { 
  Play, 
  ClipboardList, 
  UserCheck, 
  Zap, 
  Flag, 
  Workflow,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useWorkflow } from '../hooks/useWorkflow';
import type { NodeType } from '../models/types';

interface PaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: typeof Play;
}

const paletteItems: PaletteItem[] = [
  { 
    type: 'start', 
    label: 'Start', 
    description: 'Workflow entry point',
    icon: Play 
  },
  { 
    type: 'task', 
    label: 'Task', 
    description: 'Human task or activity',
    icon: ClipboardList 
  },
  { 
    type: 'approval', 
    label: 'Approval', 
    description: 'Requires approval to proceed',
    icon: UserCheck 
  },
  { 
    type: 'automated', 
    label: 'Automated', 
    description: 'System-triggered action',
    icon: Zap 
  },
  { 
    type: 'end', 
    label: 'End', 
    description: 'Workflow completion',
    icon: Flag 
  },
];

export default function Sidebar() {
  const { addNode, exportWorkflow, importWorkflow, clearWorkflow, nodes } = useWorkflow();

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleExport = () => {
    const workflow = exportWorkflow();
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'workflow.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const workflow = JSON.parse(event.target?.result as string);
            importWorkflow(workflow);
          } catch (err) {
            console.error('Failed to parse workflow JSON:', err);
            alert('Invalid workflow file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (nodes.length === 0 || confirm('Are you sure you want to clear the workflow?')) {
      clearWorkflow();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Workflow size={24} />
        <h1>HR Workflow Designer</h1>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Node Palette</div>
        <div className="palette-list">
          {paletteItems.map((item) => (
            <div
              key={item.type}
              className="palette-item"
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => addNode(item.type, { x: 200 + Math.random() * 100, y: 100 + Math.random() * 200 })}
            >
              <div className={`palette-icon ${item.type}`}>
                <item.icon size={18} />
              </div>
              <div className="palette-info">
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section sidebar-actions">
        <div className="sidebar-section-title">Actions</div>
        <div className="actions-list">
          <button 
            className="btn btn-secondary btn-action" 
            onClick={handleExport}
          >
            <Download size={16} />
            Export Workflow
          </button>
          <button 
            className="btn btn-secondary btn-action" 
            onClick={handleImport}
          >
            <Upload size={16} />
            Import Workflow
          </button>
          <button 
            className="btn btn-secondary btn-action btn-danger" 
            onClick={handleClear}
          >
            <Trash2 size={16} />
            Clear Canvas
          </button>
        </div>
      </div>

      <div className="workflow-status">
        <div className="workflow-status-dot" />
        <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''} in workflow</span>
      </div>
    </div>
  );
}

