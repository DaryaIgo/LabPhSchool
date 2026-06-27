import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function ArchimedesForceVsDensitySimulation({ params }: Props) {
  const bodyVolume = Number(params["bodyVolume"] || 100);
  const liquidDensity = Number(params["liquidDensity"] || 1000);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const rho = liquidDensity;
      const v = bodyVolume;
      const g = 9.8;
      const fa = rho * g * (v * 1e-6);

      // Two tanks side by side
      const tankW = 160;
      const tankH = 200;
      const tankY = 140;
      const liquidH = 160;

      const tanks = [
        { x: 80, rho: 1000, label: "Вода" },
        {
          x: 280,
          rho,
          label: rho > 1200 ? "Раствор соли" : rho > 900 ? "Вода" : "Спирт",
        },
      ];

      tanks.forEach(t => {
        const tRho = t.rho;
        const tFa = tRho * g * (v * 1e-6);
        const liquidColor =
          tRho > 1200
            ? "rgba(100,180,255,0.5)"
            : tRho > 900
              ? "rgba(100,200,255,0.5)"
              : "rgba(180,220,100,0.5)";

        ctx.fillStyle = liquidColor;
        ctx.fillRect(t.x + 4, tankY + tankH - liquidH, tankW - 8, liquidH);

        ctx.strokeStyle = "rgba(120,140,150,0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(t.x, tankY, tankW, tankH);

        const bodySize = Math.min(36 + v * 0.15, 70);
        const bodyX = t.x + tankW / 2;
        const bodyY = tankY + tankH - liquidH + bodySize / 2 - 10;

        ctx.fillStyle = "#c86464";
        ctx.fillRect(
          bodyX - bodySize / 2,
          bodyY - bodySize / 2,
          bodySize,
          bodySize
        );

        ctx.fillStyle = "rgba(100,180,255,0.3)";
        ctx.fillRect(bodyX - bodySize / 2, bodyY, bodySize, bodySize / 2);

        // F_a arrow
        ctx.strokeStyle = "#64c896";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bodyX, bodyY + bodySize / 2 + 35);
        ctx.lineTo(bodyX, bodyY + bodySize / 2 + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bodyX - 5, bodyY + bodySize / 2 + 10);
        ctx.lineTo(bodyX, bodyY + bodySize / 2 + 5);
        ctx.lineTo(bodyX + 5, bodyY + bodySize / 2 + 10);
        ctx.stroke();

        ctx.fillStyle = "#64c896";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `Fₐ = ${tFa.toFixed(4)} Н`,
          bodyX,
          bodyY + bodySize / 2 + 50
        );

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px sans-serif";
        ctx.fillText(t.label, bodyX, tankY - 15);
        ctx.fillStyle = "#96a3ab";
        ctx.font = "11px sans-serif";
        ctx.fillText(`ρ = ${tRho} кг/м³`, bodyX, tankY - 32);
      });

      // Graph F_a vs liquid density
      const graphX = 500;
      const graphY = 120;
      const graphW = 160;
      const graphH = 220;

      ctx.strokeStyle = "#5a6a72";
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      ctx.strokeStyle = "#96a3ab";
      ctx.beginPath();
      ctx.moveTo(graphX + 35, graphY + 20);
      ctx.lineTo(graphX + 35, graphY + graphH - 30);
      ctx.lineTo(graphX + graphW - 15, graphY + graphH - 30);
      ctx.stroke();

      ctx.fillStyle = "#96a3ab";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ρ, кг/м³", graphX + graphW / 2 + 10, graphY + graphH - 8);
      ctx.save();
      ctx.translate(graphX + 12, graphY + graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Fₐ, Н", 0, 0);
      ctx.restore();

      const rhoMin = 600;
      const rhoMax = 1400;
      const plotW = graphW - 50;
      const plotH = graphH - 50;
      const maxFa = rhoMax * g * (v * 1e-6);

      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let r = rhoMin; r <= rhoMax; r += 20) {
        const x = graphX + 35 + ((r - rhoMin) / (rhoMax - rhoMin)) * plotW;
        const y = graphY + graphH - 30 - ((r * g * (v * 1e-6)) / maxFa) * plotH;
        if (r === rhoMin) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const curX = graphX + 35 + ((rho - rhoMin) / (rhoMax - rhoMin)) * plotW;
      const curY = graphY + graphH - 30 - (fa / maxFa) * plotH;
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
      ctx.fillText(`V тела = ${v} см³`, 100, 398);
      ctx.fillStyle = "#2eff8c";
      ctx.fillText(`Fₐ = ${fa.toFixed(4)} Н`, 280, 398);
      ctx.fillStyle = "#ffcb3d";
      ctx.fillText(`ρ жидкости = ${rho} кг/м³`, 430, 398);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(
        "Зависимость силы Архимеда от плотности жидкости",
        w / 2,
        20
      );
    };
  }, [bodyVolume, liquidDensity]);

  return <SimulationCanvas draw={draw} width={700} height={450} />;
}
