import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function LiquidDensityMeasurementSimulation({ params }: Props) {
  const bodyVolume = Number(params["bodyVolume"] || 100);
  const weightInAir = Number(params["weightInAir"] || 2.0);
  const weightInLiquid = Number(params["weightInLiquid"] || 1.5);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const v = bodyVolume * 1e-6;
      const g = 9.8;
      const fa = weightInAir - weightInLiquid;
      const rho = fa / (g * v);

      // Dynamometer in air
      const airX = 180;
      const airY = 120;
      const bodySize = Math.min(40 + bodyVolume * 0.15, 60);

      // Hook
      ctx.strokeStyle = "#96a3ab";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(airX, airY);
      ctx.lineTo(airX, airY + 50);
      ctx.stroke();

      // Dynamometer body
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(airX - 20, airY - 50, 40, 80, 4);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", airX, airY - 20);
      ctx.font = "12px sans-serif";
      ctx.fillText(weightInAir.toFixed(2), airX, airY - 5);

      // Body in air
      ctx.fillStyle = "#c86464";
      ctx.fillRect(airX - bodySize / 2, airY + 50, bodySize, bodySize);
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px sans-serif";
      ctx.fillText("в воздухе", airX, airY + 50 + bodySize + 15);

      // Dynamometer in liquid
      const liqX = 420;
      const liqY = 120;

      // Tank
      const tankW = 140;
      const tankH = 180;
      const tankY = liqY + 50 + bodySize / 2 - 20;
      ctx.fillStyle = "rgba(100,200,255,0.4)";
      ctx.fillRect(liqX - tankW / 2 + 4, tankY, tankW - 8, tankH);
      ctx.strokeStyle = "rgba(120,140,150,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(liqX - tankW / 2, tankY, tankW, tankH);

      // Hook
      ctx.strokeStyle = "#96a3ab";
      ctx.beginPath();
      ctx.moveTo(liqX, liqY);
      ctx.lineTo(liqX, liqY + 50);
      ctx.stroke();

      // Dynamometer body
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(liqX - 20, liqY - 50, 40, 80, 4);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "10px sans-serif";
      ctx.fillText("N", liqX, liqY - 20);
      ctx.font = "12px sans-serif";
      ctx.fillText(weightInLiquid.toFixed(2), liqX, liqY - 5);

      // Body in liquid
      ctx.fillStyle = "#c86464";
      ctx.fillRect(liqX - bodySize / 2, liqY + 50, bodySize, bodySize);
      ctx.fillStyle = "rgba(100,180,255,0.3)";
      ctx.fillRect(
        liqX - bodySize / 2,
        liqY + 50 + bodySize / 2,
        bodySize,
        bodySize / 2
      );
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px sans-serif";
      ctx.fillText("в жидкости", liqX, liqY + 50 + bodySize + 15);

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(120, 360, 460, 70, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Измерения:", 140, 375);
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Pвоздухе = ${weightInAir.toFixed(2)} Н`, 140, 400);
      ctx.fillText(`Pжидкости = ${weightInLiquid.toFixed(2)} Н`, 300, 400);
      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`Fₐ = ${fa.toFixed(3)} Н`, 140, 420);
      ctx.fillText(`ρжидкости = ${rho.toFixed(0)} кг/м³`, 300, 420);

      // Formula
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(20, 80, 220, 100, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Формула", 130, 100);
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("Fₐ = Pвоздухе − Pжидкости", 130, 125);
      ctx.fillText("ρж = Fₐ / (g·V)", 130, 150);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Определение плотности жидкости", w / 2, 20);
    };
  }, [bodyVolume, weightInAir, weightInLiquid]);

  return <SimulationCanvas draw={draw} width={700} height={460} />;
}
