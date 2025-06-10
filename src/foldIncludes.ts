import type { editor } from 'monaco-editor';

export async function foldIncludes(editor: editor.IStandaloneCodeEditor) {
  const model = editor.getModel();
  if (model) {
    const lineCount = model.getLineCount();

    // for each line, if it starts with // #include, fold it
    for (let i = 1; i <= lineCount; i++) {
      const lineContent = model.getLineContent(i);
      if (lineContent.trim().startsWith('// #include')) {
        editor.setSelection({ startLineNumber: i, startColumn: 1, endLineNumber: i, endColumn: 1 });
        await editor.getAction('editor.fold')?.run();
      }
    }

    // Scroll to first line
    editor.revealLine(1);
    editor.setSelection({ startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 });
  }
}
