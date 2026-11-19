import React, { useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BackdropMode, CameraPreset, JerseyConfig } from '../types/jersey';
import { buildJerseyGeometry } from './jerseyGeometry';
import {
  createFabricBumpTexture,
  renderSleeveCanvas,
  renderTorsoCanvas,
} from './jerseyTexture';

export interface JerseyStageHandle {
  setCameraPreset: (preset: CameraPreset) => void;
  zoomBy: (delta: number) => void;
  captureSnapshot: (width?: number, height?: number) => string;
  captureFrontAndBack: () => Promise<{ front: string; back: string }>;
}

interface JerseyStageProps {
  config: JerseyConfig;
  autoRotate: boolean;
  backdrop: BackdropMode;
}

const CAMERA_PRESETS: Record<CameraPreset, [number, number, number]> = {
  front: [0, 0.08, 2.75],
  back: [0, 0.08, -2.75],
  left: [-2.65, 0.08, 0.25],
  right: [2.65, 0.08, 0.25],
  'three-quarter': [1.65, 0.22, 2.25],
};

export const JerseyStage = React.forwardRef<JerseyStageHandle, JerseyStageProps>(
  ({ config, autoRotate, backdrop }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const jerseyGroupRef = useRef<THREE.Group | null>(null);

    // Offscreen canvases & Three textures
    const torsoCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const leftSleeveCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const rightSleeveCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const torsoTexRef = useRef<THREE.CanvasTexture | null>(null);
    const leftSleeveTexRef = useRef<THREE.CanvasTexture | null>(null);
    const rightSleeveTexRef = useRef<THREE.CanvasTexture | null>(null);
    const bumpTexRef = useRef<THREE.CanvasTexture | null>(null);

    // Materials
    const torsoMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const leftSleeveMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const rightSleeveMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const collarMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const buttonMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const innerMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

    // Camera transition target
    const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
    const autoRotateRef = useRef(autoRotate);
    autoRotateRef.current = autoRotate;

    // Initialize Three.js scene once
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
      camera.position.set(...CAMERA_PRESETS['three-quarter']);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.enablePan = false;
      controls.minDistance = 1.55;
      controls.maxDistance = 4.6;
      controls.minPolarAngle = Math.PI * 0.22;
      controls.maxPolarAngle = Math.PI * 0.78;
      controls.target.set(0, 0.04, 0);
      controls.addEventListener('start', () => {
        targetCamPosRef.current = null;
      });
      controlsRef.current = controls;

      // Studio 3-point lighting + Hemisphere ambient
      const hemi = new THREE.HemisphereLight(0xffffff, 0x303445, 0.95);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.55);
      keyLight.position.set(2.8, 3.8, 3.5);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.75);
      fillLight.position.set(-3.2, 1.8, 2.4);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
      rimLight.position.set(0.2, 2.5, -3.5);
      scene.add(rimLight);

      // Soft contact shadow disc below jersey
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 256;
      shadowCanvas.height = 256;
      const sctx = shadowCanvas.getContext('2d')!;
      const sgrad = sctx.createRadialGradient(128, 128, 12, 128, 128, 120);
      sgrad.addColorStop(0, 'rgba(0,0,0,0.42)');
      sgrad.addColorStop(0.55, 'rgba(0,0,0,0.16)');
      sgrad.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = sgrad;
      sctx.fillRect(0, 0, 256, 256);
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.75, 1.75),
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
        })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.96;
      scene.add(shadowPlane);

      // Create canvases & textures
      const torsoCanvas = document.createElement('canvas');
      torsoCanvas.width = 2048;
      torsoCanvas.height = 1024;
      torsoCanvasRef.current = torsoCanvas;

      const leftSleeveCanvas = document.createElement('canvas');
      leftSleeveCanvas.width = 512;
      leftSleeveCanvas.height = 512;
      leftSleeveCanvasRef.current = leftSleeveCanvas;

      const rightSleeveCanvas = document.createElement('canvas');
      rightSleeveCanvas.width = 512;
      rightSleeveCanvas.height = 512;
      rightSleeveCanvasRef.current = rightSleeveCanvas;

      const torsoTex = new THREE.CanvasTexture(torsoCanvas);
      torsoTex.colorSpace = THREE.SRGBColorSpace;
      torsoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      torsoTexRef.current = torsoTex;

      const leftSleeveTex = new THREE.CanvasTexture(leftSleeveCanvas);
      leftSleeveTex.colorSpace = THREE.SRGBColorSpace;
      leftSleeveTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      leftSleeveTexRef.current = leftSleeveTex;

      const rightSleeveTex = new THREE.CanvasTexture(rightSleeveCanvas);
      rightSleeveTex.colorSpace = THREE.SRGBColorSpace;
      rightSleeveTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      rightSleeveTexRef.current = rightSleeveTex;

      const bumpTex = createFabricBumpTexture('pro-mesh');
      bumpTexRef.current = bumpTex;

      torsoMatRef.current = new THREE.MeshStandardMaterial({
        map: torsoTex,
        bumpMap: bumpTex,
        bumpScale: 0.006,
        roughness: 0.82,
        metalness: 0.02,
      });

      leftSleeveMatRef.current = new THREE.MeshStandardMaterial({
        map: leftSleeveTex,
        bumpMap: bumpTex,
        bumpScale: 0.006,
        roughness: 0.82,
        metalness: 0.02,
      });

      rightSleeveMatRef.current = new THREE.MeshStandardMaterial({
        map: rightSleeveTex,
        bumpMap: bumpTex,
        bumpScale: 0.006,
        roughness: 0.82,
        metalness: 0.02,
      });

      collarMatRef.current = new THREE.MeshStandardMaterial({
        color: '#6E1324',
        bumpMap: bumpTex,
        bumpScale: 0.008,
        roughness: 0.86,
        metalness: 0.02,
        side: THREE.DoubleSide,
      });

      buttonMatRef.current = new THREE.MeshStandardMaterial({
        color: '#F8FAFC',
        roughness: 0.28,
        metalness: 0.12,
      });

      innerMatRef.current = new THREE.MeshStandardMaterial({
        color: '#1b1d24',
        roughness: 0.95,
        metalness: 0,
      });

      const jerseyGroup = new THREE.Group();
      scene.add(jerseyGroup);
      jerseyGroupRef.current = jerseyGroup;

      // Resize observer
      const resizeObserver = new ResizeObserver(() => {
        if (!container || !rendererRef.current || !cameraRef.current) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      });
      resizeObserver.observe(container);

      // Animation loop
      let rafId = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);

        if (targetCamPosRef.current && cameraRef.current) {
          cameraRef.current.position.lerp(targetCamPosRef.current, Math.min(1, dt * 7));
          if (cameraRef.current.position.distanceTo(targetCamPosRef.current) < 0.015) {
            cameraRef.current.position.copy(targetCamPosRef.current);
            targetCamPosRef.current = null;
          }
        }

        if (controlsRef.current) {
          controlsRef.current.autoRotate = autoRotateRef.current;
          controlsRef.current.autoRotateSpeed = 2.0;
          controlsRef.current.update();
        }

        // Subtle floating breath motion when idle
        if (jerseyGroupRef.current) {
          jerseyGroupRef.current.position.y = Math.sin(clock.elapsedTime * 1.4) * 0.012;
        }

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        controls.dispose();
        torsoTex.dispose();
        leftSleeveTex.dispose();
        rightSleeveTex.dispose();
        bumpTex.dispose();
        renderer.dispose();
      };
    }, []);

    // Rebuild 3D geometry when structural attributes change (cut, sport, collar, sleeve)
    useEffect(() => {
      const group = jerseyGroupRef.current;
      if (!group) return;

      // Dispose previous meshes
      while (group.children.length > 0) {
        const child = group.children[0] as THREE.Mesh;
        group.remove(child);
        if (child.geometry) child.geometry.dispose();
      }

      const parts = buildJerseyGeometry(
        config.cut,
        config.sport,
        config.collar,
        config.sleeve
      );

      const torsoMesh = new THREE.Mesh(parts.torso, torsoMatRef.current!);
      group.add(torsoMesh);

      const innerMesh = new THREE.Mesh(parts.innerLining, innerMatRef.current!);
      group.add(innerMesh);

      if (parts.leftSleeve) {
        // Viewer's left (-X) is the wearer's RIGHT sleeve
        const rightWearerSleeve = new THREE.Mesh(
          parts.leftSleeve,
          rightSleeveMatRef.current!
        );
        group.add(rightWearerSleeve);
      }

      if (parts.rightSleeve) {
        // Viewer's right (+X) is the wearer's LEFT sleeve
        const leftWearerSleeve = new THREE.Mesh(
          parts.rightSleeve,
          leftSleeveMatRef.current!
        );
        group.add(leftWearerSleeve);
      }

      const collarMesh = new THREE.Mesh(parts.collar, collarMatRef.current!);
      group.add(collarMesh);

      if (parts.placket) {
        const placketMesh = new THREE.Mesh(parts.placket, collarMatRef.current!);
        group.add(placketMesh);
      }

      if (parts.buttons.length > 0) {
        const btnGeom = new THREE.CylinderGeometry(0.016, 0.016, 0.008, 18);
        btnGeom.rotateX(Math.PI / 2);
        for (const pos of parts.buttons) {
          const btn = new THREE.Mesh(btnGeom, buttonMatRef.current!);
          btn.position.copy(pos);
          group.add(btn);
        }
      }
    }, [config.cut, config.sport, config.collar, config.sleeve]);

    // Update fabric bump map & roughness when fabric changes
    useEffect(() => {
      const nextBump = createFabricBumpTexture(config.fabric);
      const oldBump = bumpTexRef.current;
      bumpTexRef.current = nextBump;

      const roughnessMap: Record<JerseyConfig['fabric'], number> = {
        'pro-mesh': 0.84,
        'micro-interlock': 0.72,
        pique: 0.9,
        'matte-poly': 0.78,
      };
      const bumpScaleMap: Record<JerseyConfig['fabric'], number> = {
        'pro-mesh': 0.008,
        'micro-interlock': 0.004,
        pique: 0.011,
        'matte-poly': 0.0025,
      };

      const mats = [
        torsoMatRef.current,
        leftSleeveMatRef.current,
        rightSleeveMatRef.current,
        collarMatRef.current,
      ];
      for (const m of mats) {
        if (!m) continue;
        m.bumpMap = nextBump;
        m.bumpScale = bumpScaleMap[config.fabric];
        m.roughness = roughnessMap[config.fabric];
        m.needsUpdate = true;
      }

      if (oldBump) oldBump.dispose();
    }, [config.fabric]);

    // Re-render 2D sublimation textures whenever design config updates
    useEffect(() => {
      let cancelled = false;

      if (collarMatRef.current) {
        collarMatRef.current.color.set(config.colors.collar);
      }
      if (buttonMatRef.current) {
        buttonMatRef.current.color.set(config.colors.buttons);
      }

      const updateTextures = async () => {
        if (torsoCanvasRef.current && torsoTexRef.current) {
          await renderTorsoCanvas(torsoCanvasRef.current, config);
          if (!cancelled) torsoTexRef.current.needsUpdate = true;
        }
        if (leftSleeveCanvasRef.current && leftSleeveTexRef.current) {
          await renderSleeveCanvas(leftSleeveCanvasRef.current, config, 'left-sleeve');
          if (!cancelled) leftSleeveTexRef.current.needsUpdate = true;
        }
        if (rightSleeveCanvasRef.current && rightSleeveTexRef.current) {
          await renderSleeveCanvas(rightSleeveCanvasRef.current, config, 'right-sleeve');
          if (!cancelled) rightSleeveTexRef.current.needsUpdate = true;
        }
      };

      // Also re-render once web fonts finish loading
      updateTextures();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (!cancelled) updateTextures();
        });
      }

      return () => {
        cancelled = true;
      };
    }, [config]);

    useImperativeHandle(ref, () => ({
      setCameraPreset(preset: CameraPreset) {
        targetCamPosRef.current = new THREE.Vector3(...CAMERA_PRESETS[preset]);
      },
      zoomBy(delta: number) {
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        if (!cam || !ctrl) return;
        const dir = cam.position.clone().sub(ctrl.target);
        const nextLen = THREE.MathUtils.clamp(dir.length() + delta, 1.55, 4.6);
        dir.setLength(nextLen);
        targetCamPosRef.current = ctrl.target.clone().add(dir);
      },
      captureSnapshot() {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const cam = cameraRef.current;
        if (!renderer || !scene || !cam) return '';
        renderer.render(scene, cam);
        return renderer.domElement.toDataURL('image/png');
      },
      async captureFrontAndBack() {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        if (!renderer || !scene || !cam || !ctrl) {
          return { front: '', back: '' };
        }
        const savedPos = cam.position.clone();
        const savedAuto = autoRotateRef.current;
        autoRotateRef.current = false;

        cam.position.set(...CAMERA_PRESETS.front);
        cam.lookAt(ctrl.target);
        renderer.render(scene, cam);
        const front = renderer.domElement.toDataURL('image/png');

        cam.position.set(...CAMERA_PRESETS.back);
        cam.lookAt(ctrl.target);
        renderer.render(scene, cam);
        const back = renderer.domElement.toDataURL('image/png');

        cam.position.copy(savedPos);
        cam.lookAt(ctrl.target);
        renderer.render(scene, cam);
        autoRotateRef.current = savedAuto;

        return { front, back };
      },
    }));

    const backdropClass =
      backdrop === 'studio-light'
        ? 'bg-[radial-gradient(ellipse_at_center,_#ffffff_0%,_#e4e4e7_68%,_#d4d4d8_100%)]'
        : backdrop === 'arena'
          ? 'bg-[radial-gradient(ellipse_at_top,_#3b0a18_0%,_#11131a_55%,_#09090b_100%)]'
          : 'bg-[radial-gradient(ellipse_at_center,_#27272a_0%,_#18181b_62%,_#09090b_100%)]';

    return (
      <div className={`relative w-full h-full select-none ${backdropClass} transition-colors duration-300`}>
        {/* Subtle studio grid accent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>
    );
  }
);

JerseyStage.displayName = 'JerseyStage';
