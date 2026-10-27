import * as THREE from 'three';
import {
  createFairingTexture, createEngineTexture,
  createInterstageTexture, createGridFinTexture, createLOXTankTexture,
  createRP1TankTexture, createOctawebTexture,
  createTurbopumpTexture, createMLITexture,
} from './textures';

const R = 1.8; // Rocket radius

export interface SubModule {
  name: string;
  nameCN: string;
  description: string;
}

export interface RocketModule {
  name: string;
  nameCN: string;
  description: string;
  mesh: THREE.Group;
  basePosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  subModules: SubModule[];
  color: number;
}

// Helper: create a pipe/tube along a path
function createTube(points: THREE.Vector3[], radius = 0.04, color = 0x888888): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 20, radius, 8, false);
  const mat = new THREE.MeshPhongMaterial({ color, shininess: 60 });
  return new THREE.Mesh(geo, mat);
}

// Helper: create a valve
function createValve(pos: THREE.Vector3, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.08 * scale, 12, 12),
    new THREE.MeshPhongMaterial({ color: 0x996633, shininess: 80 })
  );
  g.add(body);
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.15 * scale, 8),
    new THREE.MeshPhongMaterial({ color: 0xcc3333 })
  );
  handle.position.y = 0.1 * scale;
  g.add(handle);
  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.04 * scale, 0.01 * scale, 8, 16),
    new THREE.MeshPhongMaterial({ color: 0xcc3333 })
  );
  wheel.position.y = 0.17 * scale;
  wheel.rotation.x = Math.PI / 2;
  g.add(wheel);
  g.position.copy(pos);
  return g;
}

// Helper: create a baffle plate
function createBaffle(y: number, radius: number, color = 0xcccccc): THREE.Mesh {
  const geo = new THREE.RingGeometry(0.1, radius * 0.95, 32);
  const mat = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

// Helper: create structural ring
function createRing(y: number, innerR: number, outerR: number, height = 0.08, color = 0x888888): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(outerR, outerR, height, 32, 1, true);
  const mat = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = y;
  return mesh;
}

// ================================================================
// MODULE 1: Payload Fairing (detailed)
// ================================================================
function buildFairing(): THREE.Group {
  const group = new THREE.Group();
  const tex = createFairingTexture();

  // Outer shell - left half
  const shellL = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.05, R, 3.5, 32, 1, true, 0, Math.PI),
    new THREE.MeshPhongMaterial({ map: tex, side: THREE.DoubleSide })
  );
  group.add(shellL);

  // Outer shell - right half
  const shellR = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.05, R, 3.5, 32, 1, true, Math.PI, Math.PI),
    new THREE.MeshPhongMaterial({ map: tex.clone(), side: THREE.DoubleSide })
  );
  group.add(shellR);

  // Nose cone
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(R * 1.05, 2.5, 32),
    new THREE.MeshPhongMaterial({ map: tex.clone() })
  );
  nose.position.y = 3;
  group.add(nose);

  // Inner honeycomb structure (visible when separated)
  const innerTex = createFairingTexture(256, 256);
  const innerShell = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 0.98, R * 0.93, 3.3, 32, 1, true),
    new THREE.MeshPhongMaterial({ map: innerTex, side: THREE.DoubleSide, color: 0xddddaa })
  );
  group.add(innerShell);

  // Separation hinges (top)
  for (let i = 0; i < 2; i++) {
    const hinge = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.3, 0.08),
      new THREE.MeshPhongMaterial({ color: 0x666666 })
    );
    hinge.position.set(i === 0 ? -R * 1.02 : R * 1.02, 1.5, 0);
    group.add(hinge);
  }

  // Pneumatic pushers
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const pusher = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
      new THREE.MeshPhongMaterial({ color: 0xff6600 })
    );
    pusher.position.set(Math.cos(angle) * R * 0.9, -1.5, Math.sin(angle) * R * 0.9);
    group.add(pusher);
  }

  // Payload adapter ring (bottom)
  const adapter = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 0.8, R * 0.8, 0.3, 32, 1, true),
    new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide })
  );
  adapter.position.y = -1.7;
  group.add(adapter);

  // Longitudinal stiffeners
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const stiffener = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 3.5, 0.06),
      new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
    );
    stiffener.position.set(Math.cos(angle) * R * 1.01, 0, Math.sin(angle) * R * 1.01);
    stiffener.rotation.y = -angle;
    group.add(stiffener);
  }

  return group;
}

