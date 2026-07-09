import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exportSnippets, importSnippets } from '../../snippets/api/snippets-api';
import { Button } from '../../../shared/ui/Button';
import { Textarea } from '../../../shared/ui/Input';

export const ImportExportPanel = () => {
  const queryClient = useQueryClient();
  const [payload, setPayload] = useState('');
  const [status, setStatus] = useState<string>('');

  const exportMutation = useMutation({
    mutationFn: exportSnippets,
    onSuccess: (data) => {
      setPayload(JSON.stringify(data, null, 2));
      setStatus(`Exported ${data.snippets.length} snippets.`);
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => importSnippets(JSON.parse(payload)),
    onSuccess: async (data) => {
      setStatus(`Imported ${data.imported} snippets.`);
      await queryClient.invalidateQueries({ queryKey: ['snippets'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      setStatus((error as Error).message);
    },
  });

  return (
    <section className="panel stack-lg">
      <div className="page-header">
        <div>
          <h2>Import / Export</h2>
          <p>Move your snippet library between devices with a single JSON payload.</p>
        </div>
        <div className="button-group">
          <Button onClick={() => exportMutation.mutate()} variant="secondary">Export all</Button>
          <Button onClick={() => importMutation.mutate()}>Import JSON</Button>
        </div>
      </div>
      {status ? <p className="status">{status}</p> : null}
      <Textarea
        label="Snippet library JSON"
        rows={20}
        value={payload}
        onChange={(event) => setPayload(event.target.value)}
      />
    </section>
  );
};
