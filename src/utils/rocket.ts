import * as THREE from 'three';
import {
  createFairingTexture,
  createEngineTexture,
  createInterstageTexture,
  createGridFinTexture,
  createLOXTankTexture,
  createRP1TankTexture,
} from './textures';

// Falcon 9 dimensions (scaled for visualization)
const ROCKET_RADIUS = 1.8; // ~3.7m diameter scaled

export interface RocketModule {
  name: string;
  nameCN: string;
  description: string;
  mesh: THREE.Group | THREE.Mesh;
  basePosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  color: number;
}

export function buildFalcon9(): RocketModule[] {
  const modules: RocketModule[] = [];

  // Module 1: Payload Fairing (two halves)
  const fairingGroup = new THREE.Group();
  const fairingTexture = createFairingTexture();
  const fairingMat = new THREE.MeshPhongMaterial({
    map: fairingTexture,
    side: THREE.DoubleSide,
  });

  // Fairing - left half
  const fairingGeoL = new THREE.CylinderGeometry(ROCKET_RADIUS * 1.05, ROCKET_RADIUS, 3.5, 32, 1, true, 0, Math.PI);
  const fairingMeshL = new THREE.Mesh(fairingGeoL, fairingMat);
  fairingMeshL.position.x = -0.01;
  fairingGroup.add(fairingMeshL);

  // Fairing - right half
  const fairingGeoR = new THREE.CylinderGeometry(ROCKET_RADIUS * 1.05, ROCKET_RADIUS, 3.5, 32, 1, true, Math.PI, Math.PI);
  const fairingMeshR = new THREE.Mesh(fairingGeoR, fairingMat.clone());
  fairingMeshR.position.x = 0.01;
  fairingGroup.add(fairingMeshR);

  // Fairing nose cone
  const noseConeGeo = new THREE.ConeGeometry(ROCKET_RADIUS * 1.05, 2.5, 32);
  const noseConeMat = new THREE.MeshPhongMaterial({ map: fairingTexture, side: THREE.DoubleSide });
  const noseCone = new THREE.Mesh(noseConeGeo, noseConeMat);
  noseCone.position.y = 3;
  fairingGroup.add(noseCone);

  const fairingBaseY = 14;
  fairingGroup.position.set(0, fairingBaseY, 0);
  modules.push({
    name: 'Payload Fairing',
    nameCN: '有效载荷整流罩',
    description: '保护卫星/飞船免受气动加热和声学振动。由两半组成，在入轨后分离。高度约6.8m，直径3.7m。',
    mesh: fairingGroup,
    basePosition: new THREE.Vector3(0, fairingBaseY, 0),
    explodeOffset: new THREE.Vector3(4, 8, 0),
    color: 0xffffff,
  });

  // Module 2: Second Stage LOX Tank
  const s2loxGeo = new THREE.CylinderGeometry(ROCKET_RADIUS * 0.95, ROCKET_RADIUS * 0.95, 3.5, 32);
  const s2loxTex = createLOXTankTexture();
  const s2loxMat = new THREE.MeshPhongMaterial({ map: s2loxTex });
  const s2loxMesh = new THREE.Mesh(s2loxGeo, s2loxMat);
  const s2loxBaseY = 10.5;
  s2loxMesh.position.set(0, s2loxBaseY, 0);
  modules.push({
    name: 'Second Stage LOX Tank',
    nameCN: '二级液氧贮箱',
    description: '二级液氧贮箱，储存液态氧（LOX）作为氧化剂。在真空环境下为Merlin真空发动机提供推进剂。',
    mesh: s2loxMesh,
    basePosition: new THREE.Vector3(0, s2loxBaseY, 0),
    explodeOffset: new THREE.Vector3(-3, 6, 2),
    color: 0xe8f0f8,
  });

  // Module 3: Second Stage RP-1 Tank
  const s2rp1Geo = new THREE.CylinderGeometry(ROCKET_RADIUS * 0.95, ROCKET_RADIUS * 0.95, 2.5, 32);
  const s2rp1Tex = createRP1TankTexture();
  const s2rp1Mat = new THREE.MeshPhongMaterial({ map: s2rp1Tex });
  const s2rp1Mesh = new THREE.Mesh(s2rp1Geo, s2rp1Mat);
  const s2rp1BaseY = 8;
  s2rp1Mesh.position.set(0, s2rp1BaseY, 0);
  modules.push({
    name: 'Second Stage RP-1 Tank',
    nameCN: '二级煤油贮箱',
    description: '二级RP-1（火箭级煤油）贮箱。与液氧贮箱共同组成二级推进系统。',
    mesh: s2rp1Mesh,
    basePosition: new THREE.Vector3(0, s2rp1BaseY, 0),
    explodeOffset: new THREE.Vector3(3, 4, -2),
    color: 0xf0f0f0,
  });

  // Module 4: Second Stage Engine (Merlin Vacuum)
  const s2engineGroup = new THREE.Group();
  const engineTex = createEngineTexture();
  
  // Engine body
  const s2engBodyGeo = new THREE.CylinderGeometry(ROCKET_RADIUS * 0.3, ROCKET_RADIUS * 0.5, 1.5, 32);
  const s2engMat = new THREE.MeshPhongMaterial({ map: engineTex, color: 0x888888 });
  const s2engBody = new THREE.Mesh(s2engBodyGeo, s2engMat);
  s2engineGroup.add(s2engBody);

  // Nozzle bell
  const s2nozzleGeo = new THREE.CylinderGeometry(ROCKET_RADIUS * 0.5, ROCKET_RADIUS * 1.2, 2, 32, 1, true);
  const s2nozzleMat = new THREE.MeshPhongMaterial({ map: engineTex, color: 0x555555, side: THREE.DoubleSide });
  const s2nozzle = new THREE.Mesh(s2nozzleGeo, s2nozzleMat);
  s2nozzle.position.y = -1.5;
  s2engineGroup.add(s2nozzle);

  const s2engBaseY = 6;
  s2engineGroup.position.set(0, s2engBaseY, 0);
  modules.push({
    name: 'Merlin Vacuum Engine',
    nameCN: 'Merlin真空发动机',
    description: '二级Merlin Vacuum发动机，专为真空环境优化。喷口面积大，比冲348秒。提供二级全部推力。',
    mesh: s2engineGroup,
    basePosition: new THREE.Vector3(0, s2engBaseY, 0),
    explodeOffset: new THREE.Vector3(-4, 2, 3),
    color: 0x555555,
  });

  // Module 5: Interstage
  const interstageGeo = new THREE.CylinderGeometry(ROCKET_RADIUS, ROCKET_RADIUS, 2.5, 32, 1, true);
  const interstageTex = createInterstageTexture();
  const interstageMat = new THREE.MeshPhongMaterial({ map: interstageTex, side: THREE.DoubleSide });
  const interstageMesh = new THREE.Mesh(interstageGeo, interstageMat);
  const interstageBaseY = 4;
  interstageMesh.position.set(0, interstageBaseY, 0);
  modules.push({
    name: 'Interstage',
    nameCN: '级间段',
    description: '连接一级和二级的结构件。内含分离推杆和12个气动分离系统。一级关机后，级间段分离暴露二级发动机。',
    mesh: interstageMesh,
    basePosition: new THREE.Vector3(0, interstageBaseY, 0),
    explodeOffset: new THREE.Vector3(5, 1, -3),
    color: 0x333333,
  });

  // Module 6: First Stage LOX Tank
  const f1loxGeo = new THREE.CylinderGeometry(ROCKET_RADIUS, ROCKET_RADIUS, 7, 32);
  const f1loxTex = createLOXTankTexture();
  const f1loxMat = new THREE.MeshPhongMaterial({ map: f1loxTex });
  const f1loxMesh = new THREE.Mesh(f1loxGeo, f1loxMat);
  const f1loxBaseY = -0.5;
  f1loxMesh.position.set(0, f1loxBaseY, 0);
  modules.push({
    name: 'First Stage LOX Tank',
    nameCN: '一级液氧贮箱',
    description: '一级液氧贮箱，储存约123吨液态氧。采用过冷推进剂以增加密度，提高运载能力。',
    mesh: f1loxMesh,
    basePosition: new THREE.Vector3(0, f1loxBaseY, 0),
    explodeOffset: new THREE.Vector3(-5, -1, 2),
    color: 0xe0e8f0,
  });

  // Module 7: First Stage RP-1 Tank
  const f1rp1Geo = new THREE.CylinderGeometry(ROCKET_RADIUS, ROCKET_RADIUS, 6, 32);
  const f1rp1Tex = createRP1TankTexture();
  const f1rp1Mat = new THREE.MeshPhongMaterial({ map: f1rp1Tex });
  const f1rp1Mesh = new THREE.Mesh(f1rp1Geo, f1rp1Mat);
  const f1rp1BaseY = -7;
  f1rp1Mesh.position.set(0, f1rp1BaseY, 0);
  modules.push({
    name: 'First Stage RP-1 Tank',
    nameCN: '一级煤油贮箱',
    description: '一级RP-1煤油贮箱，储存约287吨火箭级煤油。与液氧箱共同组成一级推进系统。',
    mesh: f1rp1Mesh,
    basePosition: new THREE.Vector3(0, f1rp1BaseY, 0),
    explodeOffset: new THREE.Vector3(5, -3, -2),
    color: 0xe8e8e8,
  });

  // Module 8: Octaweb + Engine Section (9 Merlin engines)
  const engineSectionGroup = new THREE.Group();
  const engTex = createEngineTexture();

  // Octaweb structure (thrust structure)
  const octawebGeo = new THREE.CylinderGeometry(ROCKET_RADIUS, ROCKET_RADIUS * 0.9, 2, 32);
  const octawebMat = new THREE.MeshPhongMaterial({ color: 0x444444, map: engTex });
  const octaweb = new THREE.Mesh(octawebGeo, octawebMat);
  octaweb.position.y = 0.5;
  engineSectionGroup.add(octaweb);

  // 9 Merlin engines in octaweb pattern (1 center + 8 ring)
  const enginePositions = [
    [0, 0], // center
    ...Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return [Math.cos(angle) * ROCKET_RADIUS * 0.55, Math.sin(angle) * ROCKET_RADIUS * 0.55];
    }),
  ];

  enginePositions.forEach(([x, z]) => {
    // Engine combustion chamber
    const chamberGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 16);
    const chamberMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.position.set(x, -0.5, z);
    engineSectionGroup.add(chamber);

    // Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.2, 0.45, 1.2, 16, 1, true);
    const nozzleMat = new THREE.MeshPhongMaterial({
      map: engTex,
      color: 0x555555,
      side: THREE.DoubleSide,
    });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(x, -1.5, z);
    engineSectionGroup.add(nozzle);
  });

  const engineBaseY = -11;
  engineSectionGroup.position.set(0, engineBaseY, 0);
  modules.push({
    name: 'Engine Section (9x Merlin)',
    nameCN: '发动机舱 (9台Merlin)',
    description: 'Octaweb推力结构，搭载9台Merlin 1D发动机。每台海平面推力845kN，总推力7,607kN。采用冗余设计，可关闭部分发动机仍完成任务。',
    mesh: engineSectionGroup,
    basePosition: new THREE.Vector3(0, engineBaseY, 0),
    explodeOffset: new THREE.Vector3(-3, -6, 3),
    color: 0x444444,
  });

  // Module 9: Grid Fins (4x)
  const gridFinGroup = new THREE.Group();
  const gridFinTex = createGridFinTexture();

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const finGeo = new THREE.BoxGeometry(1.2, 1.5, 0.08);
    const finMat = new THREE.MeshPhongMaterial({ map: gridFinTex, color: 0x555555 });
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(
      Math.cos(angle) * (ROCKET_RADIUS + 0.6),
      0,
      Math.sin(angle) * (ROCKET_RADIUS + 0.6)
    );
    fin.rotation.y = -angle;
    gridFinGroup.add(fin);

    // Fin actuator
    const actuatorGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const actuatorMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const actuator = new THREE.Mesh(actuatorGeo, actuatorMat);
    actuator.position.set(
      Math.cos(angle) * (ROCKET_RADIUS + 0.1),
      0,
      Math.sin(angle) * (ROCKET_RADIUS + 0.1)
    );
    actuator.rotation.z = Math.PI / 2;
    actuator.rotation.y = -angle;
    gridFinGroup.add(actuator);
  }

  const gridFinBaseY = 2;
  gridFinGroup.position.set(0, gridFinBaseY, 0);
  modules.push({
    name: 'Grid Fins',
    nameCN: '栅格翼',
    description: '4个钛合金栅格翼，用于一级回收时的气动控制。在再入大气层时提供精确的姿态控制和着陆精度。',
    mesh: gridFinGroup,
    basePosition: new THREE.Vector3(0, gridFinBaseY, 0),
    explodeOffset: new THREE.Vector3(4, 0, 4),
    color: 0x555555,
  });

  return modules;
}

// Add landing legs as a separate visual element (not a separate module, just decoration)
export function addLandingLegs(scene: THREE.Scene, baseY: number) {
  const legGroup = new THREE.Group();
  const legMat = new THREE.MeshPhongMaterial({ color: 0x444444 });

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const legGeo = new THREE.BoxGeometry(0.08, 3, 0.15);
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(
      Math.cos(angle) * (ROCKET_RADIUS + 0.3),
      baseY - 13,
      Math.sin(angle) * (ROCKET_RADIUS + 0.3)
    );
    leg.rotation.z = Math.cos(angle) * 0.15;
    leg.rotation.x = Math.sin(angle) * 0.15;
    legGroup.add(leg);

    // Foot pad
    const footGeo = new THREE.BoxGeometry(0.4, 0.08, 0.3);
    const foot = new THREE.Mesh(footGeo, legMat);
    foot.position.set(
      Math.cos(angle) * (ROCKET_RADIUS + 0.5),
      baseY - 14.5,
      Math.sin(angle) * (ROCKET_RADIUS + 0.5)
    );
    legGroup.add(foot);
  }

  scene.add(legGroup);
  return legGroup;
}
