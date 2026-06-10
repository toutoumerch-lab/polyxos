import { useEffect, useRef } from 'react';

// ─── Math helpers ─────────────────────────────────────────────────────────────
type Vec3 = [number, number, number];

const dot = (a: Vec3, b: Vec3) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];

function rotateX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c];
}
function rotateY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0]*c + v[2]*s, v[1], -v[0]*s + v[2]*c];
}
function rotateZ(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0]*c - v[1]*s, v[0]*s + v[1]*c, v[2]];
}
function rotate(v: Vec3, rx: number, ry: number, rz: number): Vec3 {
  return rotateZ(rotateY(rotateX(v, rx), ry), rz);
}
function project(v: Vec3, cx: number, cy: number, fov: number): [number, number] {
  const z = v[2] + fov;
  if (z <= 0.001) return [cx, cy];
  const s = fov / z;
  return [cx + v[0] * s, cy + v[1] * s];
}

// ─── Cube geometry ────────────────────────────────────────────────────────────
// 8 vertices of a unit cube (half-size = 1, centered at origin)
const BASE_VERTS: Vec3[] = [
  [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1], // back:  0,1,2,3
  [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1], // front: 4,5,6,7
];

// Faces: vertex indices + outward normal + light role
interface FaceDef {
  idx:    [number, number, number, number];
  normal: Vec3;
  role:   'front' | 'top' | 'right' | 'back';
}
const FACES: FaceDef[] = [
  { idx: [4, 5, 6, 7], normal: [ 0,  0,  1], role: 'front' }, // +Z (front)
  { idx: [1, 0, 3, 2], normal: [ 0,  0, -1], role: 'back'  }, // -Z (back)
  { idx: [0, 1, 5, 4], normal: [ 0, -1,  0], role: 'top'   }, // -Y (top)
  { idx: [3, 7, 6, 2], normal: [ 0,  1,  0], role: 'back'  }, // +Y (bottom)
  { idx: [5, 1, 2, 6], normal: [ 1,  0,  0], role: 'right' }, // +X (right)
  { idx: [0, 4, 7, 3], normal: [-1,  0,  0], role: 'back'  }, // -X (left)
];

// Light direction (normalized): from upper-right-front
const LIGHT: Vec3 = [0.45, -0.75, 0.50];
const lenL = Math.sqrt(LIGHT[0]**2 + LIGHT[1]**2 + LIGHT[2]**2);
const LIGHT_N: Vec3 = [LIGHT[0]/lenL, LIGHT[1]/lenL, LIGHT[2]/lenL];

// ─── Color palette — matching exact Polyxos logo colours ─────────────────────
interface CubePalette {
  r: number; g: number; b: number;  // base (front) face RGB
}
const PALETTES: CubePalette[] = [
  { r: 67,  g: 56,  b: 202 }, // #4338ca deep indigo
  { r: 79,  g: 70,  b: 229 }, // #4f46e5 indigo
  { r: 99,  g: 102, b: 241 }, // #6366f1 indigo-400
  { r: 55,  g: 48,  b: 163 }, // #3730a3 indigo-700
  { r: 37,  g: 99,  b: 235 }, // #2563eb blue-600
  { r: 59,  g: 130, b: 246 }, // #3b82f6 blue-400
  { r: 129, g: 140, b: 248 }, // #818cf8 indigo-light
  { r: 6,   g: 182, b: 212 }, // #06b6d4 cyan (accent!)
  { r: 29,  g: 78,  b: 216 }, // #1d4ed8 blue-700
];

