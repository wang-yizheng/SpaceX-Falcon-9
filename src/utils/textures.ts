import * as THREE from 'three';

// ===== Utility: Canvas Texture Factory =====
function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

// 1. Body panel texture (for main structure)
export function createBodyTexture(w = 512, h = 1024): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#c8c8c8'); g.addColorStop(0.3, '#f0f0f0');
  g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.7, '#f0f0f0'); g.addColorStop(1, '#c8c8c8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Vertical weld seams
  ctx.strokeStyle = '#b8b8b8'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) { const x = (w / 8) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  // Horizontal ring frames
  for (let i = 0; i < 12; i++) { const y = (h / 12) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // Rivet dots
  ctx.fillStyle = '#aaaaaa';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 12; j++) {
    ctx.beginPath(); ctx.arc((w / 8) * i, (h / 12) * j, 2, 0, Math.PI * 2); ctx.fill();
  }
  // SpaceX text
  ctx.fillStyle = '#222'; ctx.font = 'bold 52px Arial'; ctx.textAlign = 'center';
  ctx.fillText('SPACE', w / 2, h * 0.35); ctx.fillText('X', w / 2, h * 0.35 + 55);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// 2. Fairing honeycomb texture
export function createFairingTexture(w = 512, h = 512): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#d8d8d8'); g.addColorStop(0.5, '#f5f5f5'); g.addColorStop(1, '#d8d8d8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Honeycomb
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.8;
  const hs = 18;
  for (let r = 0; r < h / (hs * 1.5) + 2; r++) for (let col = 0; col < w / (hs * 1.73) + 2; col++) {
    const cx = col * hs * 1.73 + (r % 2 ? hs * 0.866 : 0);
    const cy = r * hs * 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; const px = cx + hs * 0.45 * Math.cos(a); const py = cy + hs * 0.45 * Math.sin(a); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.closePath(); ctx.stroke();
  }
  // Composite layup lines
  ctx.strokeStyle = 'rgba(180,180,200,0.3)'; ctx.lineWidth = 0.5;
  for (let i = 0; i < 40; i++) { const y = Math.random() * h; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random() - 0.5) * 10); ctx.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// 3. Engine metallic texture