// ================================================================
// MODULE 2: Second Stage LOX Tank (detailed)
// ================================================================
function buildS2LOX(): THREE.Group {
  const group = new THREE.Group();
  const tex = createLOXTankTexture();

  // Main tank shell
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 0.95, R * 0.95, 3.5, 32),
    new THREE.MeshPhongMaterial({ map: tex, transparent: true, opacity: 0.85 })
  );
  group.add(shell);

  // Dome caps (top and bottom)
  const domeGeo = new THREE.SphereGeometry(R * 0.95, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
  const domeMat = new THREE.MeshPhongMaterial({ map: tex.clone(), color: 0xd0e0f0 });
  const topDome = new THREE.Mesh(domeGeo, domeMat);
  topDome.position.y = 1.5;
  group.add(topDome);
  const botDome = new THREE.Mesh(domeGeo.clone(), domeMat.clone());
  botDome.position.y = -1.5;
  botDome.rotation.x = Math.PI;
  group.add(botDome);

  // Anti-slosh baffles
  for (let i = 0; i < 4; i++) {
    const baffle = createBaffle(-1 + i * 0.8, R * 0.9, 0xbbccdd);
    group.add(baffle);
  }

  // Internal feed pipe (center)
  const feedPipe = createTube([
    new THREE.Vector3(0, 1.7, 0),
    new THREE.Vector3(0, -1.7, 0),
  ], 0.08, 0x8899aa);
  group.add(feedPipe);

  // Pressurization line
  const pressLine = createTube([
    new THREE.Vector3(R * 0.5, 1.7, 0),
    new THREE.Vector3(R * 0.5, 0, 0),
    new THREE.Vector3(R * 0.5, -1.7, 0),
  ], 0.03, 0x6688aa);
  group.add(pressLine);

  // Outlet valve
  const valve = createValve(new THREE.Vector3(0, -1.8, 0), 1.2);
  group.add(valve);

  // Level sensors
  for (let i = 0; i < 3; i++) {
    const sensor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
      new THREE.MeshPhongMaterial({ color: 0x33aa33 })
    );
    sensor.position.set(R * 0.8, -0.5 + i * 0.8, 0);
    sensor.rotation.z = Math.PI / 2;
    group.add(sensor);
  }

  // Structural rings
  for (let i = 0; i < 5; i++) {
    group.add(createRing(-1.5 + i * 0.85, R * 0.93, R * 0.97, 0.06, 0x999999));
  }

  return group;
}

// ================================================================
// MODULE 3: Second Stage RP-1 Tank (detailed)
// ================================================================
function buildS2RP1(): THREE.Group {
  const group = new THREE.Group();
  const tex = createRP1TankTexture();

  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 0.95, R * 0.95, 2.5, 32),
    new THREE.MeshPhongMaterial({ map: tex, transparent: true, opacity: 0.85 })
  );
  group.add(shell);

  // Dome caps
  const domeGeo = new THREE.SphereGeometry(R * 0.95, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
  const domeMat = new THREE.MeshPhongMaterial({ color: 0xdddddd });
  const topDome = new THREE.Mesh(domeGeo, domeMat);
  topDome.position.y = 1;
  group.add(topDome);
  const botDome = new THREE.Mesh(domeGeo.clone(), domeMat.clone());
  botDome.position.y = -1;
  botDome.rotation.x = Math.PI;
  group.add(botDome);

  // Baffles
  for (let i = 0; i < 3; i++) {
    group.add(createBaffle(-0.6 + i * 0.6, R * 0.88, 0xbbbbbb));
  }

  // Feed line
  group.add(createTube([
    new THREE.Vector3(0, 1.2, 0),
    new THREE.Vector3(0, -1.2, 0),
  ], 0.07, 0x888888));

  // Helium pressurization bottle
  const heBottle = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.08, 0.4, 8, 16),
    new THREE.MeshPhongMaterial({ color: 0x44aa44 })
  );
  heBottle.position.set(R * 0.6, 0, 0);
  group.add(heBottle);

  // Outlet
  const outlet = createValve(new THREE.Vector3(0, -1.3, 0));
  group.add(outlet);

  // Structural rings
  for (let i = 0; i < 4; i++) {
    group.add(createRing(-1 + i * 0.7, R * 0.93, R * 0.97, 0.05, 0x999999));
  }

  return group;
}

