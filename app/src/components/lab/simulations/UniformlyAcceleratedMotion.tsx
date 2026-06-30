import { useMemo, useRef } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type { SimComponentProps } from "./types";

export default function UniformlyAcceleratedMotion({
  params,
  isRunning,
  isFinished,
  onStateChange,
}: SimComponentProps) {
  const v0 = Number(params.v0 || 0);
  const angleDeg = Number(params.angle || 10);
  const time = Number(params.time || 5);
  const startX = Number(params.startX || 0);

  const angleRad = (angleDeg * Math.PI) / 180;
  const a = 9.8 * Math.sin(angleRad);

  const startTimeRef = useRef<number>(0);
  const wasRunningRef = useRef(false);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      // Current animation time: when not running the object stays at the
      // start position (x0).
      // Reset the animation timer on the first frame after starting.
      if (isRunning && !wasRunningRef.current) {
        startTimeRef.current = Date.now();
      }
      wasRunningRef.current = isRunning ?? false;

      let currentTime = 0;
      if (isRunning) {
        const animDuration = Math.max(time * 1000, 1000);
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / animDuration, 1);
        currentTime = time * progress;
      } else if (isFinished) {
        currentTime = time;
      }

      const displacement =
        v0 * currentTime + 0.5 * a * currentTime * currentTime;
      const x = startX + displacement;
      const v = v0 + a * currentTime;

      // Full animation path to compute the visible range
      const finalDisplacement = v0 * time + 0.5 * a * time * time;
      const finalX = startX + finalDisplacement;
      const positions = [startX, finalX];
      if (Math.abs(a) > 0.001) {
        const tTurn = -v0 / a;
        if (tTurn > 0 && tTurn < time) {
          positions.push(startX + v0 * tTurn + 0.5 * a * tTurn * tTurn);
        }
      }

      // Visible x-range: at least ±25 m around the start position, expanded
      // further if the full animation path goes beyond that.
      const minPathX = Math.min(...positions);
      const maxPathX = Math.max(...positions);
      const minViewX = Math.min(startX - 25, minPathX);
      const maxViewX = Math.max(startX + 25, maxPathX);
      const range = Math.max(maxViewX - minViewX, 0.001);
      const padding = Math.max(range * 0.08, 1);
      const viewMin = minViewX - padding;
      const viewMax = maxViewX + padding;
      const viewRange = viewMax - viewMin;

      // Track geometry. The track is drawn rotated by angleRad so that the
      // inclined plane is visualised correctly. We shrink the track width if
      // necessary so that the rotated track still fits inside the canvas.
      const trackCenterY = 270;
      const trackHeight = 70;
      const marginX = 50;
      const maxVertical = h - 160;
      const sinAbs = Math.abs(Math.sin(angleRad));
      const trackWidth =
        sinAbs > 0.01
          ? Math.min(w - 2 * marginX, maxVertical / sinAbs)
          : w - 2 * marginX;
      const centerX = w / 2;
      const scale = trackWidth / viewRange;
      const posToLocalX = (pos: number) =>
        (pos - viewMin) * scale - trackWidth / 2;

      // Switch to local track coordinates: origin at the track centre,
      // X-axis pointing along the inclined plane.
      ctx.save();
      ctx.translate(centerX, trackCenterY);
      ctx.rotate(angleRad);

      // Draw track
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(-trackWidth / 2, 0, trackWidth, trackHeight);

      ctx.strokeStyle = "#3c474f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-trackWidth / 2, 0);
      ctx.lineTo(trackWidth / 2, 0);
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
        const px = posToLocalX(t);
        if (px < -trackWidth / 2 - 10 || px > trackWidth / 2 + 10) continue;

        ctx.strokeStyle = "#96a3ab";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, 10);
        ctx.stroke();

        const label = Math.abs(t) < tickStep / 100 ? "0" : String(roundNice(t));
        ctx.fillText(label, px, 14);

        const minorStep = tickStep / 5;
        for (let mx = t + minorStep; mx < t + tickStep; mx += minorStep) {
          const mpx = posToLocalX(mx);
          if (mpx < -trackWidth / 2 || mpx > trackWidth / 2) continue;
          ctx.strokeStyle = "#788389";
          ctx.beginPath();
          ctx.moveTo(mpx, 0);
          ctx.lineTo(mpx, 5);
          ctx.stroke();
        }
      }

      // Zero line
      const zeroLocalX = posToLocalX(0);
      if (
        zeroLocalX >= -trackWidth / 2 - 1 &&
        zeroLocalX <= trackWidth / 2 + 1
      ) {
        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(zeroLocalX, -25);
        ctx.lineTo(zeroLocalX, trackHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#2eff8c";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("x = 0", zeroLocalX, -36);
      }

      // Draw car (in local track coordinates)
      const carLocalX = Math.min(
        Math.max(posToLocalX(x), -trackWidth / 2),
        trackWidth / 2
      );
      const carY = -12;
      const carWidth = 44;
      const carHeight = 22;
      const wheelRadius = 5;

      // Face velocity direction
      const facingRight = v >= 0;

      // Velocity vector (in local track coords, so it follows the plane)
      if (Math.abs(v) > 0.05) {
        const arrowLen = Math.min(Math.abs(v) * 5 + 24, 80);
        const arrowY = carY - carHeight - 10;
        const dir = v >= 0 ? 1 : -1;
        const endX = carLocalX + dir * arrowLen;

        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(carLocalX, arrowY);
        ctx.lineTo(endX, arrowY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX - dir * 10, arrowY - 7);
        ctx.lineTo(endX, arrowY);
        ctx.lineTo(endX - dir * 10, arrowY + 7);
        ctx.stroke();

        const label = `v = ${v.toFixed(1)} м/с`;
        ctx.font = "bold 12px sans-serif";
        const textWidth = ctx.measureText(label).width;
        const labelX = carLocalX + (dir * arrowLen) / 2;
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
      ctx.translate(carLocalX, carY);
      if (!facingRight) {
        ctx.scale(-1, 1);
      }

      // Body
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.roundRect(-carWidth / 2, -carHeight, carWidth, carHeight, 5);
      ctx.fill();

      // Cabin
      ctx.fillStyle = "#25cc70";
      ctx.beginPath();
      ctx.roundRect(-carWidth / 2 + 5, -carHeight - 9, carWidth - 16, 9, 3);
      ctx.fill();

      // Wheels
      ctx.fillStyle = "#1a1f22";
      ctx.beginPath();
      ctx.arc(-carWidth / 2 + 11, -1, wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(carWidth / 2 - 11, -1, wheelRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Acceleration indicator above track (in local track coords)
      if (Math.abs(a) > 0.01) {
        const arrowLen = Math.min(Math.abs(a) * 6 + 16, 70);
        const arrowLocalX = 0;
        const arrowY = -55;
        const dir = a >= 0 ? 1 : -1;

        ctx.strokeStyle = "#01acff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(arrowLocalX, arrowY);
        ctx.lineTo(arrowLocalX + dir * arrowLen, arrowY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(arrowLocalX + dir * arrowLen - dir * 8, arrowY - 6);
        ctx.lineTo(arrowLocalX + dir * arrowLen, arrowY);
        ctx.lineTo(arrowLocalX + dir * arrowLen - dir * 8, arrowY + 6);
        ctx.stroke();

        const label = `a = ${a.toFixed(2)} м/с²`;
        ctx.font = "bold 11px sans-serif";
        const textWidth = ctx.measureText(label).width;
        const labelX = arrowLocalX + (dir * arrowLen) / 2;
        const labelY = arrowY - 14;

        ctx.fillStyle = "rgba(26, 31, 34, 0.92)";
        ctx.beginPath();
        ctx.roundRect(
          labelX - textWidth / 2 - 6,
          labelY - 12,
          textWidth + 12,
          22,
          6
        );
        ctx.fill();

        ctx.fillStyle = "#01acff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, labelX, labelY - 0);
      }

      ctx.restore(); // back to world coordinates

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Равноускоренное прямолинейное движение", w / 2, 18);

      // Formulas
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("x = x₀ + v₀t + at²/2          v = v₀ + at", w / 2, 42);

      if (onStateChange) {
        const state: Record<string, number> = {
          time: currentTime,
          x,
          v,
          a,
        };
        if (currentTime >= time && isRunning) {
          state.finished = 1;
        }
        onStateChange(state);
      }
    };
  }, [v0, a, angleRad, time, startX, isRunning, isFinished, onStateChange]);

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
