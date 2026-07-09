import { describe, expect, it } from 'vitest';
import { buildPreviewDocument } from './preview-builder.js';

describe('preview builder', () => {
  it('keeps user JavaScript as data so Babel can transform JSX in the sandbox', () => {
    const document = buildPreviewDocument({
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
    const document = buildPreviewDocument({
      html: '',
      css: '',
      javascript: 'console.log("</script>")',
    });

    expect(document).toContain('<\\/script>');
    expect(document).not.toContain('console.log("</script>")');
  });
});