// ================================================================
// MODULE 4: Merlin Vacuum Engine (highly detailed)
// ================================================================
function buildS2Engine(): THREE.Group {
  const group = new THREE.Group();
  const engTex = createEngineTexture();
  const tpTex = createTurbopumpTexture();

  // Gimbal mount ring
  const gimbal = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.4, 0.06, 12, 32),
    new THREE.MeshPhongMaterial({ color: 0x666666 })
  );
  gimbal.rotation.x = Math.PI / 2;
  gimbal.position.y = 0.8;
  group.add(gimbal);

  // Thrust chamber (combustion chamber)
  const chamber = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshPhongMaterial({ map: engTex, color: 0x777777 })
  );
  chamber.position.y = 0.3;
  group.add(chamber);

  // Injector plate
  const injector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32),
    new THREE.MeshPhongMaterial({ color: 0x554433 })
  );
  injector.position.y = 0.5;
  group.add(injector);

  // Regenerative cooling channels (visible rings around nozzle)
  for (let i = 0; i < 8; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.25 + i * 0.06, 0.015, 8, 32),
      new THREE.MeshPhongMaterial({ color: 0x886644 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1 - i * 0.08;
    group.add(ring);
  }

  // Nozzle bell (large expansion ratio for vacuum)
  const nozzlePoints: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const r2 = 0.25 + t * t * 1.3; // bell contour
    nozzlePoints.push(new THREE.Vector2(r2, -t * 2.5));
  }
  const nozzleGeo = new THREE.LatheGeometry(nozzlePoints, 32);
  const nozzleMat = new THREE.MeshPhongMaterial({ map: engTex, color: 0x555555, side: THREE.DoubleSide });
  const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
  nozzle.position.y = -0.2;
  group.add(nozzle);

  // Ablative coating inside nozzle
  const ablatGeo = new THREE.LatheGeometry(
    nozzlePoints.map(p => new THREE.Vector2(p.x - 0.03, p.y)),
    32
  );
  const ablatMat = new THREE.MeshPhongMaterial({ color: 0x222222, side: THREE.BackSide });
  const ablat = new THREE.Mesh(ablatGeo, ablatMat);
  ablat.position.y = -0.2;
  group.add(ablat);

  // Turbopump assembly
  const tpBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16),
    new THREE.MeshPhongMaterial({ map: tpTex, color: 0x888888 })
  );
  tpBody.position.set(0.4, 0.5, 0);
  group.add(tpBody);

  // Gas generator
  const gg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.3, 12),
    new THREE.MeshPhongMaterial({ color: 0x996633 })
  );
  gg.position.set(0.4, 0.9, 0);
  group.add(gg);

  // Fuel lines
  group.add(createTube([
    new THREE.Vector3(0.4, 0.3, 0),
    new THREE.Vector3(0.2, 0.1, 0),
    new THREE.Vector3(0, 0.3, 0),
  ], 0.025, 0x886644));

  group.add(createTube([
    new THREE.Vector3(0.4, 0.7, 0),
    new THREE.Vector3(0.3, 0.8, 0.1),
    new THREE.Vector3(0, 0.5, 0),
  ], 0.02, 0x4488aa));

  // Exhaust duct
  const exhaust = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.4, 12),
    new THREE.MeshPhongMaterial({ color: 0x444444 })
  );
  exhaust.position.set(-0.3, 0.8, 0);
  exhaust.rotation.z = 0.3;
  group.add(exhaust);

  return group;
}

// ================================================================
// MODULE 5: Interstage (detailed)
// ================================================================
function buildInterstage(): THREE.Group {
  const group = new THREE.Group();
  const tex = createInterstageTexture();

  // Main cylindrical shell
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 2.5, 32, 1, true),
    new THREE.MeshPhongMaterial({ map: tex, side: THREE.DoubleSide })
  );
  group.add(shell);

  // Top ring
  group.add(createRing(1.2, R * 0.95, R * 1.02, 0.1, 0x555555));
  // Bottom ring
  group.add(createRing(-1.2, R * 0.95, R * 1.02, 0.1, 0x555555));

  // Separation collets (12 points)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const collet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8),
      new THREE.MeshPhongMaterial({ color: 0xff6600 })
    );
    collet.position.set(Math.cos(angle) * R * 0.95, -1.0, Math.sin(angle) * R * 0.95);
    group.add(collet);
  }

  // Pneumatic pushers (6)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const pusher = new THREE.Group();
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8),
      new THREE.MeshPhongMaterial({ color: 0xcc4400 })
    );
    pusher.add(cyl);
    const piston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8),
      new THREE.MeshPhongMaterial({ color: 0xdddddd })
    );
    piston.position.y = 0.3;
    pusher.add(piston);
    pusher.position.set(Math.cos(angle) * R * 0.85, 0.8, Math.sin(angle) * R * 0.85);
    group.add(pusher);
  }

  // Structural columns
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.3, 0.04),
      new THREE.MeshPhongMaterial({ color: 0x444444 })
    );
    col.position.set(Math.cos(angle) * R * 0.97, 0, Math.sin(angle) * R * 0.97);
    col.rotation.y = -angle;
    group.add(col);
  }

  // Wiring harness
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 0.5;
    const harness = createTube([
      new THREE.Vector3(Math.cos(angle) * R * 0.9, 1.2, Math.sin(angle) * R * 0.9),
      new THREE.Vector3(Math.cos(angle) * R * 0.92, 0, Math.sin(angle) * R * 0.92),
      new THREE.Vector3(Math.cos(angle) * R * 0.9, -1.2, Math.sin(angle) * R * 0.9),
    ], 0.02, 0x333333);
    group.add(harness);
  }

  return group;
}

