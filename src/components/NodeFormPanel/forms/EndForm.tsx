import { useForm } from 'react-hook-form';
import type { EndNodeData } from '../../../models/types';

interface EndFormProps {
  data: EndNodeData;
  onSave: (data: EndNodeData) => void;
}

interface FormValues {
  title: string;
  message: string;
  summary: boolean;
}

export default function EndForm({ data, onSave }: EndFormProps) {
  const { register, handleSubmit, formState: { isDirty } } = useForm<FormValues>({
    defaultValues: {
      title: data.title || 'End',
      message: data.message || '',
      summary: data.summary ?? true,
    },
  });

  const onSubmit = (formData: FormValues) => {
    onSave({
      ...data,
      title: formData.title,
      message: formData.message,
      summary: formData.summary,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          {...register('title')}
          className="form-input"
          placeholder="Enter end node title"
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Completion Message</label>
        <textarea
          {...register('message')}
          className="form-textarea"
          placeholder="Message to display when workflow completes..."
          rows={3}
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <div className="form-checkbox-group">
          <input
            {...register('summary')}
            type="checkbox"
            id="summary-toggle"
            className="form-checkbox"
          />
          <label htmlFor="summary-toggle" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
            Generate Summary Report
          </label>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
          When enabled, a summary of all workflow steps will be generated upon completion.
        </span>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ marginTop: 20, width: '100%' }}
        disabled={!isDirty}
      >
        Save Changes
      </button>
    </form>
  );
}

