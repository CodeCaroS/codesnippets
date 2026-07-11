import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Maximize2, Minimize2, Play, RotateCcw, RotateCw, ShieldAlert } from 'lucide-react';
import { isPreviewConsoleMessage } from '@codesnippets/shared';
import { buildPreview } from '../../snippets/api/snippets-api';
import type { ConsoleEntry } from './ConsolePanel';

const viewportPresets = [
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { id: 'desktop', label: 'Desktop', width: 1440, height: 900 },
] as const;

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
  const previewRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeExecutionIdRef = useRef<string | undefined>(undefined);
  const onConsoleMessageRef = useRef(onConsoleMessage);
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [activeViewport, setActiveViewport] = useState('desktop');
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  onConsoleMessageRef.current = onConsoleMessage;

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === previewRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await previewRef.current?.requestFullscreen();
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'null' || event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      if (!isPreviewConsoleMessage(event.data) || event.data.executionId !== activeExecutionIdRef.current) {
        return;
      }

      onConsoleMessageRef.current({
        id: crypto.randomUUID(),
        level: event.data.level,
        text: event.data.args.join(' '),
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeViewport]);

  useEffect(() => {
    if (runVersion === 0) {
      return;
    }

    const executionId = crypto.randomUUID();
    const abortController = new AbortController();
    activeExecutionIdRef.current = executionId;
    setStatus('loading');
    setSrcDoc('');

    buildPreview({ executionId, html, css, javascript }, abortController.signal)
      .then((response) => {
        if (activeExecutionIdRef.current !== executionId) {
          return;
        }
        setSrcDoc(response.document);
        setStatus('ready');
      })
      .catch(() => {
        if (abortController.signal.aborted || activeExecutionIdRef.current !== executionId) {
          return;
        }
        setStatus('error');
      });

    return () => {
      abortController.abort();
      if (activeExecutionIdRef.current === executionId) {
        activeExecutionIdRef.current = undefined;
      }
    };
  }, [css, html, javascript, runVersion]);

  return (
    <section className="preview-frame" ref={previewRef}>
      <div className="preview-frame__header">
        <div className="preview-frame__title">
          <span className="preview-frame__signal" />
          <h3>Sandboxed Viewport</h3>
          <span
            aria-label={status === 'ready' ? 'Preview ready' : status === 'error' ? 'Preview error' : 'Preview processing'}
            className={`preview-frame__status-light preview-frame__status-light--${status}`}
            role="status"
          />
        </div>
        <div className="preview-frame__actions">
          <button aria-label="Reset Preview" className="preview-frame__icon-button" onClick={onReset} type="button">
            <RotateCcw size={13} />
          </button>
          <button
            aria-label={isFullscreen ? 'Exit fullscreen preview' : 'Open fullscreen preview'}
            className="preview-frame__icon-button"
            onClick={() => void toggleFullscreen()}
            type="button"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
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
        <div className="preview-frame__viewports" role="group" aria-label="Viewport options">
          <div className="preview-frame__viewport-options">
            {viewportPresets.map((viewport) => (
              <button
                aria-label={`Select ${viewport.label} viewport`}
                className={activeViewport === viewport.id ? 'preview-viewport-option preview-viewport-option--active' : 'preview-viewport-option'}
                key={viewport.id}
                onClick={() => setActiveViewport(viewport.id)}
                type="button"
              >
                {viewport.label} {viewport.width}px
              </button>
            ))}
            <button
              aria-label={isLandscape ? 'Use portrait orientation' : 'Use landscape orientation'}
              className="preview-viewport-option"
              disabled={activeViewport === 'desktop'}
              onClick={() => setIsLandscape((value) => !value)}
              type="button"
            >
              <RotateCw size={12} />
              <span>Landscape</span>
            </button>
          </div>
          <div
            className={activeViewport === 'desktop' ? 'preview-viewport-canvas' : 'preview-viewport-canvas preview-viewport-canvas--device'}
            style={{
              '--preview-width': `${(viewportPresets.find((viewport) => viewport.id === activeViewport)?.[isLandscape ? 'height' : 'width'] ?? 1440)}px`,
              '--preview-height': `${(viewportPresets.find((viewport) => viewport.id === activeViewport)?.[isLandscape ? 'width' : 'height'] ?? 900)}px`,
            } as CSSProperties}
          >
            {activeViewport !== 'desktop' ? <span className="preview-viewport-canvas__camera" /> : null}
            <iframe
              className="preview-frame__iframe"
              ref={iframeRef}
              sandbox="allow-scripts"
              srcDoc={srcDoc}
              title="Snippet preview"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
