import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function ProjectileMotion({ params, isRunning, onStateChange }: Props) {
  const v0 = Number(params["v0"] || 20);
  const angleDeg = Number(params["angle"] || 45);
  const g = Number(params["g"] || 9.8);

  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const alpha = (angleDeg * Math.PI) / 180;
      const vx = v0 * Math.cos(alpha);
      const vy = v0 * Math.sin(alpha);
      const T = (2 * vy) / g;
      const L = (v0 * v0 * Math.sin(2 * alpha)) / g;
      const H = (vy * vy) / (2 * g);

      const scale = Math.min(600 / Math.max(L, 1), 300 / Math.max(H, 1), 80);
      const groundY = 360;
      const originX = 60;

      // Ground
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(0, groundY, w, 40);
      ctx.fillStyle = "#3c474f";
      ctx.fillRect(0, groundY, w, 4);

      // Scale marks
      ctx.strokeStyle = "rgba(120,140,150,0.5)";
      ctx.lineWidth = 1;
      ctx.fillStyle = "#96a3ab";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let i = 0; i <= 10; i++) {
        const x = originX + i * 60;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, groundY + 8);
        ctx.stroke();
        ctx.fillText(String(i * 10), x, groundY + 10);
      }

      // Trajectory
      ctx.strokeStyle = "rgba(46,255,140,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const trajSteps = 80;
      for (let i = 0; i <= trajSteps; i++) {
        const t = (i / trajSteps) * T;
        const x = originX + vx * t * scale;
        const y = groundY - (vy * t - 0.5 * g * t * t) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Animation progress
      let animT = T;
      if (isRunning) {
        const animDuration = Math.max(T * 1000, 1000);
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / animDuration, 1);
        animT = T * progress;
      }
      const ballX = originX + vx * animT * scale;
      const ballY = groundY - (vy * animT - 0.5 * g * animT * animT) * scale;

      // Launch point
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(originX, groundY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Landing point
      const landingX = originX + L * scale;
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.arc(landingX, groundY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Max height point
      const maxHeightX = originX + (L / 2) * scale;
      const maxHeightY = groundY - H * scale;
      ctx.fillStyle = "#00aaff";
      ctx.beginPath();
      ctx.arc(maxHeightX, maxHeightY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Dashed lines
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(maxHeightX, maxHeightY);
      ctx.lineTo(maxHeightX, groundY);
      ctx.moveTo(originX, maxHeightY);
      ctx.lineTo(maxHeightX, maxHeightY);
      ctx.moveTo(originX, groundY);
      ctx.lineTo(landingX, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = "#96a3ab";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`L = ${L.toFixed(1)} м`, (originX + landingX) / 2, groundY + 22);
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`H = ${H.toFixed(1)} м`, maxHeightX + 8, maxHeightY);

      // Animated ball
      ctx.fillStyle = "#ffc832";
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vector at launch
      const arrowLen = Math.min(v0 * 2.5, 80);
      const arrowEndX = originX + Math.cos(alpha) * arrowLen;
      const arrowEndY = groundY - Math.sin(alpha) * arrowLen;
      ctx.strokeStyle = "#ffc832";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX, groundY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.stroke();
      const ax = -Math.cos(alpha);
      const ay = Math.sin(alpha);
      ctx.beginPath();
      ctx.moveTo(arrowEndX + ax * 8 - ay * 4, arrowEndY - ay * 8 - ax * 4);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.lineTo(arrowEndX + ax * 8 + ay * 4, arrowEndY - ay * 8 + ax * 4);
      ctx.stroke();
      ctx.fillStyle = "#ffc832";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(`v₀ = ${v0} м/с`, arrowEndX + 5, arrowEndY);

      // Angle arc
      ctx.strokeStyle = "rgba(255,200,50,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(originX, groundY, 25, -alpha, 0);
      ctx.stroke();
      ctx.fillStyle = "#ffc832";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(`α = ${angleDeg}°`, originX + 28, groundY - 8);

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 60, 200, 260, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Характеристики:", 495, 75);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Нач. скорость: ${v0} м/с`, 495, 105);
      ctx.fillText(`Угол: ${angleDeg}°`, 495, 130);
      ctx.fillText(`g = ${g} м/с²`, 495, 155);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`Дальность L = ${L.toFixed(1)} м`, 495, 185);
      ctx.fillStyle = "#00aaff";
      ctx.fillText(`Высота H = ${H.toFixed(1)} м`, 495, 210);
      ctx.fillStyle = "#ffc832";
      ctx.fillText(`Время T = ${T.toFixed(2)} с`, 495, 235);
      ctx.font = "11px sans-serif";
      ctx.fillText(`L = v₀²·sin(2α)/g`, 495, 260);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Бросок тела под углом", w / 2, 20);

      if (onStateChange) {
        onStateChange({
          t: animT,
          x: vx * animT,
          y: vy * animT - 0.5 * g * animT * animT,
        });
      }
    };
  }, [v0, angleDeg, g, isRunning, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}
