import { useState } from 'react';
import { 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  FileJson,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import client from '../api/client';
import { useWorkflow } from '../hooks/useWorkflow';
import { validateWorkflow } from '../hooks/useGraphValidation';
import type { SimulationResult, SimulationStep } from '../models/types';

export default function SandboxPanel() {
  const { exportWorkflow, nodes, edges } = useWorkflow();
  const [logs, setLogs] = useState<SimulationStep[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleSimulate = async () => {
    setLogs([]);
    setErrors([]);
    setWarnings([]);

    // First validate the workflow
    const workflow = exportWorkflow();
    const validation = validateWorkflow(nodes, edges);
    
    setWarnings(validation.warnings || []);
    
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    // Run simulation
    setRunning(true);
    try {
      const response = await client.post<SimulationResult>('/simulate', { workflow });
      
      if (response.data.status === 'ok') {
        setLogs(response.data.execution);
      } else {
        setErrors([response.data.error || 'Simulation failed']);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run simulation';
      setErrors([errorMessage]);
    } finally {
      setRunning(false);
    }
  };

  const handleValidate = () => {
    setLogs([]);
    setErrors([]);
    setWarnings([]);

    const validation = validateWorkflow(nodes, edges);
    setErrors(validation.errors);
    setWarnings(validation.warnings || []);
  };

  const workflow = exportWorkflow();

  return (
    <div className="panel sandbox-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Play size={16} />
          Sandbox
        </div>
        <div className="panel-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleValidate}
            disabled={running || nodes.length === 0}
          >
            Validate
          </button>
          <button 
            className="btn btn-success"
            onClick={handleSimulate}
            disabled={running || nodes.length === 0}
          >
            {running ? (
              <>
                <Loader2 size={14} className="spin-icon" />
                Running...
              </>
            ) : (
              <>
                <Play size={14} />
                Test Workflow
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="validation-errors">
          <h4>
            <AlertTriangle size={14} />
            Validation Errors
          </h4>
          <ul>
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="validation-warnings">
          <h4>
            <AlertTriangle size={14} />
            Warnings
          </h4>
          <ul>
            {warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Execution Log */}
      <div className="execution-section">
        <div className="sidebar-section-title">
          Execution Log
        </div>
        {logs.length === 0 && !running ? (
          <div className="empty-state empty-state-compact">
            <div className="empty-state-icon">
              <Play size={20} />
            </div>
            <h3>No simulation run yet</h3>
            <p>Click "Test Workflow" to simulate execution</p>
          </div>
        ) : (
          <div className="execution-log">
            {logs.map((log, idx) => (
              <div key={idx} className={`log-item ${log.status}`}>
                <div className="log-item-header">
                  <span className="log-item-type">{log.nodeType}</span>
                  <span className="log-item-id">{log.nodeId}</span>
                  <span className={`log-item-status ${log.status}`}>
                    {log.status === 'completed' && <CheckCircle2 size={10} />}
                    {log.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="log-item-message">{log.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JSON Preview Toggle */}
      <div className="json-toggle-section">
        <button
          className="btn btn-secondary btn-toggle"
          onClick={() => setShowJson(!showJson)}
        >
          <span className="btn-toggle-label">
            <FileJson size={14} />
            Workflow JSON
          </span>
          {showJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {showJson && (
          <div className="json-preview">
            {JSON.stringify(workflow, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}