// ================================================================
// MODULE 6: First Stage LOX Tank (detailed)
// ================================================================
function buildF1LOX(): THREE.Group {
  const group = new THREE.Group();
  const tex = createLOXTankTexture();

  // Main tank
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 7, 32),
    new THREE.MeshPhongMaterial({ map: tex, transparent: true, opacity: 0.8 })
  );
  group.add(shell);

  // Ellipsoidal domes
  const topDome = new THREE.Mesh(
    new THREE.SphereGeometry(R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5),
    new THREE.MeshPhongMaterial({ map: tex.clone(), color: 0xd0e0f0 })
  );
  topDome.position.y = 3.2;
  group.add(topDome);

  // Common bulkhead (bottom - shared with RP-1)
  const commonBulkhead = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.98, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3),
    new THREE.MeshPhongMaterial({ color: 0xaabbcc, side: THREE.DoubleSide })
  );
  commonBulkhead.position.y = -3.2;
  commonBulkhead.rotation.x = Math.PI;
  group.add(commonBulkhead);

  // Anti-slosh baffles (many)
  for (let i = 0; i < 6; i++) {
    group.add(createBaffle(-2.5 + i * 1.1, R * 0.92, 0xbbccdd));
  }

  // Main feed line (large diameter)
  group.add(createTube([
    new THREE.Vector3(0, 3.5, 0),
    new THREE.Vector3(0, -3.5, 0),
  ], 0.12, 0x8899aa));

  // Secondary feed lines
  group.add(createTube([
    new THREE.Vector3(R * 0.4, 3, 0),
    new THREE.Vector3(R * 0.4, -3, 0),
  ], 0.04, 0x6688aa));

  // Pressurization system
  group.add(createTube([
    new THREE.Vector3(-R * 0.6, 3.5, 0),
    new THREE.Vector3(-R * 0.6, 0, 0),
    new THREE.Vector3(-R * 0.6, -3, 0),
  ], 0.03, 0x5577aa));

  // Chill valves
  for (let i = 0; i < 3; i++) {
    group.add(createValve(new THREE.Vector3(R * 0.85, -1 + i * 1.5, 0), 0.8));
  }

  // LOX suction accumulator
  const accumulator = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16),
    new THREE.MeshPhongMaterial({ color: 0x88aacc })
  );
  accumulator.position.set(0, -3.3, 0);
  group.add(accumulator);

  // Structural rings
  for (let i = 0; i < 8; i++) {
    group.add(createRing(-3 + i * 0.9, R * 0.98, R * 1.01, 0.06, 0x999999));
  }

  // MLI insulation patches
  const mliTex = createMLITexture();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const patch = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 1.2),
      new THREE.MeshPhongMaterial({ map: mliTex, side: THREE.DoubleSide, color: 0xccaa44 })
    );
    patch.position.set(Math.cos(angle) * R * 0.96, 1, Math.sin(angle) * R * 0.96);
    patch.rotation.y = -angle;
    group.add(patch);
  }

  return group;
}

// ================================================================
// MODULE 7: First Stage RP-1 Tank (detailed)
// ================================================================
function buildF1RP1(): THREE.Group {
  const group = new THREE.Group();
  const tex = createRP1TankTexture();

  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 6, 32),
    new THREE.MeshPhongMaterial({ map: tex, transparent: true, opacity: 0.8 })
  );
  group.add(shell);

  // Top dome (common bulkhead with LOX)
  const topDome = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.98, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
  );
  topDome.position.y = 2.8;
  group.add(topDome);

  // Bottom dome
  const botDome = new THREE.Mesh(
    new THREE.SphereGeometry(R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5),
    new THREE.MeshPhongMaterial({ color: 0xdddddd })
  );
  botDome.position.y = -2.8;
  botDome.rotation.x = Math.PI;
  group.add(botDome);

  // Baffles
  for (let i = 0; i < 5; i++) {
    group.add(createBaffle(-2 + i * 1, R * 0.9, 0xbbbbbb));
  }

  // Main feed line
  group.add(createTube([
    new THREE.Vector3(0, 3, 0),
    new THREE.Vector3(0, -3, 0),
  ], 0.1, 0x888888));

  // He pressurization line
  group.add(createTube([
    new THREE.Vector3(R * 0.5, 2.5, 0),
    new THREE.Vector3(R * 0.5, -2.5, 0),
  ], 0.03, 0x44aa44));

  // He bottles (composite overwrapped)
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const bottle = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.1, 0.6, 8, 16),
      new THREE.MeshPhongMaterial({ color: 0x338833 })
    );
    bottle.position.set(Math.cos(angle) * R * 0.7, 1.5, Math.sin(angle) * R * 0.7);
    group.add(bottle);
  }

  // Fuel outlet (engine feed)
  const outlet = createValve(new THREE.Vector3(0, -3, 0), 1.5);
  group.add(outlet);

  // Structural rings
  for (let i = 0; i < 7; i++) {
    group.add(createRing(-2.5 + i * 0.85, R * 0.98, R * 1.01, 0.05, 0x999999));
  }

  return group;
}

