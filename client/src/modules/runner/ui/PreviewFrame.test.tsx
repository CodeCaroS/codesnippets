import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreviewFrame } from './PreviewFrame';

const previewApi = vi.hoisted(() => ({ buildPreview: vi.fn() }));

vi.mock('../../snippets/api/snippets-api', () => previewApi);

type DeferredPreview = {
  resolve: (value: { document: string }) => void;
  promise: Promise<{ document: string }>;
};

const createDeferredPreview = (): DeferredPreview => {
  let resolve!: DeferredPreview['resolve'];
  const promise = new Promise<{ document: string }>((complete) => {
    resolve = complete;
  });
  return { resolve, promise };
};

describe('PreviewFrame', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('ignores stale preview documents and console messages from another execution', async () => {
    const firstPreview = createDeferredPreview();
    const secondPreview = createDeferredPreview();
    previewApi.buildPreview
      .mockReturnValueOnce(firstPreview.promise)
      .mockReturnValueOnce(secondPreview.promise);
    const onConsoleMessage = vi.fn();

    const { rerender } = render(
      <PreviewFrame
        css=""
        html="<div />"
        javascript=""
        onConsoleMessage={onConsoleMessage}
        runVersion={1}
      />,
    );
    await waitFor(() => expect(previewApi.buildPreview).toHaveBeenCalledTimes(1));

    rerender(
      <PreviewFrame
        css=""
        html="<div />"
        javascript="console.log('new run')"
        onConsoleMessage={onConsoleMessage}
        runVersion={2}
      />,
    );
    await waitFor(() => expect(previewApi.buildPreview).toHaveBeenCalledTimes(2));

    await act(async () => firstPreview.resolve({ document: '<p>stale</p>' }));
    expect(screen.getByTitle('Snippet preview')).not.toHaveAttribute('srcdoc', '<p>stale</p>');

    await act(async () => secondPreview.resolve({ document: '<p>current</p>' }));
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Snippet preview"]');
    if (!iframe) {
      throw new Error('Preview iframe was not rendered');
    }
    expect(iframe).toHaveAttribute('srcdoc', '<p>current</p>');

    const executionId = previewApi.buildPreview.mock.calls[1]?.[0].executionId;
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        source: 'codesnippets-preview',
        type: 'console',
        executionId: 'stale-execution',
        level: 'log',
        args: ['ignored'],
      },
      origin: 'null',
      source: iframe.contentWindow,
    }));
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        source: 'codesnippets-preview',
        type: 'console',
        executionId,
        level: 'log',
        args: ['accepted'],
      },
      origin: 'null',
      source: iframe.contentWindow,
    }));

    expect(onConsoleMessage).toHaveBeenCalledTimes(1);
    expect(onConsoleMessage).toHaveBeenCalledWith(expect.objectContaining({ level: 'log', text: 'accepted' }));
  });

  it('renders one built document in all fixed viewport presets', async () => {
    previewApi.buildPreview.mockResolvedValue({ document: '<main>shared</main>' });

    render(
      <PreviewFrame
        css=""
        html="<main />"
        javascript=""
        onConsoleMessage={vi.fn()}
        runVersion={1}
      />,
    );

    await waitFor(() => expect(screen.getAllByRole('button', { name: /viewport$/i })).toHaveLength(3));
    expect(screen.getAllByRole('button', { name: /viewport$/i }).map((button) => button.textContent)).toEqual([
      expect.stringContaining('Mobile 390px'),
      expect.stringContaining('Tablet 768px'),
      expect.stringContaining('Desktop 1440px'),
    ]);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(previewApi.buildPreview).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByTitle('Snippet preview')).toHaveAttribute('srcdoc', '<main>shared</main>'));
  });
});
