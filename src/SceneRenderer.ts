import type * as THREE from 'three';
import uvGridPng from './assets/uv-grid.png';
import { materialConfigs, type MaterialType } from './materialConfigs';

export class SceneRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private texture: THREE.Texture;
  private sphere: THREE.Mesh;
  private animationId: number | null = null;

  constructor(private three: typeof THREE, private canvas: HTMLCanvasElement) {
    this.scene = new three.Scene();
    this.scene.background = new three.Color(0x000000);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera = new three.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0.0, 0.0, 2.0);

    this.renderer = new three.WebGLRenderer({
      canvas,
      antialias: true
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new three.SphereGeometry(1, 32, 16);
    this.texture = new three.TextureLoader().load(uvGridPng);
    const material = this._createMaterial(three.ShaderLib.phong.vertexShader, three.ShaderLib.phong.fragmentShader, 'basic');
    this.sphere = new three.Mesh(geometry, material);
    this.scene.add(this.sphere);

    const directionalLight = new three.DirectionalLight(0xffffff, Math.PI / 2.0);
    directionalLight.position.set(1.0, 2.0, 3.0);
    this.scene.add(directionalLight);

    const hemiLight = new three.HemisphereLight(0xffffbb, 0x080820, 0.5);
    this.scene.add(hemiLight);

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  };

  public update = () => {
    this.animationId = requestAnimationFrame(this.update);
    this.renderer.render(this.scene, this.camera);
  };

  public start() {
    this.update();
  }

  public stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public updateMaterial(vertexShader: string, fragmentShader: string, materialType: MaterialType) {
    this.sphere.material = this._createMaterial(vertexShader, fragmentShader, materialType);
  }

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }

  private _createMaterial(vertexShader: string, fragmentShader: string, materialType: MaterialType) {
    const createMaterial = materialConfigs[materialType as MaterialType];
    const material = createMaterial(this.three, this.texture);

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = vertexShader;
      shader.fragmentShader = fragmentShader;
    };
    material.customProgramCacheKey = () => {
      return vertexShader + fragmentShader;
    };

    return material;
  }
}