// ================================================================
// MODULE 8: Engine Section - Octaweb + 9 Merlin Engines (highly detailed)
// ================================================================
function buildEngineSection(): THREE.Group {
  const group = new THREE.Group();
  const engTex = createEngineTexture();
  const octTex = createOctawebTexture();
  const tpTex = createTurbopumpTexture();

  // Octaweb thrust structure
  const octaweb = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R * 0.95, 1.5, 32),
    new THREE.MeshPhongMaterial({ map: octTex, color: 0x555555 })
  );
  octaweb.position.y = 0.5;
  group.add(octaweb);

  // Octaweb top plate
  const topPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 0.1, 32),
    new THREE.MeshPhongMaterial({ color: 0x444444 })
  );
  topPlate.position.y = 1.2;
  group.add(topPlate);

  // Engine positions: 1 center + 8 ring
  const positions: [number, number][] = [[0, 0]];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    positions.push([Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55]);
  }

  positions.forEach(([x, z], idx) => {
    const isCenter = idx === 0;
    const engGroup = new THREE.Group();

    // Gimbal mount
    const gimbalRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.03, 8, 24),
      new THREE.MeshPhongMaterial({ color: 0x666666 })
    );
    gimbalRing.rotation.x = Math.PI / 2;
    gimbalRing.position.y = 0.2;
    engGroup.add(gimbalRing);

    // Combustion chamber
    const chamber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.3, 16),
      new THREE.MeshPhongMaterial({ map: engTex, color: 0x777777 })
    );
    chamber.position.y = 0;
    engGroup.add(chamber);

    // Injector head
    const injector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.04, 16),
      new THREE.MeshPhongMaterial({ color: 0x554433 })
    );
    injector.position.y = 0.15;
    engGroup.add(injector);

    // Cooling jacket rings
    for (let i = 0; i < 4; i++) {
      const coolRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.14 + i * 0.02, 0.008, 6, 20),
        new THREE.MeshPhongMaterial({ color: 0x886644 })
      );
      coolRing.rotation.x = Math.PI / 2;
      coolRing.position.y = -0.05 - i * 0.05;
      engGroup.add(coolRing);
    }

    // Nozzle
    const nozzleH = isCenter ? 0.8 : 1.0;
    const nozzleTopR = 0.15;
    const nozzleBotR = isCenter ? 0.3 : 0.35;
    const nozzlePoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      nozzlePoints.push(new THREE.Vector2(nozzleTopR + t * t * (nozzleBotR - nozzleTopR), -t * nozzleH));
    }
    const nozzleGeo = new THREE.LatheGeometry(nozzlePoints, 20);
    const nozzle = new THREE.Mesh(nozzleGeo, new THREE.MeshPhongMaterial({
      map: engTex, color: 0x555555, side: THREE.DoubleSide
    }));
    nozzle.position.y = -0.15;
    engGroup.add(nozzle);

    // Turbopump (smaller, on the side)
    const tp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12),
      new THREE.MeshPhongMaterial({ map: tpTex, color: 0x888888 })
    );
    tp.position.set(0.15, 0.1, 0);
    engGroup.add(tp);

    // Gas generator exhaust
    const ggExhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.03, 0.15, 8),
      new THREE.MeshPhongMaterial({ color: 0x444444 })
    );
    ggExhaust.position.set(-0.12, 0.25, 0);
    engGroup.add(ggExhaust);

    // Fuel/oxidizer lines
    engGroup.add(createTube([
      new THREE.Vector3(0.15, 0.2, 0),
      new THREE.Vector3(0.05, 0.05, 0),
    ], 0.015, 0x886644));

    engGroup.add(createTube([
      new THREE.Vector3(0.15, 0, 0.05),
      new THREE.Vector3(0.05, -0.05, 0),
    ], 0.012, 0x4488aa));

    engGroup.position.set(x, -0.3, z);
    group.add(engGroup);
  });

  // Main LOX dome feed manifold
  const manifold = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.3, 0.06, 12, 32),
    new THREE.MeshPhongMaterial({ color: 0x8899aa })
  );
  manifold.rotation.x = Math.PI / 2;
  manifold.position.y = 1.0;
  group.add(manifold);

  // Fuel manifold
  const fuelManifold = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.6, 0.04, 8, 32),
    new THREE.MeshPhongMaterial({ color: 0x886644 })
  );
  fuelManifold.rotation.x = Math.PI / 2;
  fuelManifold.position.y = 0.8;
  group.add(fuelManifold);

  // Heat shield
  const heatShield = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.05, R * 1.1, 0.15, 32, 1, true),
    new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide })
  );
  heatShield.position.y = -1.5;
  group.add(heatShield);

  return group;
}

