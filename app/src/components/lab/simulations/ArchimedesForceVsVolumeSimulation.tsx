import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function ArchimedesForceVsVolumeSimulation({ params }: Props) {
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
      const tankX = 80;
      const tankY = 120;
      const tankW = 180;
      const tankH = 240;
      const liquidH = 180;

      const liquidColor =
        rho > 1200
          ? "rgba(100,180,255,0.5)"
          : rho > 900
            ? "rgba(100,200,255,0.5)"
            : "rgba(180,220,100,0.5)";
      ctx.fillStyle = liquidColor;
      ctx.fillRect(tankX + 4, tankY + tankH - liquidH, tankW - 8, liquidH);

      ctx.strokeStyle = "rgba(120,140,150,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tankX, tankY, tankW, tankH);

      // Body
      const bodySize = Math.min(40 + v * 0.2, 80);
      const submergedH = bodySize * (level / 100);
      const bodyY = tankY + tankH - liquidH + submergedH - bodySize / 2;
      const bodyX = tankX + tankW / 2;

      ctx.fillStyle = "#c86464";
      ctx.fillRect(bodyX - bodySize / 2, bodyY - bodySize / 2, bodySize, bodySize);

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

      // Graph F_a vs immersion level
      const graphX = 360;
      const graphY = 120;
      const graphW = 300;
      const graphH = 220;

      ctx.strokeStyle = "#5a6a72";
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      // Axes
      ctx.strokeStyle = "#96a3ab";
      ctx.beginPath();
      ctx.moveTo(graphX + 40, graphY + 20);
      ctx.lineTo(graphX + 40, graphY + graphH - 30);
      ctx.lineTo(graphX + graphW - 20, graphY + graphH - 30);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Vпогр, %", graphX + graphW / 2 + 20, graphY + graphH - 8);
      ctx.save();
      ctx.translate(graphX + 15, graphY + graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Fₐ, Н", 0, 0);
      ctx.restore();

      // Plot line
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const maxFa = rho * g * (v * 1e-6);
      const plotH = graphH - 50;
      const plotW = graphW - 60;
      for (let i = 0; i <= 100; i += 2) {
        const x = graphX + 40 + (i / 100) * plotW;
        const y = graphY + graphH - 30 - ((i / 100) * maxFa / Math.max(maxFa, 0.01)) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Current point
      const curX = graphX + 40 + (level / 100) * plotW;
      const curY = graphY + graphH - 30 - (fa / Math.max(maxFa, 0.01)) * plotH;
      ctx.fillStyle = "#ffcb3d";
      ctx.beginPath();
      ctx.arc(curX, curY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(80, 380, 580, 50, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `V = ${v} см³, погружение = ${level}%, Vпогр = ${(v * (level / 100)).toFixed(1)} см³`,
        100,
        398
      );
      ctx.fillStyle = "#2eff8c";
      ctx.fillText(`Fₐ = ${fa.toFixed(4)} Н`, 420, 398);
      ctx.fillStyle = "#ffcb3d";
      ctx.fillText(`Fₐ(max) = ${maxFa.toFixed(4)} Н`, 560, 398);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Зависимость силы Архимеда от объёма погружения", w / 2, 20);
    };
  }, [bodyVolume, immersionLevel, liquidDensity]);

  return <SimulationCanvas draw={draw} width={700} height={450} />;
}
