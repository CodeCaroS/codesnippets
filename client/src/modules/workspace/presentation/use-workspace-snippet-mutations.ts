import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  archiveSnippet,
  createSnippet,
  deleteSnippet,
  duplicateSnippet,
  favoriteSnippet,
  updateSnippet,
} from '../../snippets/api/snippets-api';
import { toEditorState, type EditorState } from '../domain/workspace-editor';

type MutationCallbacks = {
  selectedId: string;
  editorState: EditorState;
  onSelectedIdChange: (snippetId: string) => void;
  onEditorStateChange: (state: EditorState) => void;
  onSavedSnapshotChange: (snapshot: string) => void;
  onConsoleEntry: (level: 'info', text: string) => void;
  onCreateSuccess: () => void;
};

export const useWorkspaceSnippetMutations = ({
  selectedId,
  editorState,
  onSelectedIdChange,
  onEditorStateChange,
  onSavedSnapshotChange,
  onConsoleEntry,
  onCreateSuccess,
}: MutationCallbacks) => {
  const queryClient = useQueryClient();
  const invalidate = async (snippetId?: string): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['snippets'] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
      queryClient.invalidateQueries({ queryKey: ['tags'] }),
      ...(snippetId ? [queryClient.invalidateQueries({ queryKey: ['snippet', snippetId] })] : []),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...editorState, sourceUrl: editorState.sourceUrl.trim() || undefined };
      return selectedId ? updateSnippet(selectedId, payload) : createSnippet(payload);
    },
    onSuccess: async (snippet) => {
      const nextState = toEditorState(snippet);
      onEditorStateChange(nextState);
      onSavedSnapshotChange(JSON.stringify(nextState));
      onSelectedIdChange(snippet.id);
      onConsoleEntry('info', 'Code playground saved successfully.');
      await invalidate(snippet.id);
    },
  });
  const createMutation = useMutation({
    mutationFn: createSnippet,
    onSuccess: async (snippet) => {
      onSelectedIdChange(snippet.id);
      onCreateSuccess();
      onConsoleEntry('info', `Successfully initialized snippet "${snippet.title}".`);
      await invalidate(snippet.id);
    },
  });
  const favoriteMutation = useMutation({ mutationFn: favoriteSnippet, onSuccess: (snippet) => invalidate(snippet.id) });
  const archiveMutation = useMutation({ mutationFn: archiveSnippet, onSuccess: (snippet) => invalidate(snippet.id) });
  const duplicateMutation = useMutation({
    mutationFn: duplicateSnippet,
    onSuccess: async (snippet) => {
      onSelectedIdChange(snippet.id);
      onConsoleEntry('info', `Duplicated code as "${snippet.title}".`);
      await invalidate(snippet.id);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSnippet,
    onSuccess: async () => {
      onSelectedIdChange('');
      onConsoleEntry('info', 'Snippet permanently deleted.');
      await invalidate();
    },
  });

  return { saveMutation, createMutation, favoriteMutation, archiveMutation, duplicateMutation, deleteMutation };
};