// ─── Cube instance ────────────────────────────────────────────────────────────
interface Cube {
  // World position
  x: number; y: number; z: number;
  // Drift velocity
  vx: number; vy: number; vz: number;
  // Rotation angles
  rx: number; ry: number; rz: number;
  // Rotation speed
  vrx: number; vry: number; vrz: number;
  // Half-size
  s: number;
  // Palette
  pal: CubePalette;
  // Master opacity (0-1)
  opacity: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randSign = () => (Math.random() < 0.5 ? 1 : -1);

function makeCubes(W: number, H: number, count = 28): Cube[] {
  return Array.from({ length: count }, () => {
    const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    // Spread cubes in a wide 3D volume centred on the hero
    const s = rand(14, 54);
    return {
      x:   rand(-W * 0.5, W * 0.5),
      y:   rand(-H * 0.5, H * 0.5),
      z:   rand(-180, 180),
      vx:  rand(0.06, 0.22) * randSign(),
      vy:  rand(0.04, 0.16) * randSign(),
      vz:  rand(0.04, 0.14) * randSign(),
      rx:  rand(0, Math.PI * 2),
      ry:  rand(0, Math.PI * 2),
      rz:  rand(0, Math.PI * 2),
      vrx: rand(0.003, 0.012) * randSign(),
      vry: rand(0.004, 0.015) * randSign(),
      vrz: rand(0.002, 0.009) * randSign(),
      s,
      pal,
      opacity: rand(0.25, 0.7),
    };
  });
}

// ─── Draw one cube ────────────────────────────────────────────────────────────
function drawCube(
  ctx: CanvasRenderingContext2D,
  cube: Cube,
  cx: number, cy: number,
  fov: number,
  mouseX: number, mouseY: number,
) {
  const { x, y, z, rx, ry, rz, s, pal, opacity } = cube;

  // Subtle mouse parallax on position
  const px = cx + x + (mouseX - 0.5) * 30 * (1 - (z + 200) / 400);
  const py = cy + y + (mouseY - 0.5) * 20 * (1 - (z + 200) / 400);

  // Transform all 8 vertices
  const verts3d = BASE_VERTS.map(v =>
    rotate([v[0]*s, v[1]*s, v[2]*s], rx, ry, rz)
  ) as Vec3[];

  // Translate to world position (z-offset from camera perspective)
  const translated = verts3d.map(v =>
    [v[0] + (px - cx), v[1] + (py - cy), v[2] + z] as Vec3
  );

  // Project to 2D
  const proj2d = translated.map(v => project(v, cx, cy, fov));

  // ── Collect visible faces with depth ────────────────────────────────────────
  type DrawFace = {
    points: [number, number][];
    depth:  number;
    r: number; g: number; b: number;
    bright: number;
  };
  const toRender: DrawFace[] = [];

  FACES.forEach(face => {
    // Rotate the face normal
    const rn = rotate(face.normal, rx, ry, rz);

    // Back-face culling: normal must face camera (+Z direction)
    const camDot = rn[2]; // dot with [0,0,1]
    if (camDot <= 0) return;

    // Lighting: how much this face catches the light
    const lightDot = Math.max(0, dot(rn, LIGHT_N));
    const ambient   = 0.22;
    const bright    = ambient + (1 - ambient) * lightDot;

    // Average depth of this face for painter's algorithm
    const faceVerts = face.idx.map(i => translated[i]);
    const avgZ = faceVerts.reduce((sum, v) => sum + v[2], 0) / 4;

    // Modulate color: lighter top, darker sides
    let fr = pal.r * bright;
    let fg = pal.g * bright;
    let fb = pal.b * bright;

    // Top face: slightly lighter (+15%)
    if (face.role === 'top')   { fr = Math.min(255, fr * 1.18); fg = Math.min(255, fg * 1.18); fb = Math.min(255, fb * 1.18); }
    // Right face: slightly darker (-15%)
    if (face.role === 'right') { fr *= 0.78; fg *= 0.78; fb *= 0.78; }

    toRender.push({
      points: face.idx.map(i => proj2d[i]),
      depth:  avgZ,
      r: fr, g: fg, b: fb,
      bright,
    });
  });

  // Sort back-to-front (painter's algorithm)
  toRender.sort((a, b) => a.depth - b.depth);

  // ── Draw faces ───────────────────────────────────────────────────────────────
  toRender.forEach(f => {
    const pts = f.points;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();

    ctx.fillStyle   = `rgba(${f.r|0},${f.g|0},${f.b|0},${opacity.toFixed(2)})`;
    ctx.strokeStyle = `rgba(${f.r|0},${f.g|0},${f.b|0},${(opacity * 0.6).toFixed(2)})`;
    ctx.lineWidth   = 0.5;
    ctx.fill();
    ctx.stroke();

    // Shine overlay on the brightest face
    if (f.bright > 0.75) {
      const shine = ctx.createLinearGradient(
        pts[0][0], pts[0][1], pts[2][0], pts[2][1]
      );
      shine.addColorStop(0, `rgba(255,255,255,${(opacity * 0.22).toFixed(2)})`);
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
    }
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HeroCubes3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({
    cubes:  [] as Cube[],
    mouse:  { x: 0.5, y: 0.5 },
    frame:  0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const S = stateRef.current;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      S.cubes = makeCubes(canvas.width, canvas.height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      S.mouse = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top)  / r.height,
      };
    };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) { S.frame = requestAnimationFrame(draw); return; }

      const cx  = W / 2;
      const cy  = H / 2;
      const fov = 420; // perspective focal length

      ctx.clearRect(0, 0, W, H);

      // Update + draw each cube
      S.cubes.forEach(cube => {
        // Advance rotation
        cube.rx += cube.vrx;
        cube.ry += cube.vry;
        cube.rz += cube.vrz;

        // Drift
        cube.x += cube.vx;
        cube.y += cube.vy;
        cube.z += cube.vz;

        // Wrap around the viewport
        const halfW = W * 0.6;
        const halfH = H * 0.6;
        if (cube.x > halfW)  cube.x = -halfW;
        if (cube.x < -halfW) cube.x =  halfW;
        if (cube.y > halfH)  cube.y = -halfH;
        if (cube.y < -halfH) cube.y =  halfH;
        if (cube.z > 200)    cube.z = -180;
        if (cube.z < -200)   cube.z =  180;

        drawCube(ctx, cube, cx, cy, fov, S.mouse.x, S.mouse.y);
      });

      S.frame = requestAnimationFrame(draw);
    };

    S.frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(S.frame);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width:  '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
