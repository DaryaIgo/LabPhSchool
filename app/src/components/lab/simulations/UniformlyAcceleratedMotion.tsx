import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function UniformlyAcceleratedMotion({ params, isRunning, onStateChange }: Props) {
  const v0 = Number(params["v0"] || 0);
  const a = Number(params["acceleration"] || 2);
  const time = Number(params["time"] || 5);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const angleRad = Math.atan2(Math.abs(a), 9.8) * (a >= 0 ? 1 : -1);
      const rampAngle = Math.abs(angleRad) * (180 / Math.PI);

      // Inclined plane
      const rampLen = 400;
      const rampStartX = 80;
      const rampStartY = 320;
      const rampEndX = rampStartX + rampLen * Math.cos(Math.abs(angleRad));
      const rampEndY = rampStartY - rampLen * Math.sin(Math.abs(angleRad));

      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.moveTo(rampStartX, rampStartY);
      ctx.lineTo(rampEndX, rampEndY);
      ctx.lineTo(rampEndX, rampStartY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rampStartX, rampStartY);
      ctx.lineTo(rampEndX, rampEndY);
      ctx.stroke();

      // Ground
      ctx.strokeStyle = "#505a60";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rampStartX - 20, rampStartY);
      ctx.lineTo(rampEndX + 50, rampStartY);
      ctx.stroke();

      // Angle arc
      if (rampAngle > 1) {
        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          rampStartX,
          rampStartY,
          25,
          -Math.abs(angleRad),
          0
        );
        ctx.stroke();
        ctx.fillStyle = "#2eff8c";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(`α ≈ ${rampAngle.toFixed(1)}°`, rampStartX + 30, rampStartY - 8);
      }

      // Animation progress
      let currentTime = time;
      if (isRunning) {
        const animDuration = Math.max(time * 1000, 1000);
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / animDuration, 1);
        currentTime = time * progress;
      }

      // Ball on ramp
      const s = v0 * currentTime + 0.5 * a * currentTime * currentTime;
      const maxS = 100;
      const ballProgress = Math.min(s / maxS, 1);
      const ballX =
        rampStartX +
        ballProgress * rampLen * Math.cos(Math.abs(angleRad));
      const ballY =
        rampStartY -
        ballProgress * rampLen * Math.sin(Math.abs(angleRad)) -
        12;

      ctx.fillStyle = "#ff6464";
      ctx.beginPath();
      ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Velocity arrow
      const v = v0 + a * currentTime;
      if (Math.abs(v) > 0.1) {
        const arrowLen = Math.min(Math.abs(v) * 8, 60);
        const dir = v >= 0 ? 1 : -1;
        const arrowX = ballX + dir * 18;
        const arrowEndX = arrowX + dir * arrowLen;
        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arrowX, ballY);
        ctx.lineTo(arrowEndX, ballY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowEndX - dir * 6, ballY - 4);
        ctx.lineTo(arrowEndX, ballY);
        ctx.lineTo(arrowEndX - dir * 6, ballY + 4);
        ctx.stroke();
        ctx.fillStyle = "#2eff8c";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(
          `v = ${v.toFixed(1)} м/с`,
          (arrowX + arrowEndX) / 2,
          ballY - 6
        );
      }

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 80, 200, 180, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Показания:", 495, 95);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Нач. скорость: ${v0} м/с`, 495, 125);
      ctx.fillText(`Ускорение: ${a} м/с²`, 495, 150);
      ctx.fillText(`Время: ${time} с`, 495, 175);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`t = ${currentTime.toFixed(1)} с`, 495, 205);
      ctx.fillText(`Путь: s = ${s.toFixed(1)} м`, 495, 230);
      ctx.fillText(`Скорость: v = ${v.toFixed(1)} м/с`, 495, 255);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Равноускоренное движение", w / 2, 20);

      // Formulas
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("s = v₀t + at²/2          v = v₀ + at", w / 2, 45);

      if (onStateChange) {
        onStateChange({
          time: currentTime,
          s,
          v,
        });
      }
    };
  }, [v0, a, time, isRunning, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}
