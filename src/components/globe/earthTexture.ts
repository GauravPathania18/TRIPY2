import * as THREE from 'three';

const continents: number[][][] = [
  // North America
  [
    [-168, 66], [-120, 70], [-80, 75], [-60, 60], [-50, 50],
    [-80, 25], [-100, 15], [-110, 8], [-105, 20], [-125, 33],
    [-125, 49], [-165, 54], [-168, 66]
  ],
  // Greenland
  [
    [-70, 75], [-40, 80], [-20, 70], [-50, 60], [-70, 75]
  ],
  // South America
  [
    [-80, 12], [-40, -5], [-35, -5], [-45, -20], [-70, -50],
    [-75, -40], [-80, -20], [-80, 12]
  ],
  // Europe & Asia
  [
    [-10, 65], [30, 72], [60, 75], [120, 75], [170, 70], 
    [180, 60], [140, 35], [120, 15], [100, 5], [80, 10],
    [45, 15], [35, 35], [15, 35], [-10, 40], [-10, 65]
  ],
  // India & Southeast Asia
  [
    [70, 25], [90, 25], [100, 15], [105, 5], [95, 5], [75, 10], [70, 25]
  ],
  // Africa
  [
    [-17, 32], [30, 30], [50, 12], [40, -15], [20, -35],
    [10, -35], [10, -10], [-5, 5], [-17, 15], [-17, 32]
  ],
  // Australia
  [
    [113, -22], [153, -15], [153, -38], [115, -35], [113, -22]
  ],
  // Antarctica
  [
    [-180, -75], [180, -75], [180, -90], [-180, -90], [-180, -75]
  ]
];

export function createStylizedEarthTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Draw Space/Water Background (Deep navy space blue)
  ctx.fillStyle = '#050b18';
  ctx.fillRect(0, 0, width, height);

  // Helper coordinate mappers
  const getX = (lng: number) => ((lng + 180) / 360) * width;
  const getY = (lat: number) => ((90 - lat) / 180) * height;

  // 2. Draw Latitude/Longitude Grid in the background (very subtle)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
  ctx.lineWidth = 1;
  
  // Draw Longitude lines
  for (let lng = -180; lng <= 180; lng += 15) {
    ctx.beginPath();
    ctx.moveTo(getX(lng), 0);
    ctx.lineTo(getX(lng), height);
    ctx.stroke();
  }
  // Draw Latitude lines
  for (let lat = -90; lat <= 90; lat += 15) {
    ctx.beginPath();
    ctx.moveTo(0, getY(lat));
    ctx.lineTo(width, getY(lat));
    ctx.stroke();
  }

  // Draw Equator & Prime Meridian with slightly higher visibility
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.lineWidth = 1.2;
  
  ctx.beginPath();
  ctx.moveTo(0, getY(0));
  ctx.lineTo(width, getY(0));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(getX(0), 0);
  ctx.lineTo(getX(0), height);
  ctx.stroke();

  // 3. Draw Continents with glowing borders and grid dots
  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach((coord, i) => {
      const px = getX(coord[0]);
      const py = getY(coord[1]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();

    // Fill land with deep cyan-blue
    ctx.fillStyle = 'rgba(8, 47, 73, 0.4)';
    ctx.fill();

    // Stroke land with vibrant cyan
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 4. Draw dotted grid pattern clipped to continents for high-tech look
  continents.forEach((poly) => {
    ctx.save();
    ctx.beginPath();
    poly.forEach((coord, i) => {
      const px = getX(coord[0]);
      const py = getY(coord[1]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
    for (let x = 0; x < width; x += 10) {
      for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
