import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildFalcon9, addLandingLegs, RocketModule } from '../utils/rocket';
import { createStarfieldTexture } from '../utils/textures';

interface FalconSceneProps {
  onModuleSelect: (module: RocketModule | null) => void;
  explodeProgress: number; // 0 to 2
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
    scene.fog = new THREE.FogExp2(0x050510, 0.006);
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
    renderer.toneMappingExposure = 1.3;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.target.set(0, 2, 0);
    controls.maxPolarAngle = Math.PI * 0.9;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x303050, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e8, 1.5);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x6688cc, 0.5);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff8844, 0.4);
    rimLight.position.set(-5, -3, 8);
    scene.add(rimLight);

    const engineGlow = new THREE.PointLight(0xff6633, 0.4, 12);
    engineGlow.position.set(0, -12, 0);
    scene.add(engineGlow);

    const topLight = new THREE.PointLight(0x4488ff, 0.3, 20);
    topLight.position.set(0, 20, 0);
    scene.add(topLight);

    // Build rocket
    const modules = buildFalcon9();
    modulesRef.current = modules;
    modules.forEach((mod) => {
      scene.add(mod.mesh);
    });

    // Add landing legs
    const legs = addLandingLegs(scene);
    landingLegsRef.current = legs;

    // Ground reference grid
    const gridHelper = new THREE.GridHelper(40, 40, 0x1a1a3a, 0x0a0a2a);
    gridHelper.position.y = -15.5;
    scene.add(gridHelper);

    // Circular platform
    const platformGeo = new THREE.CylinderGeometry(3, 3.5, 0.3, 64);
    const platformMat = new THREE.MeshPhongMaterial({ color: 0x1a1a2a, shininess: 30 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -15.3;
    scene.add(platform);

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

  // Handle explode animation and highlighting
  useEffect(() => {
    const modules = modulesRef.current;
    // explodeProgress: 0 = assembled, 1 = modules separated, 2 = shells faded, inner structures fully visible
    const shellFade = Math.min(1, Math.max(0, (explodeProgress - 0.8) / 0.6)); // 0.8-1.4 fade range
    const innerReveal = Math.min(1, Math.max(0, (explodeProgress - 0.5) / 0.5)); // 0.5-1.0 reveal range

    modules.forEach((mod, index) => {
      const targetPos = new THREE.Vector3().copy(mod.basePosition);
      const offset = mod.explodeOffset.clone().multiplyScalar(Math.min(explodeProgress, 1.5));
      targetPos.add(offset);

      // Smooth interpolation
      mod.mesh.position.lerp(targetPos, 0.08);

      // Subtle floating when exploded
      if (explodeProgress > 0.1) {
        const floatY = Math.sin(timeRef.current * 0.4 + index * 1.1) * 0.06 * Math.min(explodeProgress, 1);
        const floatX = Math.cos(timeRef.current * 0.3 + index * 0.8) * 0.03 * Math.min(explodeProgress, 1);
        mod.mesh.position.y += floatY;
        mod.mesh.position.x += floatX;
      }

      // Highlight selected module
      const isSelected = selectedModuleIndex === index;

      // Traverse and handle shell/inner visibility
      mod.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshPhongMaterial;
          const isShell = child.userData.isShell || (child.parent && child.parent.userData.isShell);
          const isInner = child.userData.isInner || (child.parent && child.parent.userData.isInner);

          // Shell fade out as explode goes beyond 100%
          if (isShell && mat.transparent) {
            const baseOpacity = mat.userData?.baseOpacity ?? mat.opacity;
            if (!mat.userData) mat.userData = {};
            mat.userData.baseOpacity = baseOpacity;
            mat.opacity = baseOpacity * (1 - shellFade);
          }

          // Inner structures become more visible
          if (isInner) {
            if (mat.emissive) {
              if (isSelected) {
                const pulse = 0.3 + Math.sin(timeRef.current * 2.5) * 0.1;
                mat.emissive.setHex(0x224488);
                mat.emissiveIntensity = pulse;
              } else if (innerReveal > 0.5) {
                // Subtle glow when inner structures are revealed
                mat.emissive.setHex(0x112244);
                mat.emissiveIntensity = 0.1 * innerReveal;
              } else {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
              }
            }
          } else if (isSelected && !isShell) {
            if (mat.emissive) {
              const pulse = 0.3 + Math.sin(timeRef.current * 2.5) * 0.1;
              mat.emissive.setHex(0x224488);
              mat.emissiveIntensity = pulse;
            }
          } else if (!isInner) {
            if (mat.emissive) {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          }
        }
      });
    });

    // Fade landing legs when exploded
    if (landingLegsRef.current) {
      landingLegsRef.current.visible = explodeProgress < 0.3;
      landingLegsRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshPhongMaterial;
          mat.opacity = Math.max(0, 1 - explodeProgress * 3);
          mat.transparent = true;
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
