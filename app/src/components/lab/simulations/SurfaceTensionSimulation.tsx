import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

const liquidData: Record<string, { name: string; sigma: number }> = {
  water: { name: "Вода", sigma: 73 },
  alcohol: { name: "Спирт", sigma: 22 },
  glycerol: { name: "Глицерин", sigma: 63 },
};

export default function SurfaceTensionSimulation({
  params,
  onStateChange,
}: Props) {
  const dropCount = Number(params["dropCount"] || 20);
  const totalMass = Number(params["totalMass"] || 5); // g
  const radius = Number(params["radius"] || 1.5); // mm
  const liquid = String(params["liquid"] || "water");

  const g = 9.8;
  const dropMassMg = (totalMass / dropCount) * 1000; // mg
  const dropMassKg = dropMassMg / 1e6;
  const detachForce = dropMassKg * g * 1000; // mN
  const surfaceTension = detachForce / (2 * Math.PI * radius); // mN/mm = N/m? Wait
  // sigma = F / l. F in N, l in m => N/m. Here F in mN = 1e-3 N, l in mm = 1e-3 m => mN/mm = N/m.
  // So surfaceTension is in mN/mm which equals N/m. Express as mN/m by multiplying by 1000.
  const surfaceTensionMnm = surfaceTension * 1000; // mN/m
  const tabularTension = liquidData[liquid]?.sigma ?? 73;

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Pipette
      const pipX = 180;
      const pipY = 60;
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pipX - 15, pipY);
      ctx.lineTo(pipX - 10, pipY + 100);
      ctx.lineTo(pipX - 4, pipY + 140);
      ctx.lineTo(pipX + 4, pipY + 140);
      ctx.lineTo(pipX + 10, pipY + 100);
      ctx.lineTo(pipX + 15, pipY);
      ctx.stroke();

      // Drop
      const dropSize = 20 + Math.min(20, dropCount / 5);
      const dropY = pipY + 155;
      const dropGradient = ctx.createRadialGradient(
        pipX,
        dropY,
        5,
        pipX,
        dropY,
        dropSize
      );
      dropGradient.addColorStop(0, "rgba(1, 172, 255, 0.8)");
      dropGradient.addColorStop(1, "rgba(1, 172, 255, 0.3)");
      ctx.fillStyle = dropGradient;
      ctx.beginPath();
      ctx.arc(pipX, dropY, dropSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#01acff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Neck connecting drop
      ctx.fillStyle = "rgba(1, 172, 255, 0.5)";
      ctx.beginPath();
      ctx.ellipse(pipX, pipY + 142, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Force arrow
      ctx.strokeStyle = "#ff7043";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pipX + dropSize + 15, dropY - 15);
      ctx.lineTo(pipX + dropSize + 15, dropY + 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pipX + dropSize + 10, dropY + 20);
      ctx.lineTo(pipX + dropSize + 15, dropY + 25);
      ctx.lineTo(pipX + dropSize + 20, dropY + 20);
      ctx.stroke();

      ctx.fillStyle = "#ff7043";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("F = mg", pipX + dropSize + 22, dropY + 8);

      // Surface tension ring
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pipX, pipY + 145, radius * 2, radius, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#2eff8c";
      ctx.font = "11px sans-serif";
      ctx.fillText(`l = 2πr`, pipX + radius * 2 + 10, pipY + 150);

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(320, 70, 340, 240, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.fillText("Отрыв капли от капельницы", 340, 100);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Жидкость: ${liquidData[liquid]?.name || ""}`, 340, 130);
      ctx.fillText(`Число капель: ${dropCount}`, 340, 152);
      ctx.fillText(`Масса жидкости: ${totalMass.toFixed(1)} г`, 340, 174);
      ctx.fillText(`Масса капли: ${dropMassMg.toFixed(1)} мг`, 340, 196);
      ctx.fillText(`Радиус отверстия: ${radius.toFixed(1)} мм`, 340, 218);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`F_отр = ${detachForce.toFixed(2)} мН`, 340, 250);
      ctx.fillText(`σ_изм = ${surfaceTensionMnm.toFixed(1)} мН/м`, 340, 274);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`σ_табл = ${tabularTension} мН/м`, 340, 296);

      if (onStateChange) {
        onStateChange({
          dropCount,
          totalMass,
          radius,
          dropMass: dropMassMg,
          detachForce,
          surfaceTension: surfaceTensionMnm,
          tabularTension,
        });
      }
    };
  }, [
    dropCount,
    totalMass,
    radius,
    liquid,
    dropMassMg,
    detachForce,
    surfaceTensionMnm,
    tabularTension,
    onStateChange,
  ]);

  return (
    <SimulationCanvas draw={draw} width={700} height={400} isRunning={false} />
  );
}
