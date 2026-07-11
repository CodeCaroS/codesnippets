import { useState } from 'react';
import type { ReactNode } from 'react';
import { Bot, Check, Code, Copy, Lock, Server, Terminal } from 'lucide-react';

const endpoints = [
  { method: 'GET', path: '/api/health', desc: 'Reports backend and database health for the local workspace.' },
  { method: 'GET', path: '/api/snippets', desc: 'Lists snippets with filters for archived, favorite, category, tag, and sorting.' },
  { method: 'POST', path: '/api/snippets', desc: 'Creates a new HTML, CSS, and JavaScript playground snippet.' },
  { method: 'PATCH', path: '/api/snippets/:id', desc: 'Updates snippet code and metadata.' },
  { method: 'POST', path: '/api/search', desc: 'Runs a structured snippet search for agent workflows.' },
  { method: 'POST', path: '/api/run', desc: 'Builds the sandboxed preview document.' },
  { method: 'GET', path: '/api/export', desc: 'Exports the snippet library as JSON.' },
  { method: 'POST', path: '/api/import', desc: 'Imports a snippet library JSON payload.' },
  { method: 'GET', path: '/api/docs', desc: 'Returns the OpenAPI specification.' },
];

const systemPrompt = `You are a software assistant working with a local CodeSnippets API.
Use http://localhost:3001/api as the backend base URL.
Search existing snippets before editing.
Read a snippet before patching it.
Keep HTML, CSS, and JavaScript separated in the snippet payload.`;

const sampleCurl = `curl -X POST http://localhost:3001/api/snippets \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Local Ping Monitor","category":"Tools","tags":["monitoring"],"html":"<div id=\\"app\\">Ping</div>","css":"#app{color:#c5a059}","javascript":"console.log(\\"ready\\")"}'`;

export const AgentGuidePage = () => {
  const [copied, setCopied] = useState<string>('');

  const copyToClipboard = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1500);
  };

  return (
    <section className="agent-guide-page reference-scroll-page">
      <div className="reference-page-title">
        <div className="reference-page-title__icon">
          <Bot size={20} />
        </div>
        <div>
          <h1>Personal AI OS Integration Guide</h1>
          <p>Build agent workflows, automation tasks, and local API integrations</p>
        </div>
      </div>

      <div className="reference-panel reference-panel--accent">
        <h2>
          <Server size={14} />
          Developer-First Automation
        </h2>
        <p>
          CodeSnippets exposes a localhost REST API for local automation and agent workflows. Snippet code remains
          isolated in the sandboxed preview iframe.
        </p>
        <div className="agent-guide-page__facts">
          <span>
            <Server size={11} />
            Host: 127.0.0.1:3001
          </span>
          <span>
            <Lock size={11} />
            Sandbox: iframe scripts only
          </span>
        </div>
      </div>

      <div className="reference-panel">
        <h2>
          <Terminal size={14} />
          Stable REST Endpoints
        </h2>
        <div className="endpoint-list">
          {endpoints.map((endpoint) => (
            <div className="endpoint-row" key={`${endpoint.method}-${endpoint.path}`}>
              <div>
                <span className="endpoint-row__method">{endpoint.method}</span>
                <span className="endpoint-row__path">{endpoint.path}</span>
              </div>
              <p>{endpoint.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <CopyBlock
        copied={copied === 'prompt'}
        icon={<Bot size={14} />}
        label="Recommended Agent System Prompt"
        onCopy={() => copyToClipboard('prompt', systemPrompt)}
        value={systemPrompt}
      />
      <CopyBlock
        copied={copied === 'curl'}
        icon={<Code size={14} />}
        label="cURL Integration Sample"
        onCopy={() => copyToClipboard('curl', sampleCurl)}
        value={sampleCurl}
      />
    </section>
  );
};

const CopyBlock = ({
  copied,
  icon,
  label,
  onCopy,
  value,
}: {
  copied: boolean;
  icon: ReactNode;
  label: string;
  onCopy: () => void;
  value: string;
}) => (
  <div className="reference-panel">
    <div className="copy-block__header">
      <h2>
        {icon}
        {label}
      </h2>
      <button className="reference-button reference-button--quiet" onClick={onCopy} type="button">
        {copied ? <Check size={12} /> : <Copy size={12} />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
    <pre className="copy-block__pre">{value}</pre>
  </div>
);
