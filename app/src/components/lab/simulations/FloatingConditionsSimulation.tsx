import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function FloatingConditionsSimulation({ params }: Props) {
  const bodyVolume = Number(params["bodyVolume"] || 100);
  const bodyDensity = Number(params["bodyDensity"] || 800);
  const liquidDensity = Number(params["liquidDensity"] || 1000);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const rhoBody = bodyDensity;
      const rhoLiquid = liquidDensity;
      const v = bodyVolume;
      const g = 9.8;
      const bodyMass = rhoBody * v * 1e-6;
      const gravity = bodyMass * g;
      const maxFa = rhoLiquid * g * v * 1e-6;

      let state: "sink" | "neutral" | "float" = "sink";
      if (rhoBody > rhoLiquid) state = "sink";
      else if (Math.abs(rhoBody - rhoLiquid) < 10) state = "neutral";
      else state = "float";

      const tankX = 250;
      const tankY = 120;
      const tankW = 200;
      const tankH = 240;
      const liquidH = 180;

      const liquidColor =
        rhoLiquid > 1200
          ? "rgba(100,180,255,0.5)"
          : rhoLiquid > 900
            ? "rgba(100,200,255,0.5)"
            : "rgba(180,220,100,0.5)";
      ctx.fillStyle = liquidColor;
      ctx.fillRect(tankX + 4, tankY + tankH - liquidH, tankW - 8, liquidH);

      ctx.strokeStyle = "rgba(120,140,150,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tankX, tankY, tankW, tankH);

      const bodySize = Math.min(40 + v * 0.2, 80);
      const bodyX = tankX + tankW / 2;
      let bodyY = 0;
      let submergedFraction = 0;

      if (state === "sink") {
        bodyY = tankY + tankH - bodySize / 2 - 10;
        submergedFraction = 1;
      } else if (state === "neutral") {
        bodyY = tankY + tankH - liquidH + bodySize / 2;
        submergedFraction = 1;
      } else {
        submergedFraction = rhoBody / rhoLiquid;
        const submergedH = bodySize * submergedFraction;
        bodyY = tankY + tankH - liquidH + (bodySize - submergedH) / 2;
      }

      ctx.fillStyle = "#c86464";
      ctx.fillRect(bodyX - bodySize / 2, bodyY - bodySize / 2, bodySize, bodySize);

      if (submergedFraction > 0) {
        const submergedH = bodySize * submergedFraction;
        ctx.fillStyle = "rgba(100,180,255,0.3)";
        ctx.fillRect(
          bodyX - bodySize / 2,
          bodyY + bodySize / 2 - submergedH,
          bodySize,
          submergedH
        );
      }

      // Gravity arrow
      const arrowScale = Math.min(gravity * 80, 100);
      ctx.strokeStyle = "#ff6464";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bodyX, bodyY - bodySize / 2 - arrowScale - 10);
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
      ctx.fillText("Fтяж", bodyX + 12, bodyY - bodySize / 2 - arrowScale / 2 - 8);

      // Buoyancy arrow
      const fa = state === "float" ? gravity : maxFa;
      const faScale = Math.min(fa * 80, 100);
      ctx.strokeStyle = "#64c896";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bodyX, bodyY + bodySize / 2 + faScale + 10);
      ctx.lineTo(bodyX, bodyY + bodySize / 2 + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bodyX - 5, bodyY + bodySize / 2 + 10);
      ctx.lineTo(bodyX, bodyY + bodySize / 2 + 5);
      ctx.lineTo(bodyX + 5, bodyY + bodySize / 2 + 10);
      ctx.stroke();
      ctx.fillStyle = "#64c896";
      ctx.fillText("Fₐ", bodyX + 12, bodyY + bodySize / 2 + faScale / 2 + 8);

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 80, 200, 280, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Параметры:", 495, 95);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`V тела: ${v} см³`, 495, 125);
      ctx.fillText(`ρ тела: ${rhoBody} кг/м³`, 495, 150);
      ctx.fillText(`ρ жидкости: ${rhoLiquid} кг/м³`, 495, 175);
      ctx.fillText(`m тела: ${(bodyMass * 1000).toFixed(1)} г`, 495, 200);

      ctx.fillStyle = "#ff6464";
      ctx.fillText(`Fтяж = ${gravity.toFixed(4)} Н`, 495, 230);
      ctx.fillStyle = "#64c896";
      ctx.fillText(`Fₐ = ${fa.toFixed(4)} Н`, 495, 255);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      const stateText =
        state === "sink"
          ? "Тело тонет"
          : state === "neutral"
            ? "Тело плавает внутри"
            : "Тело всплывает";
      ctx.fillText(stateText, 495, 285);

      // Conditions box
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(20, 80, 200, 220, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Условия плавания", 120, 100);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("ρтела > ρжидкости → тонет", 35, 130);
      ctx.fillText("ρтела = ρжидкости → плавает", 35, 155);
      ctx.fillText("ρтела < ρжидкости → всплывает", 35, 180);
      ctx.fillText("Fтяж > Fₐ → тонет", 35, 215);
      ctx.fillText("Fтяж = Fₐ → равновесие", 35, 240);
      ctx.fillText("Fтяж < Fₐ → всплывает", 35, 265);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Выяснение условий плавания тел", w / 2, 20);
    };
  }, [bodyVolume, bodyDensity, liquidDensity]);

  return <SimulationCanvas draw={draw} width={700} height={420} />;
}
