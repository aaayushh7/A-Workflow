import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import type { TaskNodeData } from '../../../models/types';

interface TaskFormProps {
  data: TaskNodeData;
  onSave: (data: TaskNodeData) => void;
}

interface FormValues {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: Array<{ key: string; value: string }>;
}

export default function TaskForm({ data, onSave }: TaskFormProps) {
  const { register, handleSubmit, control, formState: { isDirty, errors } } = useForm<FormValues>({
    defaultValues: {
      title: data.title || '',
      description: data.description || '',
      assignee: data.assignee || '',
      dueDate: data.dueDate || '',
      customFields: data.customFields || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customFields',
  });

  const onSubmit = (formData: FormValues) => {
    onSave({
      ...data,
      title: formData.title,
      description: formData.description,
      assignee: formData.assignee,
      dueDate: formData.dueDate,
      customFields: formData.customFields.filter(f => f.key.trim() !== ''),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">
          Title <span className="required">*</span>
        </label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="form-input"
          placeholder="Enter task title"
        />
        {errors.title && (
          <span style={{ color: 'var(--accent-rose)', fontSize: 12 }}>
            {errors.title.message}
          </span>
        )}
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Description</label>
        <textarea
          {...register('description')}
          className="form-textarea"
          placeholder="Describe the task..."
          rows={3}
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Assignee</label>
        <input
          {...register('assignee')}
          className="form-input"
          placeholder="Who should complete this task?"
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Due Date</label>
        <input
          {...register('dueDate')}
          type="date"
          className="form-input"
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Custom Fields</label>
        <div className="kv-editor">
          {fields.map((field, index) => (
            <div key={field.id} className="kv-row">
              <input
                {...register(`customFields.${index}.key`)}
                className="form-input"
                placeholder="Field name"
              />
              <input
                {...register(`customFields.${index}.value`)}
                className="form-input"
                placeholder="Value"
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => remove(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => append({ key: '', value: '' })}
            style={{ marginTop: 8 }}
          >
            <Plus size={14} />
            Add Custom Field
          </button>
        </div>
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

