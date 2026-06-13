import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function CircularMotion({ params, isRunning }: Props) {
  const radius = Number(params["radius"] || 0.5);
  const period = Number(params["period"] || 1);
  const mass = Number(params["mass"] || 0.2);

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

      const omega = (2 * Math.PI) / period;
      const v = (2 * Math.PI * radius) / period;
      const a = (v * v) / radius;
      const F = mass * a;

      const cx = 280;
      const cy = 220;
      const rPx = Math.min(radius * 120, 180);

      // Orbit
      ctx.strokeStyle = "#505a60";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
      ctx.stroke();

      // Cross lines
      ctx.strokeStyle = "rgba(80,90,96,0.5)";
      ctx.beginPath();
      ctx.moveTo(cx - rPx, cy);
      ctx.lineTo(cx + rPx, cy);
      ctx.moveTo(cx, cy - rPx);
      ctx.lineTo(cx, cy + rPx);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Rotating body
      let angle = 0;
      if (isRunning) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        angle = omega * elapsed;
      }
      const bx = cx + rPx * Math.cos(angle);
      const by = cy + rPx * Math.sin(angle);

      // String
      ctx.strokeStyle = "rgba(180,190,200,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 60);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Body
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.arc(bx, by, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1f22";
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vector (tangent)
      const vx = -Math.sin(angle);
      const vy = Math.cos(angle);
      const vLen = Math.min(v * 15, 60);
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + vx * vLen, by + vy * vLen);
      ctx.stroke();
      ctx.fillStyle = "#00aaff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("v", bx + vx * vLen + 5, by + vy * vLen);

      // Acceleration vector (centripetal)
      const aLen = Math.min(a * 8, 60);
      const ax = -Math.cos(angle);
      const ay = -Math.sin(angle);
      ctx.strokeStyle = "#ff6464";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + ax * aLen, by + ay * aLen);
      ctx.stroke();
      ctx.fillStyle = "#ff6464";
      ctx.fillText("a", bx + ax * aLen - 15, by + ay * aLen);

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 60, 200, 260, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Расчёты:", 495, 75);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Радиус: ${radius.toFixed(2)} м`, 495, 105);
      ctx.fillText(`Период: ${period.toFixed(2)} с`, 495, 130);
      ctx.fillText(`Масса: ${mass.toFixed(2)} кг`, 495, 155);

      ctx.fillStyle = "#00aaff";
      ctx.fillText(`ω = ${omega.toFixed(2)} рад/с`, 495, 185);
      ctx.fillText(`v = ${v.toFixed(2)} м/с`, 495, 210);

      ctx.fillStyle = "#ff6464";
      ctx.fillText(`a = ${a.toFixed(2)} м/с²`, 495, 240);
      ctx.fillText(`F = ${F.toFixed(2)} Н`, 495, 270);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Движение по окружности", w / 2, 20);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("a = v²/R = ω²R          F = ma", w / 2, 45);
    };
  }, [radius, period, mass, isRunning]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}