// ================================================================
// MODULE 9: Grid Fins (titanium, detailed lattice)
// ================================================================
function buildGridFins(): THREE.Group {
  const group = new THREE.Group();
  const gridTex = createGridFinTexture();

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const finGroup = new THREE.Group();

    // Fin frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.6, 0.06),
      new THREE.MeshPhongMaterial({ color: 0x444444 })
    );
    finGroup.add(frame);

    // Grid lattice (titanium)
    const latticeGroup = new THREE.Group();
    const barMat = new THREE.MeshPhongMaterial({ map: gridTex, color: 0x666666, shininess: 40 });
    const rows = 10;
    const cols = 12;
    // Horizontal bars
    for (let r = 0; r <= rows; r++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.02, 0.04),
        barMat
      );
      bar.position.y = -0.7 + (r / rows) * 1.4;
      latticeGroup.add(bar);
    }
    // Vertical bars
    for (let c = 0; c <= cols; c++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 1.5, 0.04),
        barMat
      );
      bar.position.x = -0.6 + (c / cols) * 1.2;
      latticeGroup.add(bar);
    }
    latticeGroup.position.z = 0.01;
    finGroup.add(latticeGroup);

    // Hinge mechanism
    const hinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12),
      new THREE.MeshPhongMaterial({ color: 0x555555 })
    );
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(-0.7, 0.7, 0);
    finGroup.add(hinge);

    // Hydraulic actuator
    const actuatorBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8),
      new THREE.MeshPhongMaterial({ color: 0x888888 })
    );
    actuatorBody.position.set(-0.4, 0.5, -0.1);
    actuatorBody.rotation.z = 0.3;
    finGroup.add(actuatorBody);

    // Piston rod
    const piston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
      new THREE.MeshPhongMaterial({ color: 0xcccccc })
    );
    piston.position.set(-0.2, 0.2, -0.1);
    piston.rotation.z = 0.3;
    finGroup.add(piston);

    // Hydraulic line
    finGroup.add(createTube([
      new THREE.Vector3(-0.5, 0.7, -0.1),
      new THREE.Vector3(-0.6, 0.3, -0.15),
      new THREE.Vector3(-0.5, -0.2, -0.1),
    ], 0.015, 0x333333));

    // Position fin on rocket
    finGroup.position.set(
      Math.cos(angle) * (R + 0.7),
      0,
      Math.sin(angle) * (R + 0.7)
    );
    finGroup.rotation.y = -angle + Math.PI / 2;

    group.add(finGroup);
  }

  // Mounting ring
  const mountRing = new THREE.Mesh(
    new THREE.TorusGeometry(R + 0.1, 0.05, 8, 32),
    new THREE.MeshPhongMaterial({ color: 0x555555 })
  );
  mountRing.rotation.x = Math.PI / 2;
  group.add(mountRing);

  return group;
}

