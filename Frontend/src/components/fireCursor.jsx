
import { useEffect } from "react";

export default function FireCursor() {
  useEffect(() => {
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

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;
    let previous = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createFlame = (x, y, angle) => {
      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,

        vx: (Math.random() - 0.5) * 1.4,
        vy: -(0.7 + Math.random() * 1.8),

        angle: angle + (Math.random() - 0.5) * 1.2,
        spin: (Math.random() - 0.5) * 0.06,

        length: 20 + Math.random() * 30,
        width: 5 + Math.random() * 9,

        life: 1,
        decay: 0.018 + Math.random() * 0.025,
      });

      if (particles.length > 180) {
        particles.splice(0, particles.length - 180);
      }
    };

    const handlePointerMove = (e) => {
      const dx = previous ? e.clientX - previous.x : 0;
      const dy = previous ? e.clientY - previous.y : 0;

      const angle = Math.atan2(dy, dx);

      for (let i = 0; i < 4; i++) {
        createFlame(e.clientX, e.clientY, angle);
      }

      previous = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const drawFlame = (p) => {
      ctx.save();

      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      const length = p.length * (0.35 + p.life * 0.65);
      const flameWidth = p.width * p.life;

      const gradient = ctx.createLinearGradient(
        0, 0, 0, -length
      );

      gradient.addColorStop(
        0, `rgba(255, 245, 255, ${p.life})`
      );
      gradient.addColorStop(
        0.2, `rgba(255, 145, 245, ${p.life * 0.95})`
      );
      gradient.addColorStop(
        0.5, `rgba(220, 55, 235, ${p.life * 0.8})`
      );
      gradient.addColorStop(
        0.8, `rgba(145, 45, 220, ${p.life * 0.5})`
      );
      gradient.addColorStop(
        1, "rgba(95, 20, 170, 0)"
      );

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 16;
      ctx.shadowColor = "rgba(220, 55, 255, 0.8)";

      ctx.beginPath();

      ctx.moveTo(0, 0);

      ctx.bezierCurveTo(
        -flameWidth * 1.5,
        -length * 0.3,
        flameWidth * 1.8,
        -length * 0.65,
        0,
        -length
      );

      ctx.bezierCurveTo(
        flameWidth * 0.5,
        -length * 0.65,
        -flameWidth,
        -length * 0.3,
        0,
        0
      );

      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.99;
        p.angle += p.spin;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawFlame(p);
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
