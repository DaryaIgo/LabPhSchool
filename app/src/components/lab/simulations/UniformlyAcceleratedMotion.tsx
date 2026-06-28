import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type { SimComponentProps } from "./types";

export default function UniformlyAcceleratedMotion({
  params,
  isRunning,
  onStateChange,
}: SimComponentProps) {
  const v0 = Number(params.v0 || 0);
  const angleDeg = Number(params.angle || 10);
  const time = Number(params.time || 5);

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

      // Current animation time
      let currentTime = time;
      if (isRunning) {
        const animDuration = Math.max(time * 1000, 1000);
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / animDuration, 1);
        currentTime = time * progress;
      }

      const s = v0 * currentTime + 0.5 * a * currentTime * currentTime;
      const v = v0 + a * currentTime;

      // Visible x-range based on the whole animation path
      const finalS = v0 * time + 0.5 * a * time * time;
      const positions = [0, finalS];
      if (Math.abs(a) > 0.001) {
        const tTurn = -v0 / a;
        if (tTurn > 0 && tTurn < time) {
          positions.push(v0 * tTurn + 0.5 * a * tTurn * tTurn);
        }
      }
      const minS = Math.min(...positions);
      const maxS = Math.max(...positions);
      const range = Math.max(maxS - minS, 0.001);
      const padding = Math.max(range * 0.12, 1);
      const viewMin = minS - padding;
      const viewMax = maxS + padding;
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

      for (let x = startTick; x <= endTick; x += tickStep) {
        const px = posToX(x);
        if (px < trackLeft - 10 || px > trackRight + 10) continue;

        ctx.strokeStyle = "#96a3ab";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, trackY);
        ctx.lineTo(px, trackY + 10);
        ctx.stroke();

        const label = Math.abs(x) < tickStep / 100 ? "0" : String(roundNice(x));
        ctx.fillText(label, px, trackY + 14);

        const minorStep = tickStep / 5;
        for (let mx = x + minorStep; mx < x + tickStep; mx += minorStep) {
          const mpx = posToX(mx);
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

      // Draw car
      const carX = Math.min(Math.max(posToX(s), trackLeft), trackRight);
      const carY = trackY - 12;
      const carWidth = 44;
      const carHeight = 22;
      const wheelRadius = 5;

      // Face velocity direction
      const facingRight = v >= 0;

      // Velocity vector (drawn in world coords before car transform)
      if (Math.abs(v) > 0.05) {
        const arrowLen = Math.min(Math.abs(v) * 5 + 24, 80);
        const arrowY = carY - carHeight - 10;
        const dir = v >= 0 ? 1 : -1;
        const endX = carX + dir * arrowLen;

        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(carX, arrowY);
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

      // Acceleration indicator above track
      if (Math.abs(a) > 0.01) {
        const arrowLen = Math.min(Math.abs(a) * 6 + 16, 70);
        const arrowX = w / 2;
        const arrowY = 85;
        const dir = a >= 0 ? 1 : -1;

        ctx.strokeStyle = "#01acff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + dir * arrowLen, arrowY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(arrowX + dir * arrowLen - dir * 8, arrowY - 6);
        ctx.lineTo(arrowX + dir * arrowLen, arrowY);
        ctx.lineTo(arrowX + dir * arrowLen - dir * 8, arrowY + 6);
        ctx.stroke();

        const label = `a = ${a.toFixed(2)} м/с²`;
        ctx.font = "bold 11px sans-serif";
        const textWidth = ctx.measureText(label).width;
        const labelX = arrowX + (dir * arrowLen) / 2;
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

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Равноускоренное прямолинейное движение", w / 2, 18);

      // Formulas
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("s = v₀t + at²/2          v = v₀ + at", w / 2, 42);

      if (onStateChange) {
        const state: Record<string, number> = {
          time: currentTime,
          s,
          v,
          a,
        };
        if (currentTime >= time && isRunning && !finishedRef.current) {
          finishedRef.current = true;
          state.finished = 1;
        }
        onStateChange(state);
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
