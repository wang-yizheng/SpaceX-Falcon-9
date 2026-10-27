import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildFalcon9, addLandingLegs, RocketModule } from '../utils/rocket';
import { createStarfieldTexture } from '../utils/textures';

interface FalconSceneProps {
  onModuleSelect: (module: RocketModule | null) => void;
  explodeProgress: number;
  selectedModuleIndex: number | null;
}

export default function FalconScene({ onModuleSelect, explodeProgress, selectedModuleIndex }: FalconSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modulesRef = useRef<RocketModule[]>([]);
  const animFrameRef = useRef<number>(0);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const timeRef = useRef<number>(0);
  const landingLegsRef = useRef<THREE.Group | null>(null);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    const starTex = createStarfieldTexture();
    scene.background = starTex;
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 4, 14);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.target.set(0, 2, 0);
    controls.maxPolarAngle = Math.PI * 0.85;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x6688cc, 0.5);
    dirLight2.position.set(-10, 5, -10);
    scene.add(dirLight2);

    const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
    rimLight.position.set(0, -5, 10);
    scene.add(rimLight);

    // Point light near engines for glow effect
    const engineGlow = new THREE.PointLight(0xff6633, 0.3, 10);
    engineGlow.position.set(0, -12, 0);
    scene.add(engineGlow);

    // Build rocket
    const modules = buildFalcon9();
    modulesRef.current = modules;
    modules.forEach((mod) => {
      scene.add(mod.mesh);
    });

    // Add landing legs
    const legs = addLandingLegs(scene, 0);
    landingLegsRef.current = legs;

    // Add a subtle ground plane/grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x222244, 0x111133);
    gridHelper.position.y = -15;
    scene.add(gridHelper);
  }, []);

  // Animation loop
  useEffect(() => {
    initScene();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;

      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initScene]);

  // Handle explode animation
  useEffect(() => {
    const modules = modulesRef.current;
    modules.forEach((mod, index) => {
      const targetPos = new THREE.Vector3().copy(mod.basePosition);
      const offset = mod.explodeOffset.clone().multiplyScalar(explodeProgress);
      targetPos.add(offset);

      // Smooth interpolation
      mod.mesh.position.lerp(targetPos, 0.08);

      // Add subtle floating animation when exploded
      if (explodeProgress > 0.1) {
        const floatOffset = Math.sin(timeRef.current * 0.5 + index * 0.7) * 0.05 * explodeProgress;
        mod.mesh.position.y += floatOffset;
      }

      // Highlight selected module
      if (selectedModuleIndex === index) {
        mod.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshPhongMaterial;
            if (mat.emissive) {
              mat.emissive.setHex(0x224488);
              mat.emissiveIntensity = 0.4 + Math.sin(timeRef.current * 2) * 0.1;
            }
          }
        });
      } else {
        mod.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshPhongMaterial;
            if (mat.emissive) {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          }
        });
      }
    });

    // Fade out landing legs when exploded
    if (landingLegsRef.current) {
      landingLegsRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshPhongMaterial;
          mat.opacity = 1 - explodeProgress;
          mat.transparent = explodeProgress > 0;
        }
      });
    }
  }, [explodeProgress, selectedModuleIndex]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click for module selection
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const allMeshes: THREE.Object3D[] = [];
      modulesRef.current.forEach((m) => {
        m.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) allMeshes.push(child);
        });
      });

      const intersects = raycasterRef.current.intersectObjects(allMeshes, false);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        const moduleIndex = modulesRef.current.findIndex((mod) => {
          let found = false;
          mod.mesh.traverse((child) => {
            if (child === hitObject) found = true;
          });
          return found;
        });
        if (moduleIndex >= 0) {
          onModuleSelect(modulesRef.current[moduleIndex]);
        }
      } else {
        onModuleSelect(null);
      }
    },
    [onModuleSelect]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onClick={handleClick}
      style={{ touchAction: 'none' }}
    />
  );
}
