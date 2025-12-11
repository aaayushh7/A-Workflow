import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { WorkflowContext, useWorkflowState } from './hooks/useWorkflow';
import Sidebar from './components/Sidebar';
import WorkflowCanvas from './components/Canvas/WorkflowCanvas';
import NodeFormPanel from './components/NodeFormPanel/NodeFormPanel';
import SandboxPanel from './components/SandboxPanel';

// Provider component that wraps children with workflow state context
function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const workflowState = useWorkflowState();
  
  return (
    <WorkflowContext.Provider value={workflowState}>
      {children}
    </WorkflowContext.Provider>
  );
}

// Main app content
function AppContent() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <div className="app">
      <Sidebar />
      
      <WorkflowCanvas onNodeSelect={setSelectedNodeId} />
      
      <div className="right-panel">
        <NodeFormPanel 
          selectedNodeId={selectedNodeId} 
          onClose={() => setSelectedNodeId(null)} 
        />
        <SandboxPanel />
      </div>
    </div>
  );
}

// Root App component
export default function App() {
  return (
    <ReactFlowProvider>
      <WorkflowProvider>
        <AppContent />
      </WorkflowProvider>
    </ReactFlowProvider>
  );
}

