import { Button } from '../../../shared/ui/Button';

export const RunnerControls = ({
  isDirty,
  isSaving,
  onSave,
  onRun,
}: {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onRun: () => void;
}) => (
  <div className="runner-controls">
    <span className={isDirty ? 'status status--warning' : 'status'}>{isDirty ? 'Unsaved changes' : 'Saved'}</span>
    <div className="runner-controls__actions">
      <Button disabled={isSaving} onClick={onSave} variant="secondary">
        {isSaving ? 'Saving…' : 'Save'}
      </Button>
      <Button onClick={onRun}>Run</Button>
    </div>
  </div>
);
