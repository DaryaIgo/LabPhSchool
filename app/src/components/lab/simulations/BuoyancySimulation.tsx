import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function BuoyancySimulation({ params }: Props) {
  const bodyVolume = Number(params["bodyVolume"] || 100);
  const material1 = Number(params["material1"] || 2700);
  const material2 = Number(params["material2"] || 7800);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const rho = 1000;
      const g = 9.8;
      const fa = rho * g * bodyVolume * 1e-6;
      const m1 = (material1 * bodyVolume * 1e-6 * 1000).toFixed(1);
      const m2 = (material2 * bodyVolume * 1e-6 * 1000).toFixed(1);

      // Tank
      const tankX = 120;
      const tankY = 120;
      const tankW = 260;
      const tankH = 240;

      // Liquid
      const liquidH = 180;
      ctx.fillStyle = "rgba(100,200,255,0.4)";
      ctx.fillRect(tankX + 4, tankY + tankH - liquidH, tankW - 8, liquidH);

      // Tank glass
      ctx.strokeStyle = "rgba(120,140,150,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tankX, tankY, tankW, tankH);

      // Body 1
      const size1 = 50;
      const x1 = tankX + 60;
      const y1 = tankY + tankH - liquidH + size1 / 2 + 20;
      ctx.fillStyle = "#64a0c8";
      ctx.fillRect(x1 - size1 / 2, y1 - size1 / 2, size1, size1);
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("1", x1, y1);

      // Body 2
      const size2 = 50;
      const x2 = tankX + tankW - 60;
      const y2 = tankY + tankH - liquidH + size2 / 2 + 20;
      ctx.fillStyle = "#c86464";
      ctx.fillRect(x2 - size2 / 2, y2 - size2 / 2, size2, size2);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("2", x2, y2);

      // Up arrows
      ctx.strokeStyle = "#64c896";
      ctx.lineWidth = 2;
      [x1, x2].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, y1 - size1 / 2 - 30);
        ctx.lineTo(x, y1 - size1 / 2 - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 5, y1 - size1 / 2 - 10);
        ctx.lineTo(x, y1 - size1 / 2 - 5);
        ctx.lineTo(x + 5, y1 - size1 / 2 - 10);
        ctx.stroke();
      });

      ctx.fillStyle = "#64c896";
      ctx.textAlign = "center";
      ctx.fillText("Fₐ", x1, y1 - size1 / 2 - 40);
      ctx.fillText("Fₐ", x2, y2 - size2 / 2 - 40);

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 80, 200, 240, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Результаты:", 495, 95);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Объём тел: ${bodyVolume} см³`, 495, 125);
      ctx.fillText(`Материал 1: ${material1} кг/м³`, 495, 150);
      ctx.fillText(`Материал 2: ${material2} кг/м³`, 495, 175);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`Fₐ₁ = ${fa.toFixed(3)} Н`, 495, 205);
      ctx.fillText(`Fₐ₂ = ${fa.toFixed(3)} Н`, 495, 230);
      ctx.fillText(`m₁ = ${m1} г`, 495, 255);
      ctx.fillText(`m₂ = ${m2} г`, 495, 280);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(
        "Независимость выталкивающей силы",
        w / 2,
        20
      );
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("от массы тела при постоянном V", w / 2, 42);
    };
  }, [bodyVolume, material1, material2]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
    />
  );
}
