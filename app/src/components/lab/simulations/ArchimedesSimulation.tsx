import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function ArchimedesSimulation({ params }: Props) {
  const bodyVolume = Number(params["bodyVolume"] || 100);
  const immersionLevel = Number(params["immersionLevel"] || 50);
  const liquidDensity = Number(params["liquidDensity"] || 1000);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const rho = liquidDensity;
      const v = bodyVolume;
      const level = immersionLevel;
      const g = 9.8;
      const fa = rho * g * (v * 1e-6) * (level / 100);

      // Tank
      const tankX = 150;
      const tankY = 120;
      const tankW = 200;
      const tankH = 240;

      // Liquid
      const liquidH = 180;
      const liquidColor =
        rho > 1200
          ? "rgba(100,180,255,0.5)"
          : rho > 900
            ? "rgba(100,200,255,0.5)"
            : "rgba(180,220,100,0.5)";
      ctx.fillStyle = liquidColor;
      ctx.fillRect(tankX + 4, tankY + tankH - liquidH, tankW - 8, liquidH);

      // Tank glass
      ctx.strokeStyle = "rgba(120,140,150,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tankX, tankY, tankW, tankH);

      // Body
      const bodySize = Math.min(40 + v * 0.2, 80);
      const submergedH = bodySize * (level / 100);
      const bodyY = tankY + tankH - liquidH + submergedH - bodySize / 2;
      const bodyX = tankX + tankW / 2;

      ctx.fillStyle = "#c86464";
      ctx.fillRect(
        bodyX - bodySize / 2,
        bodyY - bodySize / 2,
        bodySize,
        bodySize
      );

      // Submerged part highlight
      ctx.fillStyle = "rgba(100,180,255,0.3)";
      ctx.fillRect(
        bodyX - bodySize / 2,
        bodyY - bodySize / 2 + bodySize - submergedH,
        bodySize,
        submergedH
      );

      // Arrows
      ctx.strokeStyle = "#ff6464";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bodyX, bodyY - bodySize / 2 - 40);
      ctx.lineTo(bodyX, bodyY - bodySize / 2 - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bodyX - 5, bodyY - bodySize / 2 - 10);
      ctx.lineTo(bodyX, bodyY - bodySize / 2 - 5);
      ctx.lineTo(bodyX + 5, bodyY - bodySize / 2 - 10);
      ctx.stroke();
      ctx.fillStyle = "#ff6464";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("Fтяж", bodyX + 12, bodyY - bodySize / 2 - 25);

      ctx.strokeStyle = "#64c896";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bodyX, bodyY + bodySize / 2 + 40);
      ctx.lineTo(bodyX, bodyY + bodySize / 2 + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bodyX - 5, bodyY + bodySize / 2 + 10);
      ctx.lineTo(bodyX, bodyY + bodySize / 2 + 5);
      ctx.lineTo(bodyX + 5, bodyY + bodySize / 2 + 10);
      ctx.stroke();
      ctx.fillStyle = "#64c896";
      ctx.fillText("Fₐ", bodyX + 12, bodyY + bodySize / 2 + 25);

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 80, 200, 220, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Показания:", 495, 95);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Объём тела: ${v} см³`, 495, 125);
      ctx.fillText(`Погружение: ${level}%`, 495, 150);
      ctx.fillText(`ρ жидкости: ${rho} кг/м³`, 495, 175);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "14px sans-serif";
      ctx.fillText(`Fₐ = ${fa.toFixed(3)} Н`, 495, 210);
      ctx.fillText(`Vпогр = ${(v * (level / 100)).toFixed(1)} см³`, 495, 235);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Измерение архимедовой силы", w / 2, 20);
    };
  }, [bodyVolume, immersionLevel, liquidDensity]);

  return <SimulationCanvas draw={draw} width={700} height={400} />;
}