// ================================================================
// ASSEMBLE ALL MODULES
// ================================================================
export function buildFalcon9(): RocketModule[] {
  const modules: RocketModule[] = [];

  // Module 1: Payload Fairing
  const fairing = buildFairing();
  const fairingY = 14;
  fairing.position.set(0, fairingY, 0);
  modules.push({
    name: 'Payload Fairing', nameCN: '有效载荷整流罩',
    description: '碳纤维/铝蜂窝夹层结构，保护载荷免受气动加热和声振。两半铰接分离，内衬蜂窝吸能结构。配备4个气动推杆和分离铰链。',
    mesh: fairing, basePosition: new THREE.Vector3(0, fairingY, 0),
    explodeOffset: new THREE.Vector3(5, 8, 0),
    subModules: [
      { name: 'Outer Shell', nameCN: '外壳体', description: '碳纤维面板+铝蜂窝芯夹层结构' },
      { name: 'Inner Honeycomb', nameCN: '蜂窝内衬', description: '声学能量吸收层' },
      { name: 'Separation Hinges', nameCN: '分离铰链', description: '两半整流罩的铰接机构' },
      { name: 'Pneumatic Pushers', nameCN: '气动推杆', description: '4个分离推杆，提供初始分离速度' },
      { name: 'Payload Adapter', nameCN: '载荷适配器', description: '与卫星/飞船对接的标准接口' },
    ],
    color: 0xffffff,
  });

  // Module 2: Second Stage LOX Tank
  const s2lox = buildS2LOX();
  const s2loxY = 10.5;
  s2lox.position.set(0, s2loxY, 0);
  modules.push({
    name: 'Second Stage LOX Tank', nameCN: '二级液氧贮箱',
    description: '铝锂合金焊接贮箱，储存过冷液氧（-196°C）。内设4道防荡板，中心供液管路，配备液位传感器和增压系统接口。',
    mesh: s2lox, basePosition: new THREE.Vector3(0, s2loxY, 0),
    explodeOffset: new THREE.Vector3(-4, 6, 2),
    subModules: [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金2195，摩擦搅拌焊接' },
      { name: 'Anti-slosh Baffles', nameCN: '防荡板', description: '4道环形挡板，抑制推进剂晃动' },
      { name: 'Feed Line', nameCN: '供液管路', description: '中心主供液管，通向发动机' },
      { name: 'Pressurization System', nameCN: '增压系统', description: 'He气增压，维持箱内压力' },
      { name: 'Level Sensors', nameCN: '液位传感器', description: '3个电容式液位探头' },
    ],
    color: 0xe8f0f8,
  });

  // Module 3: Second Stage RP-1 Tank
  const s2rp1 = buildS2RP1();
  const s2rp1Y = 8;
  s2rp1.position.set(0, s2rp1Y, 0);
  modules.push({
    name: 'Second Stage RP-1 Tank', nameCN: '二级煤油贮箱',
    description: '铝锂合金贮箱，储存RP-1火箭级煤油。内设3道防荡板和氦气增压瓶，底部配备主出口阀。',
    mesh: s2rp1, basePosition: new THREE.Vector3(0, s2rp1Y, 0),
    explodeOffset: new THREE.Vector3(4, 4, -2),
    subModules: [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金结构' },
      { name: 'Baffles', nameCN: '防荡板', description: '3道防晃挡板' },
      { name: 'He Pressurization Bottle', nameCN: '氦气增压瓶', description: '复合材料缠绕气瓶' },
      { name: 'Outlet Valve', nameCN: '出口阀', description: '主燃料出口' },
    ],
    color: 0xf0f0f0,
  });

  // Module 4: Merlin Vacuum Engine
  const s2eng = buildS2Engine();
  const s2engY = 6;
  s2eng.position.set(0, s2engY, 0);
  modules.push({
    name: 'Merlin Vacuum Engine', nameCN: 'Merlin真空发动机',
    description: '二级专用Merlin 1D Vacuum，大面积喷管（膨胀比165:1），比冲348s。采用烧蚀冷却+再生冷却组合方案，涡轮泵转速>20000rpm。',
    mesh: s2eng, basePosition: new THREE.Vector3(0, s2engY, 0),
    explodeOffset: new THREE.Vector3(-5, 2, 3),
    subModules: [
      { name: 'Gimbal Mount', nameCN: '万向节支架', description: '双向摆动±6°，控制飞行姿态' },
      { name: 'Combustion Chamber', nameCN: '燃烧室', description: '镍合金铸造，再生冷却通道' },
      { name: 'Injector Plate', nameCN: '喷注器', description: '同轴离心式喷注单元阵列' },
      { name: 'Nozzle Bell', nameCN: '喷管', description: '大面积比烧蚀喷管，膨胀比165:1' },
      { name: 'Turbopump', nameCN: '涡轮泵', description: '离心泵+轴流涡轮，>20000rpm' },
      { name: 'Gas Generator', nameCN: '燃气发生器', description: '富燃预燃室，驱动涡轮' },
    ],
    color: 0x555555,
  });

  // Module 5: Interstage
  const interstage = buildInterstage();
  const interstageY = 4;
  interstage.position.set(0, interstageY, 0);
  modules.push({
    name: 'Interstage', nameCN: '级间段',
    description: '碳纤维复合材料结构，连接一级和二级。内装12个分离锁紧机构和6个气动推杆。配备3组线缆通道用于级间信号传输。',
    mesh: interstage, basePosition: new THREE.Vector3(0, interstageY, 0),
    explodeOffset: new THREE.Vector3(6, 1, -3),
    subModules: [
      { name: 'Composite Shell', nameCN: '复合材料壳体', description: '碳纤维缠绕+蜂窝夹层' },
      { name: 'Separation Collets', nameCN: '分离锁紧机构', description: '12个爆炸螺栓/锁紧器' },
      { name: 'Pneumatic Pushers', nameCN: '气动推杆', description: '6个弹簧/气动分离推杆' },
      { name: 'Structural Columns', nameCN: '承力柱', description: '8根纵向承力柱' },
      { name: 'Wiring Harness', nameCN: '线缆通道', description: '3组级间信号/电力线缆' },
    ],
    color: 0x333333,
  });

  // Module 6: First Stage LOX Tank
  const f1lox = buildF1LOX();
  const f1loxY = -0.5;
  f1lox.position.set(0, f1loxY, 0);
  modules.push({
    name: 'First Stage LOX Tank', nameCN: '一级液氧贮箱',
    description: '储存约123吨过冷液氧。采用共底结构与RP-1箱分隔，内设6道防荡板。底部配备吸液蓄能器和3个预冷阀。外覆MLI隔热层。',
    mesh: f1lox, basePosition: new THREE.Vector3(0, f1loxY, 0),
    explodeOffset: new THREE.Vector3(-6, -1, 2),
    subModules: [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金，薄壁整体环焊' },
      { name: 'Common Bulkhead', nameCN: '共底', description: '与RP-1箱共享的凹形隔底' },
      { name: 'Anti-slosh Baffles', nameCN: '防荡板', description: '6道环形挡板' },
      { name: 'Main Feed Line', nameCN: '主供液管', description: '大口径中心供液管路' },
      { name: 'Chill Valves', nameCN: '预冷阀', description: '3个发动机预冷排放阀' },
      { name: 'MLI Insulation', nameCN: 'MLI隔热层', description: '多层反射隔热毯' },
    ],
    color: 0xe0e8f0,
  });

  // Module 7: First Stage RP-1 Tank
  const f1rp1 = buildF1RP1();
  const f1rp1Y = -7;
  f1rp1.position.set(0, f1rp1Y, 0);
  modules.push({
    name: 'First Stage RP-1 Tank', nameCN: '一级煤油贮箱',
    description: '储存约287吨RP-1煤油。内设5道防荡板和3个氦气增压瓶。底部配备大口径出口阀，通过主供液管向9台发动机供燃料。',
    mesh: f1rp1, basePosition: new THREE.Vector3(0, f1rp1Y, 0),
    explodeOffset: new THREE.Vector3(6, -3, -2),
    subModules: [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金结构' },
      { name: 'Common Bulkhead', nameCN: '共底（上）', description: '与LOX箱共享的凸形隔底' },
      { name: 'He Bottles', nameCN: '氦气瓶', description: '3个COPV复合气瓶' },
      { name: 'Baffles', nameCN: '防荡板', description: '5道防晃结构' },
      { name: 'Outlet Valve', nameCN: '主出口阀', description: '大口径燃料出口' },
    ],
    color: 0xe8e8e8,
  });

  // Module 8: Engine Section
  const engSection = buildEngineSection();
  const engSectionY = -11;
  engSection.position.set(0, engSectionY, 0);
  modules.push({
    name: 'Engine Section (9x Merlin)', nameCN: '发动机舱 (Octaweb)',
    description: 'Octaweb集成推力结构，搭载9台Merlin 1D发动机（8+1布局）。每台推力845kN，总推力7,607kN。配备LOX/燃料双歧管、热防护罩。冗余设计可关闭2台发动机仍完成任务。',
    mesh: engSection, basePosition: new THREE.Vector3(0, engSectionY, 0),
    explodeOffset: new THREE.Vector3(-4, -6, 3),
    subModules: [
      { name: 'Octaweb Structure', nameCN: 'Octaweb推力结构', description: '集成式推力承载框架' },
      { name: '9x Merlin Engines', nameCN: '9台Merlin 1D', description: '8+1布局，每台845kN' },
      { name: 'LOX Manifold', nameCN: 'LOX歧管', description: '环形氧化剂分配器' },
      { name: 'Fuel Manifold', nameCN: '燃料歧管', description: '燃料分配环管' },
      { name: 'Heat Shield', nameCN: '热防护罩', description: '底部防热裙板' },
    ],
    color: 0x444444,
  });

  // Module 9: Grid Fins
  const gridFins = buildGridFins();
  const gridFinsY = 2;
  gridFins.position.set(0, gridFinsY, 0);
  modules.push({
    name: 'Grid Fins', nameCN: '栅格翼',
    description: '4个可折叠钛合金栅格翼，用于一级回收再入气动控制。每个翼面由精密钛合金格栅构成，配备独立液压伺服驱动器，提供俯仰/偏航/滚转控制。',
    mesh: gridFins, basePosition: new THREE.Vector3(0, gridFinsY, 0),
    explodeOffset: new THREE.Vector3(5, 0, 5),
    subModules: [
      { name: 'Titanium Lattice', nameCN: '钛合金格栅', description: '精密铸造钛合金网格翼面' },
      { name: 'Hinge Mechanism', nameCN: '铰链机构', description: '折叠/展开铰链' },
      { name: 'Hydraulic Actuator', nameCN: '液压驱动器', description: '独立伺服液压缸' },
      { name: 'Mounting Ring', nameCN: '安装环', description: '与箭体连接的承载环' },
    ],
    color: 0x555555,
  });

  return modules;
}

