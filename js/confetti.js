// confetti.js
// A tiny, dependency-free confetti burst rendered on a full-screen canvas.
// Used to celebrate a player victory. Call launchConfetti() to start and
// stopConfetti() to clear it (e.g. on "Play Again").

const COLORS = [
  '#ff5252', // red
  '#ffd740', // amber
  '#69f0ae', // green
  '#40c4ff', // blue
  '#e040fb', // purple
  '#ffffff', // white
];

let canvas = null;
let ctx = null;
let particles = [];
let rafId = null;
let lastTime = 0;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Creates a single confetti piece starting near the top of the screen.
function makeParticle() {
  const w = canvas.width;
  return {
    x: Math.random() * w,
    y: -20 - Math.random() * canvas.height * 0.3,
    size: 6 + Math.random() * 6,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    // Velocity in px/second.
    vx: (Math.random() - 0.5) * 160,
    vy: 120 + Math.random() * 180,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 8,
    // Lifetime in seconds before the piece fades out.
    life: 2.6 + Math.random() * 1.8,
    age: 0,
  };
}

function tick(now) {
  if (!ctx) return;
  const dt = lastTime ? (now - lastTime) / 1000 : 0;
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.age += dt;
    p.vy += 320 * dt; // gravity
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vrot * dt;

    const remaining = p.life - p.age;
    const alpha = remaining > 0.6 ? 1 : Math.max(remaining / 0.6, 0);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  }

  // Drop dead or off-screen pieces.
  particles = particles.filter(
    (p) => p.age < p.life && p.y < canvas.height + 40
  );

  if (particles.length > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    stopConfetti();
  }
}

export function launchConfetti(count = 160) {
  ensureCanvas();
  if (!ctx) return;
  for (let i = 0; i < count; i++) particles.push(makeParticle());
  if (rafId == null) {
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }
}

export function stopConfetti() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  particles = [];
  lastTime = 0;
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
