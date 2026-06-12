import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function InterferenceDiffractionSimulation({
  params,
  onStateChange,
}: Props) {
  const slitDistance = Number(params["slitDistance"] || 0.5);
  const screenDistance = Number(params["screenDistance"] || 1.0);
  const fringeSpacing = Number(params["fringeSpacing"] || 1.0);

  const draw = useMemo(() => {
    const lambda = (slitDistance * fringeSpacing) / screenDistance;

    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const slitX = 140;
      const screenX = w - 100;
      const centerY = h / 2;
      const scaleY = 18;

      // Slits
      ctx.fillStyle = "#5c6b73";
      ctx.fillRect(slitX - 4, centerY - 50, 8, 35);
      ctx.fillRect(slitX - 4, centerY + 15, 8, 35);
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(slitX - 5, centerY - 16, 10, 32);

      // Slit labels
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("щели", slitX, centerY - 55);

      // Distance between slits
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(slitX - 25, centerY - 16);
      ctx.lineTo(slitX - 25, centerY + 16);
      ctx.stroke();
      ctx.fillStyle = "#ffc832";
      ctx.fillText(`d=${slitDistance}мм`, slitX - 35, centerY);

      // Interference pattern on screen
      const patternWidth = 360;
      const patternX = screenX - patternWidth / 2;

      for (let i = 0; i < patternWidth; i++) {
        const yScreen = (i - patternWidth / 2) / scaleY;
        const delta = (slitDistance * yScreen) / screenDistance;
        const phase = (Math.PI * delta) / (lambda / 1000);
        const intensity = Math.cos(phase) ** 2;
        const brightness = Math.floor(255 * intensity);
        const color = `rgb(${brightness}, ${255}, ${brightness + 20})`;
        ctx.fillStyle = color;
        ctx.fillRect(patternX + i, centerY - 80, 1, 160);
      }

      // Bright fringe markers
      ctx.fillStyle = "#2eff8c";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let k = -3; k <= 3; k++) {
        const y = centerY - k * fringeSpacing * scaleY;
        if (y < centerY - 90 || y > centerY + 90) continue;
        ctx.beginPath();
        ctx.arc(screenX, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`k=${k}`, screenX + 20, y - 5);
      }

      // Screen frame
      ctx.strokeStyle = "#37474f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screenX, centerY - 100);
      ctx.lineTo(screenX, centerY + 100);
      ctx.stroke();

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(40, 30, 280, 140, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Интерференция на двух щелях", 55, 45);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`d = ${slitDistance.toFixed(1)} мм`, 55, 75);
      ctx.fillText(`L = ${screenDistance.toFixed(1)} м`, 55, 95);
      ctx.fillText(`Δx = ${fringeSpacing.toFixed(1)} мм`, 55, 115);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`λ = ${lambda.toFixed(1)} нм`, 55, 135);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Интерференция и дифракция света", w / 2, 16);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText("Δx = λL/d", w / 2, 42);

      if (onStateChange) {
        onStateChange({
          d: slitDistance,
          L: screenDistance,
          fringeSpacing,
          lambda,
        });
      }
    };
  }, [slitDistance, screenDistance, fringeSpacing, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
  );
}
