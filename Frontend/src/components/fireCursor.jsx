
import { useEffect } from "react";

export default function FireCursor() {
  useEffect(() => {
    // Avoid the effect on touch devices and reduced-motion settings
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = document.getElementById("fire-cursor");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    let animationId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (e) => {
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 9,
          y: e.clientY + (Math.random() - 0.5) * 9,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(0.7 + Math.random() * 2.1),
          radius: 5 + Math.random() * 8,
          life: 1,
          decay: 0.02 + Math.random() * 0.025,
        });
      }

      if (particles.length > 220) {
        particles.splice(0, particles.length - 220);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.radius *= 0.975;
        p.life -= p.decay;

        if (p.life <= 0 || p.radius < 0.5) {
          particles.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 2
        );

        gradient.addColorStop(
          0, `rgba(255, 235, 255, ${p.life})`
        );
        gradient.addColorStop(
          0.25, `rgba(255, 125, 235, ${p.life * 0.9})`
        );
        gradient.addColorStop(
          0.6, `rgba(197, 55, 255, ${p.life * 0.5})`
        );
        gradient.addColorStop(1, "rgba(90, 20, 180, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);

    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationId);
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
