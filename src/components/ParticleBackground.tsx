"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  originX: number; originY: number;
  size: number;
  opacity: number;
  color: string;
  phase: number;
  speed: number;
}

// Use only blue and lime — they contrast against both navy and ice backgrounds
const COLORS = ["#1A97F4", "#A1CE00", "#1A97F4", "#A1CE00", "#EBF3F7"];

function generateLeopardPoints(cx: number, cy: number, scale: number): [number, number][] {
  const points: [number, number][] = [];
  // Body ellipse — denser outline
  for (let i = 0; i < 160; i++) {
    const angle = (i / 160) * Math.PI * 2;
    const rx = 85 * scale, ry = 52 * scale;
    points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
  }  // Head circle
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    const r = 30 * scale;
    points.push([cx - 68 * scale + Math.cos(angle) * r, cy - 28 * scale + Math.sin(angle) * r]);
  }
  // Tail curve — long and curving
  for (let i = 0; i < 70; i++) {
    const t = i / 70;
    const tx = cx + 85 * scale + t * 75 * scale;
    const ty = cy + 20 * scale - Math.sin(t * Math.PI * 1.4) * 65 * scale;
    points.push([tx, ty]);
  }
  // Ears
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    points.push([cx - 82 * scale + t * 14 * scale, cy - 55 * scale - t * 22 * scale]);
    points.push([cx - 56 * scale + t * 14 * scale, cy - 55 * scale - t * 20 * scale]);
  }
  // Legs
  for (let leg = 0; leg < 4; leg++) {
    const lx = cx - 50 * scale + leg * 33 * scale;
    for (let i = 0; i < 15; i++) {
      const t = i / 15;
      points.push([lx + (Math.random() - 0.5) * 8 * scale, cy + 48 * scale + t * 35 * scale]);
    }
  }  // Spots scattered inside body — more of them
  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random();
    points.push([cx + Math.cos(angle) * 75 * scale * dist, cy + Math.sin(angle) * 45 * scale * dist]);
  }
  // Fill inside head
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random();
    points.push([cx - 68 * scale + Math.cos(angle) * 25 * scale * dist, cy - 28 * scale + Math.sin(angle) * 25 * scale * dist]);
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
        x: px + (Math.random() - 0.5) * 300,
        y: py + (Math.random() - 0.5) * 300,
        originX: px,
        originY: py,
        size: 1.5 + Math.random() * 3,
        opacity: 0.15 + Math.random() * 0.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      }));
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.004;

      // Breathing cycle: particles drift apart then slowly reform
      const breathe = Math.sin(time * 0.4) * 0.5 + 0.5;
      const scatter = 1 - breathe;

      for (const p of particles) {
        const drift = scatter * 150;
        const targetX = p.originX + Math.sin(p.phase + time * p.speed) * drift;
        const targetY = p.originY + Math.cos(p.phase * 1.3 + time * p.speed * 0.8) * drift;

        // Smooth easing
        p.x += (targetX - p.x) * 0.015;
        p.y += (targetY - p.y) * 0.015;

        // Brighter when formed, dimmer when scattered
        const alpha = p.opacity * (0.4 + breathe * 0.6);

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
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 20, opacity: 0.35 }}
    />
  );
}