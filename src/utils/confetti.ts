// Cute star & sparkle burst effect (NO hearts)

export function triggerCuteConfetti(originX?: number, originY?: number) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  const context = ctx;

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const startX = originX ?? width / 2;
  const startY = originY ?? height / 2;

  const colors = [
    '#FBBF24', // Amber
    '#34D399', // Emerald
    '#60A5FA', // Sky blue
    '#F472B6', // Warm rose
    '#A78BFA', // Soft purple
    '#FDE047', // Light yellow
    '#6EE7B7', // Mint
  ];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    type: 'star' | 'circle' | 'sparkle' | 'rect';
    alpha: number;
  }

  const particles: Particle[] = [];
  const particleCount = 65;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    const types: ('star' | 'circle' | 'sparkle' | 'rect')[] = ['star', 'circle', 'sparkle', 'rect'];

    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      type: types[Math.floor(Math.random() * types.length)],
      alpha: 1,
    });
  }

  function drawStar(c: CanvasRenderingContext2D, r: number) {
    c.beginPath();
    for (let i = 0; i < 5; i++) {
      c.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * r, -Math.sin(((18 + i * 72) * Math.PI) / 180) * r);
      c.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (r / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (r / 2));
    }
    c.closePath();
    c.fill();
  }

  let animationFrameId: number;
  let startTime = performance.now();

  function animate(now: number) {
    const elapsed = now - startTime;
    context.clearRect(0, 0, width, height);

    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, 1 - elapsed / 1800);

      if (p.alpha > 0) {
        alive = true;
        context.save();
        context.globalAlpha = p.alpha;
        context.translate(p.x, p.y);
        context.rotate((p.rotation * Math.PI) / 180);
        context.fillStyle = p.color;

        if (p.type === 'circle') {
          context.beginPath();
          context.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          context.fill();
        } else if (p.type === 'rect') {
          context.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
        } else if (p.type === 'star') {
          drawStar(context, p.size);
        } else {
          // Sparkle four-point star
          context.beginPath();
          context.moveTo(0, -p.size);
          context.quadraticCurveTo(0, 0, p.size, 0);
          context.quadraticCurveTo(0, 0, 0, p.size);
          context.quadraticCurveTo(0, 0, -p.size, 0);
          context.quadraticCurveTo(0, 0, 0, -p.size);
          context.fill();
        }
        context.restore();
      }
    }

    if (alive && elapsed < 2000) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}
