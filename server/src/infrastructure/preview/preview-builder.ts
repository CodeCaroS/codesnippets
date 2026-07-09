import { BuildPreviewCommand } from '../../application/use-cases/build-preview-document.js';

const escapeScriptContent = (value: string): string => value.replace(/<\/script/gi, '<\\/script');

export const buildPreviewDocument = ({ html = '', css = '', javascript = '' }: BuildPreviewCommand): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      (() => {
        const serialize = (value) => {
          if (typeof value === 'string') return value;
          try {
            return JSON.stringify(value, null, 2);
          } catch {
            return String(value);
          }
        };

        const postConsoleMessage = (level, args) => {
          // The iframe uses sandbox="allow-scripts" without allow-same-origin, which
          // makes its origin opaque. window.parent.location.origin is inaccessible
          // from inside the sandboxed context, so '*' is required here. The parent
          // validates the message origin and the 'codesnippets-preview' source tag.
          window.parent.postMessage(
            {
              source: 'codesnippets-preview',
              type: 'console',
              level,
              args: args.map(serialize),
            },
            '*',
          );
        };

        ['log', 'warn', 'error'].forEach((level) => {
          const original = console[level].bind(console);
          console[level] = (...args) => {
            postConsoleMessage(level, args);
            original(...args);
          };
        });

        window.addEventListener('error', (event) => {
          postConsoleMessage('error', [event.message]);
        });

        try {
          ${escapeScriptContent(javascript)}
        } catch (error) {
          console.error(error instanceof Error ? error.message : String(error));
        }
      })();
    </script>
  </body>
</html>`;
