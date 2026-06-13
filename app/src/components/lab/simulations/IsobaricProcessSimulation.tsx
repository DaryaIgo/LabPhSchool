import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function IsobaricProcessSimulation({
  params,
  onStateChange,
}: Props) {
  const pressure = Number(params["pressure"] || 100); // kPa
  const temperature = Number(params["temperature"] || 300); // K
  const amount = Number(params["amount"] || 0.05); // mol

  const R = 8.31;
  const volume = (amount * R * temperature) / (pressure * 1000) * 1000; // L
  const vt = volume / temperature;

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Cylinder
      const cylX = 80;
      const cylY = 60;
      const cylWidth = 140;
      const maxCylHeight = 240;
      const minVolume = 0.5;
      const maxVolume = 8;
      const pistonHeight =
        maxCylHeight *
        (1 - (volume - minVolume) / (maxVolume - minVolume));
      const clampedPiston = Math.max(20, Math.min(pistonHeight, maxCylHeight - 20));

      // Weight on piston = constant pressure
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cylX, cylY);
      ctx.lineTo(cylX, cylY + maxCylHeight);
      ctx.lineTo(cylX + cylWidth, cylY + maxCylHeight);
      ctx.lineTo(cylX + cylWidth, cylY);
      ctx.stroke();

      // Gas fill (warmer color when hot)
      const heatRatio = Math.min(
        1,
        Math.max(0, (temperature - 200) / (500 - 200))
      );
      const gasGradient = ctx.createLinearGradient(
        cylX,
        cylY + clampedPiston,
        cylX,
        cylY + maxCylHeight
      );
      const r = Math.round(255);
      const g = Math.round(112 + (1 - heatRatio) * 100);
      const b = Math.round(67 + (1 - heatRatio) * 100);
      gasGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
      gasGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.15)`);
      ctx.fillStyle = gasGradient;
      ctx.fillRect(
        cylX + 3,
        cylY + clampedPiston,
        cylWidth - 6,
        maxCylHeight - clampedPiston
      );

      // Piston + weight
      ctx.fillStyle = "#5c6b73";
      ctx.fillRect(cylX - 5, cylY + clampedPiston - 8, cylWidth + 10, 12);
      ctx.fillStyle = "#96a3ab";
      ctx.fillRect(cylX + cylWidth / 2 - 2, cylY + clampedPiston - 40, 4, 32);
      ctx.fillStyle = "#ffcb3d";
      ctx.fillRect(cylX + 20, cylY + clampedPiston - 60, cylWidth - 40, 20);
      ctx.fillStyle = "#1a1f22";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("p = const", cylX + cylWidth / 2, cylY + clampedPiston - 47);

      // Heater below
      ctx.fillStyle = "#3c474f";
      ctx.fillRect(cylX - 10, cylY + maxCylHeight + 5, cylWidth + 20, 15);
      ctx.fillStyle = "#ff7043";
      ctx.font = "11px sans-serif";
      ctx.fillText("Нагреватель", cylX + cylWidth / 2, cylY + maxCylHeight + 35);

      // Volume label
      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.fillText(`V = ${volume.toFixed(2)} л`, cylX + cylWidth / 2, cylY + maxCylHeight + 55);

      // Thermometer
      const thermX = cylX + cylWidth + 50;
      const thermY = cylY + 40;
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(thermX, thermY);
      ctx.lineTo(thermX, thermY + 180);
      ctx.stroke();
      ctx.fillStyle = "#ff7043";
      const mercuryHeight = ((temperature - 200) / (500 - 200)) * 160;
      ctx.fillRect(thermX - 4, thermY + 180 - mercuryHeight, 8, mercuryHeight);
      ctx.fillStyle = "#ff7043";
      ctx.beginPath();
      ctx.arc(thermX, thermY + 180, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.fillText(`${temperature.toFixed(0)} К`, thermX + 20, thermY + 185 - mercuryHeight);

      // V-T graph
      const graphX = 420;
      const graphY = 70;
      const graphW = 240;
      const graphH = 180;

      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      ctx.beginPath();
      ctx.moveTo(graphX + 30, graphY + graphH - 25);
      ctx.lineTo(graphX + graphW - 10, graphY + graphH - 25);
      ctx.moveTo(graphX + 30, graphY + 15);
      ctx.lineTo(graphX + 30, graphY + graphH - 25);
      ctx.stroke();

      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("T, К", graphX + graphW / 2, graphY + graphH - 5);
      ctx.save();
      ctx.translate(graphX + 10, graphY + graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("V, л", 0, 0);
      ctx.restore();

      const minT = 200;
      const maxT = 500;

      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 50; i++) {
        const tPlot = minT + (i / 50) * (maxT - minT);
        const vPlot = (amount * R * tPlot) / (pressure * 1000) * 1000;
        const px = graphX + 30 + ((tPlot - minT) / (maxT - minT)) * (graphW - 40);
        const py =
          graphY + graphH - 25 - ((vPlot - 0) / 8) * (graphH - 40);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const curPx = graphX + 30 + ((temperature - minT) / (maxT - minT)) * (graphW - 40);
      const curPy = graphY + graphH - 25 - ((volume - 0) / 8) * (graphH - 40);
      ctx.fillStyle = "#ff7043";
      ctx.beginPath();
      ctx.arc(curPx, curPy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Info
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(80, 330, 580, 50, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Изобарный процесс", 95, 355);
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`p = ${pressure.toFixed(0)} кПа`, 95, 373);
      ctx.fillText(`V/T = ${vt.toFixed(4)} л/К`, 220, 373);

      if (onStateChange) {
        onStateChange({
          pressure,
          temperature,
          volume,
          vt,
        });
      }
    };
  }, [pressure, temperature, amount, volume, vt, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
  );
}
