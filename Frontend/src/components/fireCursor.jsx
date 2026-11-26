
import { useEffect } from "react";

export default function FireCursor() {
  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const canvas = document.getElementById("fire-cursor");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const particles = [];

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.radius *= 0.97;
        p.life -= p.decay;

        if (p.life <= 0 || p.radius < 0.5) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;

        // Soft pink-purple flame
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius
        );

        gradient.addColorStop(0, "#fff0ff");
        gradient.addColorStop(0.25, "#ff9aef");
        gradient.addColorStop(0.6, "#d946ef");
        gradient.addColorStop(1, "rgba(124, 58, 237, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        animationId = null;
      }
    };

    const handlePointerMove = (e) => {
      // Only 3 particles per movement
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 5,
          y: e.clientY + (Math.random() - 0.5) * 5,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(0.8 + Math.random() * 1.3),
          radius: 7 + Math.random() * 7,
          life: 1,
          decay: 0.035 + Math.random() * 0.02,
        });
      }

      // Hard limit for performance
      if (particles.length > 100) {
        particles.splice(0, particles.length - 100);
      }

      // Start animation only when needed
      if (!animationId) {
        animationId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);

    resize();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);

      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      id="fire-cursor"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
