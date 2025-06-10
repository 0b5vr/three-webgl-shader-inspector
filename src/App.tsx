import { useCallback, useEffect, useRef, useState } from 'react'
import type * as THREE from 'three';
import { useControls } from 'leva';
import { editor } from 'monaco-editor';
import Editor, { type Monaco } from '@monaco-editor/react';
import { getThreeUrl } from './getThreeUrl';
import { replaceShaderChunks } from './replaceShaderChunks';
import { SceneRenderer } from './SceneRenderer';
import { materialConfigs, type MaterialType } from './materialConfigs';
import { threeRevisions, type ThreeRevision, DEFAULT_THREE_REVISION } from './threeRevisions';
import { foldIncludes } from './foldIncludes';

const DEFAULT_MATERIAL_TYPE = 'standard';

export function App() {
  const [three, setThree] = useState<typeof THREE | null>(null);

  const [codeVert, setCodeVert] = useState('');
  const [codeFrag, setCodeFrag] = useState('');

  const { materialType, threeRevision } = useControls({
    threeRevision: {
      value: DEFAULT_THREE_REVISION,
      options: Object.keys(threeRevisions),
    },
    materialType: {
      value: DEFAULT_MATERIAL_TYPE,
      options: Object.keys(materialConfigs),
    }
  });

  const refEditorVert = useRef<editor.IStandaloneCodeEditor>(null);
  const refEditorFrag = useRef<editor.IStandaloneCodeEditor>(null);
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const refSceneRenderer = useRef<SceneRenderer | null>(null);

  // Initial / When Three.js revision changes
  useEffect(() => {
    (async () => {
      // Dispose existing renderer when revision changes
      if (refSceneRenderer.current) {
        refSceneRenderer.current.dispose();
        refSceneRenderer.current = null;
      }

      // Load selected three.js from CDN
      const revision = threeRevisions[threeRevision as ThreeRevision];
      const three = await import(getThreeUrl(`0.${revision}`)) as typeof THREE;
      setThree(three);

      // Create new renderer
      if (refCanvas.current) {
        refSceneRenderer.current = new SceneRenderer(three, refCanvas.current);
        refSceneRenderer.current.start();
      }

      // Set default shaders
      setCodeVert(replaceShaderChunks(three.ShaderLib[DEFAULT_MATERIAL_TYPE].vertexShader, three.ShaderChunk));
      setCodeFrag(replaceShaderChunks(three.ShaderLib[DEFAULT_MATERIAL_TYPE].fragmentShader, three.ShaderChunk));

      // Fold includes in editors
      setTimeout(() => {
        if (refEditorVert.current) {
          foldIncludes(refEditorVert.current);
        }
        if (refEditorFrag.current) {
          foldIncludes(refEditorFrag.current);
        }
      }, 1000);

      // Cleanup
      return () => {
        if (refSceneRenderer.current) {
          refSceneRenderer.current.dispose();
          refSceneRenderer.current = null;
        }
      };
    })();
  }, [threeRevision]);

  // When material type changes
  useEffect(() => {
    if (three && refSceneRenderer.current) {
      // Load shaders from ShaderLib / Replace includes
      const vertexShader = replaceShaderChunks(three.ShaderLib[materialType].vertexShader, three.ShaderChunk);
      const fragmentShader = replaceShaderChunks(three.ShaderLib[materialType].fragmentShader, three.ShaderChunk);

      // Update code in editors
      setCodeVert(vertexShader);
      setCodeFrag(fragmentShader);

      // Update material in renderer
      refSceneRenderer.current.updateMaterial(vertexShader, fragmentShader, materialType as MaterialType);

      // Fold includes in editors
      setTimeout(() => {
        if (refEditorVert.current) {
          foldIncludes(refEditorVert.current);
        }
        if (refEditorFrag.current) {
          foldIncludes(refEditorFrag.current);
        }
      }, 1000);
    }
  }, [three, materialType]);

  // Update shaders in renderer when Ctrl+S or Ctrl+R is pressed
  const updateShaders = useCallback(() => {
    const codeVert = refEditorVert.current?.getValue() ?? '';
    const codeFrag = refEditorFrag.current?.getValue() ?? '';
    refSceneRenderer.current?.updateMaterial(codeVert, codeFrag, materialType as MaterialType);
  }, [materialType]);

  // Init vert editor
  const handleEditorDidMountVert = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    refEditorVert.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, updateShaders);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, updateShaders);
  }, [updateShaders]);

  // Init frag editor
  const handleEditorDidMountFrag = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    refEditorFrag.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, updateShaders);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, updateShaders);
  }, [updateShaders]);

  // Handle vert editor change
  const handleEditVert = useCallback((value: string | undefined) => {
    if (value) {
      setCodeVert(value);
    }
  }, []);

  // Handle frag editor change
  const handleEditFrag = useCallback((value: string | undefined) => {
    if (value) {
      setCodeFrag(value);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-black">
      <div className="flex-1 w-1/2 h-full flex flex-col">
        <div className="flex-1 h-1/2 border-b border-gray-700">
          <Editor
            height="100%"
            language="cpp"
            value={codeVert}
            onMount={handleEditorDidMountVert}
            onChange={handleEditVert}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="flex-1 h-1/2">
          <Editor
            height="100%"
            language="cpp"
            value={codeFrag}
            onMount={handleEditorDidMountFrag}
            onChange={handleEditFrag}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
      <div className="flex-1 w-1/2 h-full border-r border-gray-700 relative">
        <canvas ref={refCanvas} className="w-full h-full" />
      </div>
    </div>
  );
}
