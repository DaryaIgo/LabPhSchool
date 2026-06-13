import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

// Approximate psychrometric relation for school level
function estimateRelativeHumidity(dry: number, wet: number): number {
  const delta = dry - wet;
  if (delta <= 0) return 100;
  // Empirical approximation: each 1°C difference roughly corresponds to ~5% humidity drop at room temp
  const rh = 100 - delta * (4.5 + 0.1 * (dry - 20));
  return Math.max(10, Math.min(100, Math.round(rh)));
}

export default function RelativeHumiditySimulation({
  params,
  onStateChange,
}: Props) {
  const dryTemp = Number(params["dryTemp"] || 25);
  const wetTemp = Number(params["wetTemp"] || 20);
  const deltaT = dryTemp - wetTemp;
  const relativeHumidity = estimateRelativeHumidity(dryTemp, wetTemp);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Психрометр", w / 2, 30);

      // Dry thermometer
      const dryX = 180;
      const thermY = 80;
      const thermH = 180;
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dryX, thermY);
      ctx.lineTo(dryX, thermY + thermH);
      ctx.stroke();
      ctx.fillStyle = "#ff7043";
      const mercuryDry = Math.min(1, Math.max(0, (dryTemp - 0) / 50)) * thermH;
      ctx.fillRect(dryX - 4, thermY + thermH - mercuryDry, 8, mercuryDry);
      ctx.beginPath();
      ctx.arc(dryX, thermY + thermH, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.fillText("Сухой", dryX, thermY - 15);
      ctx.fillStyle = "#ff7043";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`${dryTemp.toFixed(0)}°C`, dryX + 25, thermY + thermH - mercuryDry + 5);

      // Wet thermometer
      const wetX = 320;
      ctx.strokeStyle = "#788389";
      ctx.beginPath();
      ctx.moveTo(wetX, thermY);
      ctx.lineTo(wetX, thermY + thermH);
      ctx.stroke();
      ctx.fillStyle = "#01acff";
      const mercuryWet = Math.min(1, Math.max(0, (wetTemp - 0) / 50)) * thermH;
      ctx.fillRect(wetX - 4, thermY + thermH - mercuryWet, 8, mercuryWet);
      ctx.beginPath();
      ctx.arc(wetX, thermY + thermH, 8, 0, Math.PI * 2);
      ctx.fill();

      // Wet cloth around bulb
      ctx.fillStyle = "rgba(1, 172, 255, 0.25)";
      ctx.fillRect(wetX - 15, thermY + thermH - 25, 30, 30);

      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.fillText("Влажный", wetX, thermY - 15);
      ctx.fillStyle = "#01acff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`${wetTemp.toFixed(0)}°C`, wetX + 25, thermY + thermH - mercuryWet + 5);

      // Psychrometric table hint
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(430, 80, 230, 220, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Расчёт влажности", 450, 110);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`T_сух = ${dryTemp.toFixed(0)}°C`, 450, 140);
      ctx.fillText(`T_влж = ${wetTemp.toFixed(0)}°C`, 450, 162);
      ctx.fillText(`ΔT = ${deltaT.toFixed(1)}°C`, 450, 184);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`φ = ${relativeHumidity}%`, 450, 230);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("Школьная оценка по разности", 450, 260);
      ctx.fillText("показаний термометров", 450, 275);

      // Air humidity indicator
      const indicatorX = 180;
      const indicatorY = 330;
      const indicatorW = 340;
      const indicatorH = 16;

      ctx.fillStyle = "#2a3237";
      ctx.fillRect(indicatorX, indicatorY, indicatorW, indicatorH);

      const gradient = ctx.createLinearGradient(indicatorX, 0, indicatorX + indicatorW, 0);
      gradient.addColorStop(0, "#ff7043");
      gradient.addColorStop(0.5, "#ffcb3d");
      gradient.addColorStop(1, "#2eff8c");

      ctx.fillStyle = gradient;
      ctx.fillRect(indicatorX, indicatorY, indicatorW * (relativeHumidity / 100), indicatorH);

      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 1;
      ctx.strokeRect(indicatorX, indicatorY, indicatorW, indicatorH);

      ctx.fillStyle = "#ffffff";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("0%", indicatorX, indicatorY + 30);
      ctx.fillText("50%", indicatorX + indicatorW / 2, indicatorY + 30);
      ctx.fillText("100%", indicatorX + indicatorW, indicatorY + 30);

      if (onStateChange) {
        onStateChange({
          dryTemp,
          wetTemp,
          deltaT,
          relativeHumidity,
        });
      }
    };
  }, [dryTemp, wetTemp, deltaT, relativeHumidity, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
  );
}
