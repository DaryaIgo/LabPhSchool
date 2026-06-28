import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type { SimComponentProps } from "./types";

export default function UniformLinearMotion({
  params,
  isRunning,
  onStateChange,
}: SimComponentProps) {
  const speed = Number(params.speed || 5);
  const time = Number(params.time || 10);
  const startX = Number(params.startX || 0);

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

      // Current animation time: when not running the car stays at the start
      // position (x0), so the user can tune parameters without the car jumping
      // to the end of the path.
      let currentTime = 0;
      if (isRunning) {
        const animDuration = Math.max(time * 1000, 1000);
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / animDuration, 1);
        currentTime = time * progress;
      }

      const s = speed * currentTime;
      const x = startX + s;
      const finalX = startX + speed * time;

      // Visible x-range: at least ±25 m around the start position, expanded
      // further if the full animation path goes beyond that.
      const minPathX = Math.min(startX, finalX);
      const maxPathX = Math.max(startX, finalX);
      const minViewX = Math.min(startX - 25, minPathX);
      const maxViewX = Math.max(startX + 25, maxPathX);
      const range = Math.max(maxViewX - minViewX, 0.001);
      const padding = Math.max(range * 0.08, 1);
      const viewMin = minViewX - padding;
      const viewMax = maxViewX + padding;
      const viewRange = viewMax - viewMin;

      // Track geometry
      const trackY = 270;
      const trackHeight = 70;
      const marginX = 50;
      const trackLeft = marginX;
      const trackRight = w - marginX;
      const trackWidth = trackRight - trackLeft;
      const scale = trackWidth / viewRange;
      const posToX = (pos: number) => trackLeft + (pos - viewMin) * scale;

      // Draw track
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(trackLeft, trackY, trackWidth, trackHeight);

      ctx.strokeStyle = "#3c474f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trackLeft, trackY);
      ctx.lineTo(trackRight, trackY);
      ctx.stroke();

      // Draw ruler ticks
      const tickStep = chooseTickStep(viewRange);
      const startTick = Math.floor(viewMin / tickStep) * tickStep;
      const endTick = Math.ceil(viewMax / tickStep) * tickStep;

      ctx.fillStyle = "#96a3ab";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (let t = startTick; t <= endTick; t += tickStep) {
        const px = posToX(t);
        if (px < trackLeft - 10 || px > trackRight + 10) continue;

        ctx.strokeStyle = "#96a3ab";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, trackY);
        ctx.lineTo(px, trackY + 10);
        ctx.stroke();

        const label = Math.abs(t) < tickStep / 100 ? "0" : String(roundNice(t));
        ctx.fillText(label, px, trackY + 14);

        const minorStep = tickStep / 5;
        for (let mt = t + minorStep; mt < t + tickStep; mt += minorStep) {
          const mpx = posToX(mt);
          if (mpx < trackLeft || mpx > trackRight) continue;
          ctx.strokeStyle = "#788389";
          ctx.beginPath();
          ctx.moveTo(mpx, trackY);
          ctx.lineTo(mpx, trackY + 5);
          ctx.stroke();
        }
      }

      // Zero line
      const zeroX = posToX(0);
      if (zeroX >= trackLeft - 1 && zeroX <= trackRight + 1) {
        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(zeroX, trackY - 25);
        ctx.lineTo(zeroX, trackY + trackHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#2eff8c";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("x = 0", zeroX, trackY - 36);
      }

      // Draw small car
      const carX = Math.min(Math.max(posToX(x), trackLeft), trackRight);
      const carY = trackY - 10;
      const carWidth = 28;
      const carHeight = 14;
      const wheelRadius = 3.5;
      const facingRight = speed >= 0;

      // Velocity vector (drawn in world coords before car transform)
      if (Math.abs(speed) > 0.05) {
        const arrowLen = Math.min(Math.abs(speed) * 6 + 24, 80);
        const arrowY = carY - carHeight - 8;
        const dir = speed >= 0 ? 1 : -1;
        const endX = carX + dir * arrowLen;

        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Shaft
        ctx.beginPath();
        ctx.moveTo(carX, arrowY);
        ctx.lineTo(endX, arrowY);
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.moveTo(endX - dir * 10, arrowY - 7);
        ctx.lineTo(endX, arrowY);
        ctx.lineTo(endX - dir * 10, arrowY + 7);
        ctx.stroke();

        // Label with background
        const label = `v = ${speed.toFixed(1)} м/с`;
        ctx.font = "bold 12px sans-serif";
        const textWidth = ctx.measureText(label).width;
        const labelX = carX + (dir * arrowLen) / 2;
        const labelY = arrowY - 16;

        ctx.fillStyle = "rgba(26, 31, 34, 0.92)";
        ctx.beginPath();
        ctx.roundRect(
          labelX - textWidth / 2 - 6,
          labelY - 13,
          textWidth + 12,
          22,
          6
        );
        ctx.fill();

        ctx.fillStyle = "#2eff8c";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, labelX, labelY - 1);
      }

      ctx.save();
      ctx.translate(carX, carY);
      if (!facingRight) {
        ctx.scale(-1, 1);
      }

      // Body
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.roundRect(-carWidth / 2, -carHeight, carWidth, carHeight, 4);
      ctx.fill();

      // Cabin
      ctx.fillStyle = "#25cc70";
      ctx.beginPath();
      ctx.roundRect(-carWidth / 2 + 3, -carHeight - 6, carWidth - 10, 6, 2);
      ctx.fill();

      // Wheels
      ctx.fillStyle = "#1a1f22";
      ctx.beginPath();
      ctx.arc(-carWidth / 2 + 7, -1, wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(carWidth / 2 - 7, -1, wheelRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Равномерное прямолинейное движение", w / 2, 18);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("s = v · t        x = x₀ + v · t", w / 2, 42);

      if (onStateChange) {
        onStateChange({
          time: currentTime,
          s,
          x,
          v: speed,
        });
      }
    };
  }, [speed, time, startX, isRunning, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}

function chooseTickStep(range: number): number {
  if (range <= 0) return 1;
  const rough = range / 10;
  const exp = Math.floor(Math.log10(rough));
  const frac = rough / 10 ** exp;
  if (frac < 1.5) return 10 ** exp;
  if (frac < 3.5) return 2 * 10 ** exp;
  if (frac < 7.5) return 5 * 10 ** exp;
  return 10 ** (exp + 1);
}

function roundNice(value: number): number {
  return Math.round(value * 100) / 100;
}
