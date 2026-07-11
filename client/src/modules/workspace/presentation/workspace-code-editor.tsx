import { css as cssLanguage } from '@codemirror/lang-css';
import { html as htmlLanguage } from '@codemirror/lang-html';
import { javascript as javascriptLanguage } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';

type WorkspaceCodeEditorProps = {
  language: 'html' | 'css' | 'javascript';
  value: string;
  onChange: (value: string) => void;
  fontSize: number;
};

const languageExtensions = {
  html: htmlLanguage(),
  css: cssLanguage(),
  javascript: javascriptLanguage(),
};

export default function WorkspaceCodeEditor({ fontSize, language, onChange, value }: WorkspaceCodeEditorProps) {
  return (
    <CodeMirror
      extensions={[languageExtensions[language], EditorView.lineWrapping]}
      height="100%"
      theme={oneDark}
      value={value}
      onChange={onChange}
      style={{ fontSize: `${fontSize}px` }}
    />
  );
}
