import { useMemo, useState } from "react";

interface Star {
  dx: number;
  dy: number;
  collapsedDx: number;
  collapsedDy: number;
  r: number;
  hue: number;
  delay: number;
  duration: number;
  baseOpacity: number;
  layer: "inner" | "outer";
}

function generateNebula(count: number, size: number): Star[] {
  const stars: Star[] = [];
  const maxR = size * 0.75;

  // Core — close to center, collapses gently
  for (let i = 0; i < count * 0.18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * maxR * 0.5;
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    stars.push({
      dx,
      dy,
      collapsedDx: dx * 0.75,
      collapsedDy: dy * 0.75,
      r: 1.8 + Math.random() * 1.8,
      hue: 280 + Math.random() * 50,
      delay: Math.random() * -4,
      duration: 1 + Math.random() * 1.2,
      baseOpacity: 0.6 + Math.random() * 0.35,
      layer: "inner",
    });
  }

  // Mid shell
  for (let i = 0; i < count * 0.32; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = maxR * (0.45 + Math.sqrt(Math.random()) * 0.4);
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    stars.push({
      dx,
      dy,
      collapsedDx: dx * 0.65,
      collapsedDy: dy * 0.65,
      r: 1.4 + Math.random() * 1.5,
      hue: 190 + Math.random() * 120,
      delay: Math.random() * -5,
      duration: 1.2 + Math.random() * 1.8,
      baseOpacity: 0.35 + Math.random() * 0.35,
      layer: "inner",
    });
  }

  // Outer wispy cloud — widely scattered
  for (let i = 0; i < count * 0.5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = maxR * (0.82 + Math.random() * 0.18);
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    const distanceRatio = Math.hypot(dx, dy) / maxR;
    stars.push({
      dx,
      dy,
      collapsedDx: dx * 0.6,
      collapsedDy: dy * 0.6,
      r: 1.1 + Math.random() * 1.3,
      hue: 160 + Math.random() * 160,
      delay: Math.random() * -6,
      duration: 1.5 + Math.random() * 2.2,
      baseOpacity: Math.max(0.18, 0.58 - distanceRatio * 0.35),
      layer: "outer",
    });
  }

  return stars;
}

export default function NebulaLogo() {
  const size = 100;
  const count = 140;
  const cx = size / 2;
  const cy = size / 2;
  const [hovered, setHovered] = useState(false);
  const stars = useMemo(() => generateNebula(count, size), [count, size]);

  const inner = stars.filter(s => s.layer === "inner");
  const outer = stars.filter(s => s.layer === "outer");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-9 w-auto overflow-visible"
      aria-label="Nebulus — на главную"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <defs>
        <radialGradient id="nebulaCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e879f9" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#6366f1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <filter id="nebulaGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background gas cloud */}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.68}
        fill="url(#nebulaCore)"
        className="origin-center opacity-50 transition-all duration-700 ease-out group-hover:opacity-90 group-hover:scale-90"
        style={{ transformOrigin: "center" }}
      />

      {/* Outer rotating shell */}
      <g className="origin-center animate-nebulaSpin-slow group-hover:animate-nebulaSpin-fast">
        {outer.map((star, i) => (
          <circle
            key={`o-${i}`}
            cx={cx}
            cy={cy}
            r={star.r}
            fill={`hsl(${star.hue} 92% 76%)`}
            opacity={star.baseOpacity}
            className="transition-opacity duration-500 ease-out group-hover:animate-nebulaTwinkle group-hover:opacity-100"
            style={{
              transform: `translate(${
                hovered ? star.collapsedDx : star.dx
              }px, ${hovered ? star.collapsedDy : star.dy}px)`,
              transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </g>

      {/* Inner core — counter-rotates */}
      <g className="origin-center animate-nebulaSpin-reverse-slow group-hover:animate-nebulaSpin-reverse-fast">
        {inner.map((star, i) => (
          <circle
            key={`i-${i}`}
            cx={cx}
            cy={cy}
            r={star.r}
            fill={`hsl(${star.hue} 95% 80%)`}
            opacity={star.baseOpacity}
            className="transition-opacity duration-500 ease-out group-hover:animate-nebulaTwinkle group-hover:opacity-100"
            style={{
              transform: `translate(${
                hovered ? star.collapsedDx : star.dx
              }px, ${hovered ? star.collapsedDy : star.dy}px)`,
              transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </g>

      {/* Hover accent ring */}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.42}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="0.5"
        opacity="0"
        className="origin-center transition-all duration-700 ease-out group-hover:opacity-40 group-hover:scale-95"
        style={{ transformOrigin: "center" }}
        filter="url(#nebulaGlow)"
      />
    </svg>
  );
}
