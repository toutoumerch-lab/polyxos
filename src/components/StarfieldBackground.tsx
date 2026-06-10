import { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Star {
  x: number; y: number;
  z: number; // depth: 0 = far (small/dim), 1 = near (large/bright)
  size: number; opacity: number;
  twinkleSpeed: number; twinkleOffset: number;
  r: number; g: number; b: number;
}

interface ShootingStar {
  x: number; y: number;
  vx: number; vy: number;
  length: number; opacity: number;
  life: number; maxLife: number;
}

interface NebulaCloud {
  x: number; y: number;
  radiusX: number; radiusY: number;
  r: number; g: number; b: number;
  opacity: number;
  driftX: number; driftY: number;
  rotation: number; rotationSpeed: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Star color palette: white, cool blue-white, blue-tinted, purple-tinted, warm
const STAR_PALETTE: [number, number, number][] = [
  [255, 255, 255],   // pure white
  [204, 224, 255],   // cool blue-white
  [212, 198, 255],   // lavender
  [198, 240, 255],   // icy cyan
  [255, 248, 220],   // warm ivory
];

// Nebula palette: blue, violet, cyan, indigo
const NEBULA_PALETTE: [number, number, number][] = [
  [59,  130, 246],  // blue
  [139,  92, 246],  // violet
  [6,   182, 212],  // cyan
  [99,  102, 241],  // indigo
  [168,  85, 247],  // purple
  [30,   58, 138],  // deep navy glow
];

// ─── Star generation ──────────────────────────────────────────────────────────
function makeStars(W: number, H: number, count = 340): Star[] {
  return Array.from({ length: count }, () => {
    const z = Math.random();
    const [r, g, b] = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
    return {
      x: rand(0, W), y: rand(0, H),
      z,
      size:   z < 0.35 ? rand(0.3, 0.8)
            : z < 0.65 ? rand(0.7, 1.4)
            :             rand(1.3, 2.6),
      opacity:      rand(0.2, 0.9),
      twinkleSpeed: rand(0.6, 3.0),
      twinkleOffset: rand(0, Math.PI * 2),
      r, g, b,
    };
  });
}

// ─── Nebula generation ────────────────────────────────────────────────────────
function makeNebulae(W: number, H: number): NebulaCloud[] {
  return Array.from({ length: 8 }, () => {
    const [r, g, b] = NEBULA_PALETTE[Math.floor(Math.random() * NEBULA_PALETTE.length)];
    return {
      x: rand(-100, W + 100), y: rand(-100, H + 100),
      radiusX: rand(200, 500),
      radiusY: rand(130, 320),
      r, g, b,
      opacity:       rand(0.025, 0.08),
      driftX:        rand(-0.04, 0.04),
      driftY:        rand(-0.025, 0.025),
      rotation:      rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.0002, 0.0002),
    };
  });
}

// ─── Shooting star spawn ───────────────────────────────────────────────────────
function spawnShoot(W: number, _H: number): ShootingStar {
  const angle = rand(30, 60) * (Math.PI / 180);
  const speed = rand(9, 20);
  return {
    x: rand(0, W * 0.75),
    y: rand(0, 200),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length:  rand(90, 220),
    opacity: rand(0.75, 1),
    life:    0,
    maxLife: rand(45, 85),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StarfieldBackground() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef({
    stars:    [] as Star[],
    nebulae:  [] as NebulaCloud[],
    shoots:   [] as ShootingStar[],
    mouse:    { x: 0.5, y: 0.5 },
    t:        0,
    frame:    0,
    shootTimer: 0 as unknown as ReturnType<typeof setTimeout>,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const S = stateRef.current;

    // ── Resize ──────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;           // fixed viewport height
      S.stars   = makeStars(canvas.width, canvas.height);
      S.nebulae = makeNebulae(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Mouse ────────────────────────────────────────────────────────────────
    const onMouse = (e: MouseEvent) => {
      S.mouse = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouse);

    // ── Shooting star scheduler ───────────────────────────────────────────────
    const scheduleShoot = () => {
      S.shootTimer = setTimeout(() => {
        S.shoots.push(spawnShoot(canvas.width, canvas.height));
        scheduleShoot();
      }, rand(2800, 6500));
    };
    scheduleShoot();

    // ── Draw loop ─────────────────────────────────────────────────────────────
    const draw = () => {
      S.t += 0.016;
      const W = canvas.width;
      const H = canvas.height;
      const mx = S.mouse.x;
      const my = S.mouse.y;

      ctx.clearRect(0, 0, W, H);

      // ── 1. Nebula clouds ──────────────────────────────────────────────────
      S.nebulae.forEach(n => {
        n.x += n.driftX;
        n.y += n.driftY;
        n.rotation += n.rotationSpeed;
        if (n.x < -n.radiusX * 2) n.x = W + n.radiusX;
        if (n.x > W + n.radiusX * 2) n.x = -n.radiusX;
        if (n.y < -n.radiusY * 2) n.y = H + n.radiusY;
        if (n.y > H + n.radiusY * 2) n.y = -n.radiusY;

        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rotation);
        ctx.scale(n.radiusX / n.radiusY, 1);

        const R = n.radiusY;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
        grad.addColorStop(0,   `rgba(${n.r},${n.g},${n.b},${(n.opacity * 2).toFixed(3)})`);
        grad.addColorStop(0.45,`rgba(${n.r},${n.g},${n.b},${n.opacity.toFixed(3)})`);
        grad.addColorStop(1,   `rgba(${n.r},${n.g},${n.b},0)`);

        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // ── 2. Stars ──────────────────────────────────────────────────────────
      S.stars.forEach(s => {
        // Parallax: near stars (z≈1) move more than far stars (z≈0)
        const px = s.x + (mx - 0.5) * s.z * 28;
        const py = s.y + (my - 0.5) * s.z * 28;

        // Twinkle: sine wave on opacity
        const twinkle = 0.5 + 0.5 * Math.sin(S.t * s.twinkleSpeed + s.twinkleOffset);
        const alpha   = s.opacity * (0.4 + 0.6 * twinkle);

        // Soft outer glow for larger/nearer stars
        if (s.size > 1.5) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, s.size * 5);
          glow.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${(alpha * 0.35).toFixed(3)})`);
          glow.addColorStop(1, `rgba(${s.r},${s.g},${s.b},0)`);
          ctx.beginPath();
          ctx.arc(px, py, s.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Star dot
        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha.toFixed(3)})`;
        ctx.fill();
      });

      // ── 3. Shooting stars ────────────────────────────────────────────────
      S.shoots = S.shoots.filter(ss => ss.life < ss.maxLife);
      S.shoots.forEach(ss => {
        ss.life++;
        ss.x += ss.vx;
        ss.y += ss.vy;

        const progress = ss.life / ss.maxLife;
        const alpha    = ss.opacity * (1 - progress);

        const len   = ss.length * Math.min(progress * 3, 1);
        const norm  = Math.sqrt(ss.vx ** 2 + ss.vy ** 2);
        const tailX = ss.x - (ss.vx / norm) * len;
        const tailY = ss.y - (ss.vy / norm) * len;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0,    `rgba(255,255,255,0)`);
        grad.addColorStop(0.6,  `rgba(200,225,255,${(alpha * 0.25).toFixed(3)})`);
        grad.addColorStop(1,    `rgba(255,255,255,${alpha.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.8;
        ctx.lineCap     = 'round';
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fill();

        // Head glow
        const hGlow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 12);
        hGlow.addColorStop(0, `rgba(180,215,255,${(alpha * 0.6).toFixed(3)})`);
        hGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = hGlow;
        ctx.fill();
      });

      S.frame = requestAnimationFrame(draw);
    };

    S.frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(S.frame);
      clearTimeout(S.shootTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width:  '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
