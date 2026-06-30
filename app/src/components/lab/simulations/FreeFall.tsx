import { useMemo, useRef } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type { SimComponentProps } from "./types";

export default function FreeFall({
  params,
  isRunning,
  isFinished,
  onStateChange,
}: SimComponentProps) {
  const h0 = Number(params.h0 || 0);
  const v0 = Number(params.v0 || 0);
  const g = Number(params.g || 9.8);

  const startTimeRef = useRef<number>(0);
  const wasRunningRef = useRef(false);

  const discriminant = v0 * v0 + 2 * g * h0;
  const tHit = discriminant > 0 ? (-v0 + Math.sqrt(discriminant)) / g : 0;
  const animDuration = Math.max(tHit * 1000, 2000);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      // Reset the animation timer on the first frame after starting.
      if (isRunning && !wasRunningRef.current) {
        startTimeRef.current = Date.now();
      }
      wasRunningRef.current = isRunning ?? false;

      let currentTime = 0;
      if (isRunning) {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / animDuration, 1);
        currentTime = tHit * progress;
      } else if (isFinished) {
        // Keep the ball on the ground after the animation has finished,
        // even though the wrapper stops isRunning.
        currentTime = tHit;
      }

      const yDown = v0 * currentTime + 0.5 * g * currentTime * currentTime;
      let height = h0 - yDown;
      let v = v0 + g * currentTime;

      if (currentTime >= tHit) {
        height = 0;
        v = 0;
      }

      // Maximum height above ground (upward throw)
      const maxHeight = v0 < 0 ? h0 + (v0 * v0) / (2 * g) : h0;
      const viewMaxH = Math.max(maxHeight, 1);

      // Layout with generous padding from the title/formulas at the top
      const groundY = h - 50;
      const topY = 110;
      const scale = (groundY - topY) / viewMaxH;
      const rulerX = w / 2 - 120;
      const ballRadius = 14;
      const ballX = w / 2;
      const ballY = groundY - height * scale;

      // Draw vertical ruler/track
      ctx.strokeStyle = "#3c474f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rulerX, topY);
      ctx.lineTo(rulerX, groundY);
      ctx.stroke();

      // Draw ground
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Земля", w / 2, groundY + 8);

      // Ruler ticks
      const tickStep = chooseTickStep(viewMaxH);
      ctx.fillStyle = "#96a3ab";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      for (
        let heightVal = 0;
        heightVal <= viewMaxH + tickStep / 2;
        heightVal += tickStep
      ) {
        const py = groundY - heightVal * scale;
        if (py < topY - 10 || py > groundY + 5) continue;

        ctx.strokeStyle = "#96a3ab";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rulerX, py);
        ctx.lineTo(rulerX - 8, py);
        ctx.stroke();

        const label = String(roundNice(heightVal));
        ctx.fillText(label, rulerX - 12, py);

        const minorStep = tickStep / 5;
        for (
          let mh = heightVal + minorStep;
          mh < heightVal + tickStep;
          mh += minorStep
        ) {
          const mpy = groundY - mh * scale;
          if (mpy < topY || mpy > groundY) continue;
          ctx.strokeStyle = "#788389";
          ctx.beginPath();
          ctx.moveTo(rulerX, mpy);
          ctx.lineTo(rulerX - 4, mpy);
          ctx.stroke();
        }
      }

      // Horizontal dashed guide from ball to ruler
      if (ballY > topY && ballY < groundY) {
        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rulerX, ballY);
        ctx.lineTo(ballX + ballRadius, ballY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Velocity vector (positive = downward)
      if (Math.abs(v) > 0.05) {
        const arrowScale = Math.min(Math.abs(v) * 2 + 16, 70);
        const dir = v >= 0 ? 1 : -1;
        const startY = ballY;
        const endY = ballY + dir * arrowScale;

        ctx.strokeStyle = "#2eff8c";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(ballX + 28, startY);
        ctx.lineTo(ballX + 28, endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ballX + 28 - 7, endY - dir * 10);
        ctx.lineTo(ballX + 28, endY);
        ctx.lineTo(ballX + 28 + 7, endY - dir * 10);
        ctx.stroke();

        const label = `v = ${v.toFixed(1)} м/с`;
        ctx.font = "bold 11px sans-serif";
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = "rgba(26, 31, 34, 0.92)";
        ctx.beginPath();
        ctx.roundRect(ballX + 28 + 8, endY - 12, textWidth + 12, 22, 6);
        ctx.fill();

        ctx.fillStyle = "#2eff8c";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, ballX + 28 + 14, endY - 1);
      }

      // Acceleration vector (always downward)
      if (g > 0.01) {
        const arrowScale = Math.min(g * 3 + 12, 60);
        const startY = ballY - 28;
        const endY = startY + arrowScale;

        ctx.strokeStyle = "#01acff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(ballX - 28, startY);
        ctx.lineTo(ballX - 28, endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ballX - 28 - 6, endY - 10);
        ctx.lineTo(ballX - 28, endY);
        ctx.lineTo(ballX - 28 + 6, endY - 10);
        ctx.stroke();

        const label = `g = ${g.toFixed(2)} м/с²`;
        ctx.font = "bold 10px sans-serif";
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = "rgba(26, 31, 34, 0.92)";
        ctx.beginPath();
        ctx.roundRect(
          ballX - 28 - textWidth / 2 - 6,
          startY - 22,
          textWidth + 12,
          20,
          6
        );
        ctx.fill();

        ctx.fillStyle = "#01acff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, ballX - 28, startY - 12);
      }

      // Draw ball
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ball shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.arc(ballX - 5, ballY - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Height label near ball
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`h = ${height.toFixed(1)} м`, ballX, ballY - ballRadius - 8);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Свободное падение тел", w / 2, 16);

      // Formulas
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("h = h₀ − v₀t − gt²/2          v = v₀ + gt", w / 2, 40);

      if (onStateChange) {
        const state: Record<string, number> = {
          time: currentTime,
          h: height,
          v,
          g,
        };
        if (currentTime >= tHit && isRunning) {
          state.finished = 1;
        }
        onStateChange(state);
      }
    };
  }, [h0, v0, g, tHit, animDuration, isRunning, isFinished, onStateChange]);

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
  const rough = range / 8;
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
