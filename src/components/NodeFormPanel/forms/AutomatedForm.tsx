import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import client from '../../../api/client';
import type { AutomatedNodeData, AutomationAction } from '../../../models/types';

interface AutomatedFormProps {
  data: AutomatedNodeData;
  onSave: (data: AutomatedNodeData) => void;
}

interface FormValues {
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export default function AutomatedForm({ data, onSave }: AutomatedFormProps) {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = useForm<FormValues>({
    defaultValues: {
      title: data.title || '',
      actionId: data.actionId || '',
      actionParams: data.actionParams || {},
    },
  });

  const selectedActionId = watch('actionId');
  const selectedAction = actions.find(a => a.id === selectedActionId);

  // Fetch available automation actions
  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.get('/automations');
        setActions(response.data || []);
      } catch (err) {
        console.error('Failed to fetch automations:', err);
        setError('Failed to load automation actions');
        // Fallback to default actions
        setActions([
          { id: 'send_email', label: 'Send Email', params: [{ name: 'to', type: 'string' }, { name: 'subject', type: 'string' }] },
          { id: 'generate_doc', label: 'Generate Document', params: [{ name: 'template', type: 'string' }, { name: 'recipient', type: 'string' }] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, []);

  // Initialize action params when action changes
  useEffect(() => {
    if (selectedAction && selectedAction.params) {
      const existingParams = data.actionParams || {};
      selectedAction.params.forEach(param => {
        if (existingParams[param.name] === undefined) {
          setValue(`actionParams.${param.name}`, '');
        }
      });
    }
  }, [selectedAction, data.actionParams, setValue]);

  const onSubmit = (formData: FormValues) => {
    // Only include params for the selected action
    const relevantParams: Record<string, string> = {};
    if (selectedAction) {
      selectedAction.params.forEach(param => {
        if (formData.actionParams[param.name]) {
          relevantParams[param.name] = formData.actionParams[param.name];
        }
      });
    }

    onSave({
      ...data,
      title: formData.title,
      actionId: formData.actionId,
      actionParams: relevantParams,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          {...register('title')}
          className="form-input"
          placeholder="Enter action title"
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">
          Action <span className="required">*</span>
        </label>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
            <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading actions...</span>
          </div>
        ) : (
          <select
            {...register('actionId')}
            className="form-select"
          >
            <option value="">Select an action...</option>
            {actions.map(action => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </select>
        )}
        {error && (
          <span style={{ color: 'var(--accent-amber)', fontSize: 12, marginTop: 4, display: 'block' }}>
            {error}
          </span>
        )}
      </div>

      {selectedAction && selectedAction.description && (
        <div style={{ 
          marginTop: 8, 
          padding: '8px 12px', 
          background: 'var(--bg-primary)', 
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          color: 'var(--text-muted)'
        }}>
          {selectedAction.description}
        </div>
      )}

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="action-params" style={{ marginTop: 16 }}>
          <div className="action-params-title">Action Parameters</div>
          {selectedAction.params.map(param => (
            <div key={param.name} className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">
                {param.name}
                {param.required && <span className="required">*</span>}
              </label>
              <input
                {...register(`actionParams.${param.name}`)}
                className="form-input"
                placeholder={`Enter ${param.name}`}
                type={param.type === 'number' ? 'number' : 'text'}
              />
            </div>
          ))}
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ marginTop: 20, width: '100%' }}
        disabled={!isDirty}
      >
        Save Changes
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}

