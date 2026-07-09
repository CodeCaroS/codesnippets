import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { buildPreview } from '../../snippets/api/snippets-api';
import type { ConsoleEntry } from './ConsolePanel';

export const PreviewFrame = ({
  html,
  css,
  javascript,
  runVersion,
  onConsoleMessage,
  onReset,
  onRun,
}: {
  html: string;
  css: string;
  javascript: string;
  runVersion: number;
  onConsoleMessage: (entry: ConsoleEntry) => void;
  onReset?: () => void;
  onRun?: () => void;
}) => {
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const isAllowedOrigin = event.origin === 'null' || event.origin === window.location.origin;
      if (!isAllowedOrigin) {
        return;
      }

      if (event.data?.source !== 'codesnippets-preview' || event.data?.type !== 'console') {
        return;
      }

      onConsoleMessage({
        id: crypto.randomUUID(),
        level: event.data.level,
        text: Array.isArray(event.data.args) ? event.data.args.join(' ') : '',
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleMessage]);

  useEffect(() => {
    let cancelled = false;

    if (runVersion === 0) {
      return;
    }

    setStatus('loading');
    setSrcDoc('');

    buildPreview(html, css, javascript)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setSrcDoc(response.document);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [css, html, javascript, runVersion]);

  const statusText = useMemo(() => {
    if (status === 'loading') return 'Building preview...';
    if (status === 'error') return 'Preview generation failed.';
    if (status === 'ready') return 'Preview ready';
    return 'Run the snippet to view a preview.';
  }, [status]);

  return (
    <section className="preview-frame">
      <div className="preview-frame__header">
        <div className="preview-frame__title">
          <span className="preview-frame__signal" />
          <h3>Sandboxed Viewport</h3>
        </div>
        <span className="status">{statusText}</span>
        <div className="preview-frame__actions">
          <button aria-label="Reset Preview" className="preview-frame__icon-button" onClick={onReset} type="button">
            <RotateCcw size={13} />
          </button>
          <button className="reference-button reference-button--primary preview-frame__run" onClick={onRun} type="button">
            <Play fill="currentColor" size={11} />
            <span>Run</span>
          </button>
        </div>
      </div>
      <div className="preview-frame__body">
        {status === 'error' ? (
          <div className="preview-frame__error">
            <ShieldAlert size={28} />
            <span>Preview Generation Failed</span>
          </div>
        ) : null}
        <iframe className="preview-frame__iframe" sandbox="allow-scripts" srcDoc={srcDoc} title="Snippet preview" />
      </div>
    </section>
  );
};
