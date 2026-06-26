import React, { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

const COLORS = [
  { color: "rgba(34, 211, 238, ", glow: "rgba(34, 211, 238, " },   // cyan-400
  { color: "rgba(45, 212, 191, ", glow: "rgba(45, 212, 191, " },   // teal-400
  { color: "rgba(52, 211, 153, ", glow: "rgba(52, 211, 153, " },   // emerald-400
  { color: "rgba(129, 140, 248, ", glow: "rgba(129, 140, 248, " }, // indigo-400
  { color: "rgba(167, 139, 250, ", glow: "rgba(167, 139, 250, " }, // violet-400
  { color: "rgba(96, 165, 250, ", glow: "rgba(96, 165, 250, " },   // blue-400
];

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const PARTICLE_COUNT = 180;
  const CONNECTION_DIST = 140;
  const MOUSE_RADIUS = 200;
  const MOUSE_FORCE = 0.08;
  const RETURN_FORCE = 0.015;
  const FRICTION = 0.96;

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const colorPair = COLORS[Math.floor(Math.random() * COLORS.length)];
      const radius = Math.random() * 2.5 + 0.8;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius,
        color: colorPair.color,
        glowColor: colorPair.glow,
        alpha: Math.random() * 0.5 + 0.4,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { w: rect.width, h: rect.height };

      if (particlesRef.current.length === 0) {
        initParticles(rect.width, rect.height);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    // Listen on the parent so mouse events cover the whole area
    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    let time = 0;

    const animate = () => {
      const { w, h } = dimensionsRef.current;
      ctx.clearRect(0, 0, w, h);
      time += 1;

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update particles
      for (const p of particles) {
        // Mouse interaction - attract particles toward cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          p.vx += dx / dist * force;
          p.vy += dy / dist * force;
        }

        // Return to base position (gentle spring)
        const bx = p.baseX - p.x;
        const by = p.baseY - p.y;
        p.vx += bx * RETURN_FORCE;
        p.vy += by * RETURN_FORCE;

        // Friction
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Pulsing alpha
        p.alpha = 0.4 + Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.3;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const cdx = a.x - b.x;
          const cdy = a.y - b.y;
          const cd = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cd < CONNECTION_DIST) {
            const opacity = (1 - cd / CONNECTION_DIST) * 0.2;

            // Brighter lines near mouse
            let lineBoost = 0;
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const mdx = mouse.x - midX;
            const mdy = mouse.y - midY;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < MOUSE_RADIUS) {
              lineBoost = (1 - mDist / MOUSE_RADIUS) * 0.35;
            }

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity + lineBoost})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        // Outer glow
        const glowRadius = p.radius * 4;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `${p.glowColor}${(p.alpha * 0.4).toFixed(2)})`);
        gradient.addColorStop(1, `${p.glowColor}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha.toFixed(2)})`;
        ctx.fill();

        // Near mouse - extra bright core
        const pdx = mouse.x - p.x;
        const pdy = mouse.y - p.y;
        const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pDist < MOUSE_RADIUS * 0.7) {
          const brightness = (1 - pDist / (MOUSE_RADIUS * 0.7)) * 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness.toFixed(2)})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
