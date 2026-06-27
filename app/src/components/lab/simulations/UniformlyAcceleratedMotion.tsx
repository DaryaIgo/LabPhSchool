import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function UniformlyAcceleratedMotion({
  params,
  isRunning,
  onStateChange,
}: Props) {
  const v0 = Number(params["v0"] || 0);
  const angleDeg = Number(params["angle"] || 10);
  const time = Number(params["time"] || 5);

  const angleRad = (angleDeg * Math.PI) / 180;
  const a = 9.8 * Math.sin(angleRad);

  const startTimeRef = useRef<number>(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      finishedRef.current = false;
    }
  }, [isRunning]);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      // Inclined plane — шарик скатывается сверху вниз
      const rampLen = 400;
      const rampStartX = 80;
      const rampStartY = 120;
      const rampEndX = rampStartX + rampLen * Math.cos(angleRad);
      const rampEndY = rampStartY + rampLen * Math.sin(angleRad);

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
      ctx.moveTo(rampStartX - 20, rampEndY);
      ctx.lineTo(rampEndX + 50, rampEndY);
      ctx.stroke();

      // Angle arc
      if (angleDeg > 1) {
        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rampEndX, rampEndY, 25, -Math.PI, -Math.PI + angleRad);
        ctx.stroke();
        ctx.fillStyle = "#2eff8c";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(
          `α ≈ ${angleDeg.toFixed(1)}°`,
          rampEndX + 30,
          rampEndY - 8
        );
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
      const ballX = rampStartX + ballProgress * rampLen * Math.cos(angleRad);
      const ballY =
        rampStartY + ballProgress * rampLen * Math.sin(angleRad) - 12;

      ctx.fillStyle = "#ff6464";
      ctx.beginPath();
      ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Velocity arrow along the ramp
      const v = v0 + a * currentTime;
      if (Math.abs(v) > 0.1) {
        const arrowLen = Math.min(Math.abs(v) * 8, 60);
        const dir = v >= 0 ? 1 : -1;
        const arrowStartX = ballX;
        const arrowStartY = ballY;
        const arrowEndX = arrowStartX + dir * arrowLen * Math.cos(angleRad);
        const arrowEndY = arrowStartY + dir * arrowLen * Math.sin(angleRad);

        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.stroke();

        // Arrowhead
        const headAngle = Math.atan2(
          arrowEndY - arrowStartY,
          arrowEndX - arrowStartX
        );
        ctx.beginPath();
        ctx.moveTo(
          arrowEndX - 6 * Math.cos(headAngle - 0.4),
          arrowEndY - 6 * Math.sin(headAngle - 0.4)
        );
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.lineTo(
          arrowEndX - 6 * Math.cos(headAngle + 0.4),
          arrowEndY - 6 * Math.sin(headAngle + 0.4)
        );
        ctx.stroke();

        ctx.fillStyle = "#2eff8c";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(
          `v = ${v.toFixed(1)} м/с`,
          (arrowStartX + arrowEndX) / 2,
          (arrowStartY + arrowEndY) / 2 - 6
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
      ctx.fillText(`Угол наклона: ${angleDeg}°`, 495, 150);
      ctx.fillText(`Ускорение: ${a.toFixed(2)} м/с²`, 495, 175);

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
        const state: Record<string, number> = {
          time: currentTime,
          s,
          v,
          a,
        };
        if (ballProgress >= 1 && isRunning && !finishedRef.current) {
          finishedRef.current = true;
          state.finished = 1;
        }
        onStateChange(state);
      }
    };
  }, [v0, angleDeg, angleRad, a, time, isRunning, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}
