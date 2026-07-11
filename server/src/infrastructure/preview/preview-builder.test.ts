import { describe, expect, it } from 'vitest';
import { SandboxedPreviewDocumentBuilder } from './preview-builder.js';

describe('preview builder', () => {
  const previewBuilder = new SandboxedPreviewDocumentBuilder();

  it('keeps user JavaScript as data so Babel can transform JSX in the sandbox', () => {
    const document = previewBuilder.build({
      executionId: '6dce4941-5a76-45a8-a05d-0a0c7c9459c7',
      html: '<div id="root"></div><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>',
      css: '',
      javascript: 'ReactDOM.createRoot(document.getElementById("root")).render(<App />);',
    });

    expect(document).toContain('const userScript =');
    expect(document).toContain('window.Babel.transform');
    expect(document).toContain('new Function(executableScript)();');
    expect(document).toContain('render(<App />)');
  });

  it('escapes closing script tags inside user JavaScript', () => {
    const document = previewBuilder.build({
      executionId: '6dce4941-5a76-45a8-a05d-0a0c7c9459c7',
      html: '',
      css: '',
      javascript: 'console.log("</script>")',
    });

    expect(document).toContain('<\\/script>');
    expect(document).not.toContain('console.log("</script>")');
  });

  it('includes the execution ID in every console message', () => {
    const document = previewBuilder.build({
      executionId: '6dce4941-5a76-45a8-a05d-0a0c7c9459c7',
      html: '',
      css: '',
      javascript: '',
    });

    expect(document).toContain('executionId: "6dce4941-5a76-45a8-a05d-0a0c7c9459c7"');
  });
});
