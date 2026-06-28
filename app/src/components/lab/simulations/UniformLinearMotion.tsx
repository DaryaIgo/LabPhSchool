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
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Track
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(0, 280, w, 120);
      ctx.fillStyle = "#3c474f";
      ctx.fillRect(0, 275, w, 10);

      // Scale marks on track
      ctx.fillStyle = "#96a3ab";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let i = 0; i <= 14; i++) {
        const x = 50 + i * 45;
        ctx.strokeStyle = "#788389";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 275);
        ctx.lineTo(x, 290);
        ctx.stroke();
        ctx.fillText(String(i * 5), x, 295);
      }

      // Animation progress
      let currentTime = time;
      if (isRunning) {
        const animDuration = Math.max(time * 1000, 1000);
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / animDuration, 1);
        currentTime = time * progress;
      }

      // Moving body
      const pxPerMeter = 45 / 5;
      const bodyX = 50 + (startX + speed * currentTime) * pxPerMeter;
      const bodyY = 250;
      const bodySize = 30;
      const clampedX = Math.min(Math.max(bodyX, 50), 680);

      // Body
      ctx.fillStyle = "#2eff8c";
      ctx.fillRect(
        clampedX - bodySize / 2,
        bodyY - bodySize / 2,
        bodySize,
        bodySize
      );

      // Wheel indicators
      ctx.fillStyle = "#1a1f22";
      ctx.beginPath();
      ctx.arc(clampedX - 8, bodyY + bodySize / 2 - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(clampedX + 8, bodyY + bodySize / 2 - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Arrow indicating direction
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(clampedX + 25, bodyY);
      ctx.lineTo(clampedX + 45, bodyY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(clampedX + 40, bodyY - 5);
      ctx.lineTo(clampedX + 45, bodyY);
      ctx.lineTo(clampedX + 40, bodyY + 5);
      ctx.stroke();

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Равномерное прямолинейное движение", w / 2, 20);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText("s = v · t        x = x₀ + v · t", w / 2, 45);

      if (onStateChange) {
        onStateChange({
          time: currentTime,
          s: speed * currentTime,
          x: startX + speed * currentTime,
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
