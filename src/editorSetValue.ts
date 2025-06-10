import type { editor } from 'monaco-editor';

export function editorSetValue(editor: editor.IStandaloneCodeEditor, value: string) {
  const model = editor.getModel();
  if (model) {
    model.setValue(value);
  }
}
