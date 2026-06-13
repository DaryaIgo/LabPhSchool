import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function UniformLinearMotion({ params, isRunning, onStateChange }: Props) {
  const speed = Number(params["speed"] || 5);
  const time = Number(params["time"] || 10);
  const startX = Number(params["startX"] || 0);

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
      ctx.fillText(`Скорость: ${speed} м/с`, 495, 125);
      ctx.fillText(`Время: ${time} с`, 495, 150);
      ctx.fillText(`Нач. коорд.: ${startX} м`, 495, 175);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`t = ${currentTime.toFixed(1)} с`, 495, 205);
      ctx.fillText(`s = ${(speed * currentTime).toFixed(1)} м`, 495, 230);
      ctx.fillText(`x = ${(startX + speed * currentTime).toFixed(1)} м`, 495, 255);

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