// Landing legs
export function addLandingLegs(scene: THREE.Scene): THREE.Group {
  const legGroup = new THREE.Group();
  const legMat = new THREE.MeshPhongMaterial({ color: 0x444444 });

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    // Main leg strut
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 0.2), legMat);
    leg.position.set(Math.cos(angle) * (R + 0.4), -13, Math.sin(angle) * (R + 0.4));
    leg.rotation.z = Math.cos(angle) * 0.12;
    leg.rotation.x = Math.sin(angle) * 0.12;
    legGroup.add(leg);

    // Secondary strut
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3, 0.08), legMat);
    strut.position.set(Math.cos(angle) * (R + 0.2), -12, Math.sin(angle) * (R + 0.2));
    strut.rotation.z = Math.cos(angle) * 0.08;
    strut.rotation.x = Math.sin(angle) * 0.08;
    legGroup.add(strut);

    // Foot pad
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.4), legMat);
    foot.position.set(Math.cos(angle) * (R + 0.6), -15, Math.sin(angle) * (R + 0.6));
    legGroup.add(foot);

    // Honeycomb crush core
    const crush = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8),
      new THREE.MeshPhongMaterial({ color: 0x888800 })
    );
    crush.position.set(Math.cos(angle) * (R + 0.5), -14.5, Math.sin(angle) * (R + 0.5));
    legGroup.add(crush);
  }

  scene.add(legGroup);
  return legGroup;
}
