import { useForm } from 'react-hook-form';
import type { ApprovalNodeData } from '../../../models/types';

interface ApprovalFormProps {
  data: ApprovalNodeData;
  onSave: (data: ApprovalNodeData) => void;
}

interface FormValues {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

const APPROVER_ROLES = [
  { value: '', label: 'Select role...' },
  { value: 'Manager', label: 'Manager' },
  { value: 'HRBP', label: 'HR Business Partner (HRBP)' },
  { value: 'Director', label: 'Director' },
  { value: 'VP', label: 'Vice President' },
  { value: 'Finance', label: 'Finance Team' },
  { value: 'Legal', label: 'Legal Team' },
  { value: 'IT', label: 'IT Admin' },
  { value: 'Custom', label: 'Custom (specify in title)' },
];

export default function ApprovalForm({ data, onSave }: ApprovalFormProps) {
  const { register, handleSubmit, formState: { isDirty, errors } } = useForm<FormValues>({
    defaultValues: {
      title: data.title || '',
      approverRole: data.approverRole || '',
      autoApproveThreshold: data.autoApproveThreshold || 0,
    },
  });

  const onSubmit = (formData: FormValues) => {
    onSave({
      ...data,
      title: formData.title,
      approverRole: formData.approverRole,
      autoApproveThreshold: formData.autoApproveThreshold,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          {...register('title')}
          className="form-input"
          placeholder="Enter approval step title"
        />
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">
          Approver Role <span className="required">*</span>
        </label>
        <select
          {...register('approverRole', { required: 'Approver role is required' })}
          className="form-select"
        >
          {APPROVER_ROLES.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors.approverRole && (
          <span style={{ color: 'var(--accent-rose)', fontSize: 12 }}>
            {errors.approverRole.message}
          </span>
        )}
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">
          Auto-Approve Threshold
          <span style={{ 
            marginLeft: 8, 
            color: 'var(--text-muted)', 
            fontWeight: 400,
            fontSize: 11 
          }}>
            (0 = manual approval required)
          </span>
        </label>
        <input
          {...register('autoApproveThreshold', { 
            valueAsNumber: true,
            min: 0,
            max: 100
          })}
          type="number"
          min={0}
          max={100}
          className="form-input"
          placeholder="0"
        />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          If set to a value greater than 0, requests under this threshold will be auto-approved.
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

