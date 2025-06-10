import type { editor } from 'monaco-editor';

export async function foldIncludes(editor: editor.IStandaloneCodeEditor) {
  const model = editor.getModel();
  if (model) {
    const lineCount = model.getLineCount();
    for (let i = 1; i <= lineCount; i++) {
      const lineContent = model.getLineContent(i);
      if (lineContent.trim().startsWith('// #include')) {
        editor.setSelection({ startLineNumber: i, startColumn: 1, endLineNumber: i, endColumn: 1 });
        await editor.getAction('editor.fold')?.run();
      }
    }
  }
}
