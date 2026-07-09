import { useEffect, useMemo, useState } from 'react';
import { buildPreview } from '../../snippets/api/snippets-api';
import type { ConsoleEntry } from './ConsolePanel';

export const PreviewFrame = ({
  html,
  css,
  javascript,
  runVersion,
  onConsoleMessage,
}: {
  html: string;
  css: string;
  javascript: string;
  runVersion: number;
  onConsoleMessage: (entry: ConsoleEntry) => void;
}) => {
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Sandboxed iframes (sandbox="allow-scripts" without allow-same-origin) report
      // an opaque origin represented as the string "null". Accept that origin plus
      // the same origin as the parent window for flexibility in testing.
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
    if (status === 'loading') return 'Building preview…';
    if (status === 'error') return 'Preview generation failed.';
    if (status === 'ready') return 'Preview ready';
    return 'Run the snippet to view a preview.';
  }, [status]);

  return (
    <section className="panel preview-frame">
      <div className="preview-frame__header">
        <h3>Preview</h3>
        <span className="status">{statusText}</span>
      </div>
      <iframe className="preview-frame__iframe" sandbox="allow-scripts" srcDoc={srcDoc} title="Snippet preview" />
    </section>
  );
};
