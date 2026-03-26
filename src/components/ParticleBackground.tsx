"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  originX: number; originY: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  color: string;
  phase: number;
  speed: number;
}

const COLORS = ["#EBF3F7", "#1A97F4", "#13284E", "#A1CE00"];

// Simplified snow leopard silhouette points (head, body, tail outline)
function generateLeopardPoints(cx: number, cy: number, scale: number): [number, number][] {
  const points: [number, number][] = [];
  // Body ellipse
  for (let i = 0; i < 120; i++) {
    const angle = (i / 120) * Math.PI * 2;
    const rx = 80 * scale, ry = 50 * scale;
    points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
  }
  // Head circle (upper left of body)
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const r = 28 * scale;
    points.push([cx - 65 * scale + Math.cos(angle) * r, cy - 25 * scale + Math.sin(angle) * r]);
  }
  // Tail curve (right side, curving up)
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    const tx = cx + 80 * scale + t * 70 * scale;
    const ty = cy + 20 * scale - Math.sin(t * Math.PI * 1.3) * 60 * scale;
    points.push([tx, ty]);
  }
  // Ears (two triangles on head)
  for (let i = 0; i < 15; i++) {
    const t = i / 15;
    points.push([cx - 80 * scale + t * 12 * scale, cy - 50 * scale - t * 20 * scale]);
    points.push([cx - 55 * scale + t * 12 * scale, cy - 50 * scale - t * 18 * scale]);
  }
  // Legs (four short lines below body)
  for (let leg = 0; leg < 4; leg++) {
    const lx = cx - 45 * scale + leg * 30 * scale;
    for (let i = 0; i < 10; i++) {
      const t = i / 10;
      points.push([lx + (Math.random() - 0.5) * 6 * scale, cy + 45 * scale + t * 30 * scale]);
    }
  }
  // Spots scattered inside body
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random();
    points.push([cx + Math.cos(angle) * 70 * scale * dist, cy + Math.sin(angle) * 40 * scale * dist]);
  }
  return points;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const w = canvas.width, h = canvas.height;
      const scale = Math.min(w, h) / 400;
      const pts = generateLeopardPoints(w / 2, h / 2, scale);
      particles = pts.map(([px, py]) => ({
        x: px + (Math.random() - 0.5) * 200,
        y: py + (Math.random() - 0.5) * 200,
        originX: px,
        originY: py,
        vx: 0, vy: 0,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.08 + Math.random() * 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      // Breathing cycle: particles drift apart then reform
      const breathe = Math.sin(time * 0.5) * 0.5 + 0.5; // 0 to 1
      const scatter = 1 - breathe; // when breathe=1, scatter=0 (formed)

      for (const p of particles) {
        // Target position oscillates between origin and scattered
        const drift = scatter * 120;
        const targetX = p.originX + Math.sin(p.phase + time * p.speed) * drift;
        const targetY = p.originY + Math.cos(p.phase * 1.3 + time * p.speed * 0.8) * drift;

        // Smooth easing toward target
        p.x += (targetX - p.x) * 0.02;
        p.y += (targetY - p.y) * 0.02;

        // Dynamic opacity: brighter when formed
        const alpha = p.opacity * (0.5 + breathe * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