export function createEngineTexture(w = 256, h = 256): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#1a1a1a'); g.addColorStop(0.4, '#3a3a3a'); g.addColorStop(0.7, '#555'); g.addColorStop(1, '#222');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Machining marks
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(${80 + Math.random() * 40},${80 + Math.random() * 40},${80 + Math.random() * 40},0.2)`;
    ctx.lineWidth = 0.5;
    const x = Math.random() * w; const y = Math.random() * h;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40); ctx.stroke();
  }
  // Heat discoloration
  const hg = ctx.createRadialGradient(w * 0.3, h * 0.7, 0, w * 0.3, h * 0.7, w * 0.4);
  hg.addColorStop(0, 'rgba(100,60,30,0.15)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hg; ctx.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(c);
}

// 4. Interstage texture
export function createInterstageTexture(w = 512, h = 256): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#222'; ctx.fillRect(0, 0, w, h);
  // Carbon fiber weave pattern
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 6) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - h, h); ctx.stroke(); }
  // Separation bolts
  ctx.fillStyle = '#ff6600';
  for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc((w / 12) * i + w / 24, h * 0.85, 5, 0, Math.PI * 2); ctx.fill(); }
  // Pusher points
  ctx.fillStyle = '#cc4400';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc((w / 6) * i + w / 12, h * 0.15, 8, 0, Math.PI * 2); ctx.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// 5. Grid fin texture
export function createGridFinTexture(w = 256, h = 256): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0, 0, w, h);
  const gs = 12;
  ctx.strokeStyle = '#777'; ctx.lineWidth = 2;
  for (let i = 0; i <= gs; i++) { const x = (w / gs) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let i = 0; i <= gs; i++) { const y = (h / gs) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // Titanium sheen
  const tg = ctx.createLinearGradient(0, 0, w, h);
  tg.addColorStop(0, 'rgba(150,150,170,0.1)'); tg.addColorStop(0.5, 'rgba(200,200,220,0.15)'); tg.addColorStop(1, 'rgba(100,100,120,0.1)');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(c);
}

// 6. LOX tank texture (cryogenic blue tint)
export function createLOXTankTexture(w = 512, h = 512): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#b8cce0'); g.addColorStop(0.3, '#d8e8f5'); g.addColorStop(0.5, '#e8f2ff'); g.addColorStop(0.7, '#d8e8f5'); g.addColorStop(1, '#b8cce0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Frost crystals
  ctx.fillStyle = 'rgba(200,220,255,0.3)';
  for (let i = 0; i < 100; i++) { const x = Math.random() * w; const y = Math.random() * h; ctx.beginPath(); ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2); ctx.fill(); }
  // Weld seams
  ctx.strokeStyle = '#a0b8d0'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) { const x = (w / 8) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  // LOX label
  ctx.fillStyle = '#3377aa'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText('LOX', w / 2, h / 2);
  ctx.font = '16px Arial'; ctx.fillText('Liquid Oxygen', w / 2, h / 2 + 25);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// 7. RP-1 tank texture
export function createRP1TankTexture(w = 512, h = 512): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#c0c0c0'); g.addColorStop(0.3, '#e8e8e8'); g.addColorStop(0.5, '#f2f2f2'); g.addColorStop(0.7, '#e8e8e8'); g.addColorStop(1, '#c0c0c0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) { const x = (w / 8) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  ctx.fillStyle = '#555'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText('RP-1', w / 2, h / 2);
  ctx.font = '16px Arial'; ctx.fillText('Rocket Grade Kerosene', w / 2, h / 2 + 25);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// 8. Internal pipe texture
export function createPipeTexture(w = 128, h = 128): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#666'); g.addColorStop(0.3, '#999'); g.addColorStop(0.5, '#aaa'); g.addColorStop(0.7, '#999'); g.addColorStop(1, '#666');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Insulation wrapping
  ctx.strokeStyle = 'rgba(150,150,150,0.3)'; ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) { const y = (h / 20) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  return new THREE.CanvasTexture(c);
}

// 9. Thrust structure / Octaweb texture
export function createOctawebTexture(w = 512, h = 512): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(0, 0, w, h);
  // Structural ribs
  ctx.strokeStyle = '#444'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const cx = w / 2 + Math.cos(angle) * w * 0.3;
    const cy = h / 2 + Math.sin(angle) * h * 0.3;
    ctx.beginPath(); ctx.moveTo(w / 2, h / 2); ctx.lineTo(cx, cy); ctx.stroke();
  }
  // Engine mount circles
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const angle = i === 0 ? 0 : ((i - 1) / 8) * Math.PI * 2;
    const r = i === 0 ? 0 : w * 0.28;
    const cx = w / 2 + Math.cos(angle) * r;
    const cy = h / 2 + Math.sin(angle) * r;
    ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2); ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

// 10. Starfield background
export function createStarfieldTexture(w = 2048, h = 2048): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, w, h);
  // Nebula glow
  const ng = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.4);
  ng.addColorStop(0, 'rgba(30,20,60,0.3)'); ng.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ng; ctx.fillRect(0, 0, w, h);
  // Stars
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * w; const y = Math.random() * h;
    const s = Math.random() * 1.8; const b = Math.random() * 200 + 55;
    const tint = Math.random();
    const r = tint < 0.3 ? b : tint < 0.6 ? b * 0.8 : b;
    const g2 = tint < 0.3 ? b * 0.9 : tint < 0.6 ? b : b * 0.85;
    const bl = tint < 0.3 ? b * 0.7 : tint < 0.6 ? b * 0.85 : b;
    ctx.fillStyle = `rgba(${r},${g2},${bl},${0.4 + Math.random() * 0.6})`;
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; return t;
}

// 11. Turbopump texture
export function createTurbopumpTexture(w = 256, h = 256): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#555'); g.addColorStop(0.5, '#888'); g.addColorStop(1, '#555');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // Turbine blades
  ctx.strokeStyle = '#666'; ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    const x = (w / 24) * i;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 5, h); ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

// 12. Insulation / MLI blanket texture
export function createMLITexture(w = 256, h = 256): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = '#c8a84a'; ctx.fillRect(0, 0, w, h);
  // Wrinkle pattern
  ctx.strokeStyle = 'rgba(160,120,40,0.4)'; ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * h;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x < w; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.05) * 3 + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}
