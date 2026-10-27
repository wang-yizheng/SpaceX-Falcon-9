import * as THREE from 'three';

// Create a canvas-based texture for the rocket body (white with SpaceX branding)
export function createBodyTexture(width = 512, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Base white color with subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#d8d8d8');
  gradient.addColorStop(0.3, '#f5f5f5');
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(0.7, '#f5f5f5');
  gradient.addColorStop(1, '#d8d8d8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add panel lines
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const x = (width / 8) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal seam lines
  for (let i = 0; i < 6; i++) {
    const y = (height / 6) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // SpaceX logo area (simplified text)
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPACE', width / 2, height * 0.4);
  ctx.fillText('X', width / 2, height * 0.4 + 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Create texture for the fairing (white with heat shield pattern)
export function createFairingTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // White base
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#e0e0e0');
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(1, '#e0e0e0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Honeycomb pattern (simplified)
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 0.5;
  const hexSize = 20;
  for (let row = 0; row < height / hexSize + 1; row++) {
    for (let col = 0; col < width / hexSize + 1; col++) {
      const x = col * hexSize * 1.5;
      const y = row * hexSize * 1.73 + (col % 2 ? hexSize * 0.866 : 0);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const px = x + hexSize * 0.5 * Math.cos(angle);
        const py = y + hexSize * 0.5 * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Create engine nozzle texture (dark metallic)
export function createEngineTexture(width = 256, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark metallic gradient
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(0.3, '#333333');
  gradient.addColorStop(0.6, '#555555');
  gradient.addColorStop(0.8, '#444444');
  gradient.addColorStop(1, '#222222');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add some metallic scratches
  ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 20; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.random() * 30 - 15, y1 + Math.random() * 30 - 15);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Create interstage texture (dark with patterns)
export function createInterstageTexture(width = 512, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark base
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, width, height);

  // Grid pattern
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    const x = (width / 16) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Colored pusher points
  ctx.fillStyle = '#ff6600';
  for (let i = 0; i < 8; i++) {
    const x = (width / 8) * i + width / 16;
    ctx.beginPath();
    ctx.arc(x, height * 0.8, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Create grid fin texture
export function createGridFinTexture(width = 256, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark metallic
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, width, height);

  // Grid pattern
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  const gridSize = 16;
  for (let i = 0; i <= gridSize; i++) {
    const x = (width / gridSize) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let i = 0; i <= gridSize; i++) {
    const y = (height / gridSize) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Create LOX tank texture (light blue tint for cryogenic)
export function createLOXTankTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Slightly blue-tinted white (LOX = liquid oxygen, cryogenic)
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#c8d8e8');
  gradient.addColorStop(0.3, '#e8f0f8');
  gradient.addColorStop(0.5, '#f0f8ff');
  gradient.addColorStop(0.7, '#e8f0f8');
  gradient.addColorStop(1, '#c8d8e8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Panel lines
  ctx.strokeStyle = '#b0c0d0';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const x = (width / 8) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // LOX label
  ctx.fillStyle = '#4488aa';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LOX', width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Create RP-1 tank texture (slightly darker for kerosene)
export function createRP1TankTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Slightly darker white
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#d0d0d0');
  gradient.addColorStop(0.3, '#eeeeee');
  gradient.addColorStop(0.5, '#f8f8f8');
  gradient.addColorStop(0.7, '#eeeeee');
  gradient.addColorStop(1, '#d0d0d0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Panel lines
  ctx.strokeStyle = '#bbbbbb';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const x = (width / 8) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // RP-1 label
  ctx.fillStyle = '#666666';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RP-1', width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Create starfield background texture
export function createStarfieldTexture(width = 2048, height = 2048): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark space background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, width, height);

  // Stars
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    const brightness = Math.random() * 255;
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${Math.min(255, brightness + 50)}, ${0.5 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}
