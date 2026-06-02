import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function DensitySimulation({ params }: Props) {
  const mass = Number(params["mass"] || 200);
  const volume = Number(params["volume"] || 50);
  const liquidDensity = Number(params["liquidDensity"] || 1000);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      // Table
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(0, 320, w, 80);
      ctx.fillStyle = "#3c474f";
      ctx.fillRect(0, 315, w, 10);

      // Cylinder
      const cx = 180;
      const cy = 200;
      const cw = 100;
      const ch = 200;

      // Liquid
      const liquidHeight = 120 + volume * 0.4;
      const liquidColor =
        liquidDensity > 1200
          ? "rgba(100,180,255,0.5)"
          : liquidDensity > 900
            ? "rgba(100,200,255,0.5)"
            : "rgba(180,220,100,0.5)";
      ctx.fillStyle = liquidColor;
      ctx.fillRect(
        cx - cw / 2 + 4,
        cy + ch / 2 - liquidHeight,
        cw - 8,
        liquidHeight
      );

      // Cylinder glass
      ctx.strokeStyle = "rgba(120,140,150,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);

      // Scale marks
      ctx.strokeStyle = "rgba(120,140,150,0.4)";
      ctx.lineWidth = 1;
      ctx.fillStyle = "#96a3ab";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      for (let i = 0; i <= 10; i++) {
        const y = cy + ch / 2 - (i * ch) / 10;
        ctx.beginPath();
        ctx.moveTo(cx - cw / 2 + 10, y);
        ctx.lineTo(cx - cw / 2 + 25, y);
        ctx.stroke();
        ctx.fillText(String(i * 20), cx - cw / 2 + 30, y);
      }

      // Body (cube)
      const bodySize = Math.min(40 + volume * 0.15, 70);
      const bodyY =
        cy + ch / 2 - liquidHeight + bodySize / 2 + 10;
      const density = mass / volume;
      const liquidD = liquidDensity / 1000;
      const bodyColor = density > liquidD ? "#c86464" : "#64c896";

      ctx.fillStyle = bodyColor;
      ctx.fillRect(
        cx - bodySize / 2,
        bodyY - bodySize / 2,
        bodySize,
        bodySize
      );

      // Body label
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${mass}г`, cx, bodyY);

      // Scale on the left
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 100, 180, 220, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Показания:", 495, 115);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Масса тела: ${mass} г`, 495, 145);
      ctx.fillText(`Объём тела: ${volume} см³`, 495, 170);
      ctx.fillText(`Плотность жидк.: ${liquidDensity} кг/м³`, 495, 195);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "14px sans-serif";
      ctx.fillText(`ρ = ${(mass / volume).toFixed(2)} г/см³`, 495, 230);
      ctx.fillText(
        `ρ = ${((mass / volume) * 1000).toFixed(0)} кг/м³`,
        495,
        255
      );

      // Arrows
      if (density > liquidD) {
        ctx.strokeStyle = "#ff6464";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, bodyY - bodySize / 2 - 30);
        ctx.lineTo(cx, bodyY - bodySize / 2 - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 5, bodyY - bodySize / 2 - 10);
        ctx.lineTo(cx, bodyY - bodySize / 2 - 5);
        ctx.lineTo(cx + 5, bodyY - bodySize / 2 - 10);
        ctx.stroke();
        ctx.fillStyle = "#ff6464";
        ctx.font = "11px sans-serif";
        ctx.fillText("Fтяж", cx + 15, bodyY - bodySize / 2 - 20);
      } else {
        ctx.strokeStyle = "#64c896";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, bodyY + bodySize / 2 + 30);
        ctx.lineTo(cx, bodyY + bodySize / 2 + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 5, bodyY + bodySize / 2 + 10);
        ctx.lineTo(cx, bodyY + bodySize / 2 + 5);
        ctx.lineTo(cx + 5, bodyY + bodySize / 2 + 10);
        ctx.stroke();
        ctx.fillStyle = "#64c896";
        ctx.font = "11px sans-serif";
        ctx.fillText("Fₐ", cx + 15, bodyY + bodySize / 2 + 20);
      }

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Измерение плотности вещества", w / 2, 20);
    };
  }, [mass, volume, liquidDensity]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
    />
  );
}
