import { useCallback, useEffect, useRef, useState } from 'react'
import type * as THREE from 'three';
import { button, folder, useControls } from 'leva';
import { getThreeUrl } from './getThreeUrl';
import { replaceShaderChunks } from './replaceShaderChunks';
import { SceneRenderer } from './SceneRenderer';
import { materialConfigs, type MaterialType } from './materialConfigs';
import { threeRevisions, type ThreeRevision, DEFAULT_THREE_REVISION } from './threeRevisions';
import { ShaderEditor, type ShaderEditorHandle } from './ShaderEditor';

const DEFAULT_MATERIAL_TYPE = 'standard';

export function App() {
  const [three, setThree] = useState<typeof THREE | null>(null);

  const { materialType, threeRevision } = useControls({
    controls: folder({
      threeRevision: {
        value: DEFAULT_THREE_REVISION,
        options: Object.keys(threeRevisions),
      },
      materialType: {
        value: DEFAULT_MATERIAL_TYPE,
        options: Object.keys(materialConfigs),
      },
    }),
    links: folder({
      'Source (GitHub)': button(() => window.open('https://github.com/0b5vr/three-webgl-shader-inspector', '_blank')),
    }),
  });

  const refEditorVert = useRef<ShaderEditorHandle>(null);
  const refEditorFrag = useRef<ShaderEditorHandle>(null);
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
      const three = await import(/* @vite-ignore */ getThreeUrl(`0.${revision}`)) as typeof THREE;
      setThree(three);

      // Create new renderer
      if (refCanvas.current) {
        refSceneRenderer.current = new SceneRenderer(three, refCanvas.current);
        refSceneRenderer.current.start();
      }

      // Set default shaders
      const vertCode = replaceShaderChunks(three.ShaderLib[DEFAULT_MATERIAL_TYPE].vertexShader, three.ShaderChunk);
      refEditorVert.current?.initCode(vertCode);
      const fragCode = replaceShaderChunks(three.ShaderLib[DEFAULT_MATERIAL_TYPE].fragmentShader, three.ShaderChunk);
      refEditorFrag.current?.initCode(fragCode);

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
      refEditorVert.current?.initCode(vertexShader);
      refEditorFrag.current?.initCode(fragmentShader);

      // Update material in renderer
      refSceneRenderer.current.updateMaterial(vertexShader, fragmentShader, materialType as MaterialType);
    }
  }, [three, materialType]);

  // Update shaders in renderer when Ctrl+S or Ctrl+R is pressed
  const updateShaders = useCallback(() => {
    const codeVert = refEditorVert.current?.getValue() ?? '';
    const codeFrag = refEditorFrag.current?.getValue() ?? '';
    refSceneRenderer.current?.updateMaterial(codeVert, codeFrag, materialType as MaterialType);
  }, [materialType]);

  return (
    <div className="flex h-screen w-screen bg-black">
      <div className="flex-1 w-1/2 h-full flex flex-col">
        <div className="flex-1 h-1/2 border-b border-gray-700">
          <ShaderEditor
            ref={refEditorVert}
            onUpdate={updateShaders}
          />
        </div>
        <div className="flex-1 h-1/2">
          <ShaderEditor
            ref={refEditorFrag}
            onUpdate={updateShaders}
          />
        </div>
      </div>
      <div className="flex-1 w-1/2 h-full border-r border-gray-700 relative">
        <canvas ref={refCanvas} className="w-full h-full" />
      </div>
    </div>
  );
}
