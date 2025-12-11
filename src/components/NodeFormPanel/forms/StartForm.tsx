import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import type { StartNodeData } from '../../../models/types';

interface StartFormProps {
  data: StartNodeData;
  onSave: (data: StartNodeData) => void;
}

interface FormValues {
  title: string;
  metadata: Array<{ key: string; value: string }>;
}

export default function StartForm({ data, onSave }: StartFormProps) {
  const { register, handleSubmit, control, formState: { isDirty } } = useForm<FormValues>({
    defaultValues: {
      title: data.title || 'Start',
      metadata: data.metadata || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'metadata',
  });

  const onSubmit = (formData: FormValues) => {
    onSave({
      ...data,
      title: formData.title,
      metadata: formData.metadata.filter(m => m.key.trim() !== ''),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">
          Title <span className="required">*</span>
        </label>
        <input
          {...register('title', { required: true })}
          className="form-input"
          placeholder="Enter start node title"
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">
          Metadata (Key-Value Pairs)
        </label>
        <div className="kv-editor">
          {fields.map((field, index) => (
            <div key={field.id} className="kv-row">
              <input
                {...register(`metadata.${index}.key`)}
                className="form-input"
                placeholder="Key"
              />
              <input
                {...register(`metadata.${index}.value`)}
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
            Add Metadata
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

