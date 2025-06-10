import { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { editor } from 'monaco-editor';
import Editor, { type Monaco } from '@monaco-editor/react';
import { foldIncludes } from './foldIncludes';
import { editorSetValue } from './editorSetValue';

interface ShaderEditorProps {
  initialValue?: string;
  onUpdate: () => void;
  language?: string;
  ref?: React.Ref<ShaderEditorHandle>;
}

export interface ShaderEditorHandle {
  getValue: () => string;
  initCode: (code: string) => void;
  getEditor: () => editor.IStandaloneCodeEditor | null;
}

export function ShaderEditor({ onUpdate, language = 'cpp', ref }: ShaderEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState('');
  const refPendingValue = useRef<string | null>(null);

  const initCode = useCallback(async (code: string) => {
    const editor = editorRef.current;

    if (editor) {
      editorSetValue(editor, code);
      await foldIncludes(editor);
    } else {
      refPendingValue.current = code;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() ?? '',
    initCode,
    getEditor: () => editorRef.current,
  }));

  const handleEditorDidMount = useCallback(async (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, onUpdate);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, onUpdate);

    // Set initial value
    if (refPendingValue.current) {
      editorSetValue(editor, refPendingValue.current);
      await foldIncludes(editor);
      refPendingValue.current = null;
    }
  }, [onUpdate]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setValue(value);
    }
  }, []);

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onMount={handleEditorDidMount}
      onChange={handleChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
