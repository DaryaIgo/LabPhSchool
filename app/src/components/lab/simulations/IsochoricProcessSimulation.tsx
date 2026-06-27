import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function IsochoricProcessSimulation({
  params,
  onStateChange,
}: Props) {
  const volume = Number(params["volume"] || 1); // L
  const temperature = Number(params["temperature"] || 300); // K
  const amount = Number(params["amount"] || 0.05); // mol

  const R = 8.31;
  const pressure = (amount * R * temperature) / (volume * 1e-3); // Pa
  const pressureKPa = pressure / 1000;
  const pt = pressureKPa / temperature;

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Flask
      const flaskX = 150;
      const flaskY = 120;
      const flaskRadius = 70;
      const neckWidth = 30;
      const neckHeight = 70;

      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(flaskX, flaskY + flaskRadius, flaskRadius, 0, Math.PI, false);
      ctx.lineTo(flaskX - neckWidth / 2, flaskY - neckHeight);
      ctx.lineTo(flaskX + neckWidth / 2, flaskY - neckHeight);
      ctx.lineTo(flaskX + flaskRadius, flaskY + flaskRadius);
      ctx.stroke();

      // Gas inside flask
      const heatRatio = Math.min(
        1,
        Math.max(0, (temperature - 200) / (500 - 200))
      );
      const gasGradient = ctx.createRadialGradient(
        flaskX,
        flaskY + flaskRadius,
        10,
        flaskX,
        flaskY + flaskRadius,
        flaskRadius
      );
      const r = Math.round(255);
      const g = Math.round(112 + (1 - heatRatio) * 100);
      const b = Math.round(67 + (1 - heatRatio) * 100);
      gasGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
      gasGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.2)`);
      ctx.fillStyle = gasGradient;
      ctx.beginPath();
      ctx.arc(flaskX, flaskY + flaskRadius, flaskRadius - 4, 0, Math.PI, false);
      ctx.lineTo(flaskX - neckWidth / 2 + 3, flaskY - neckHeight);
      ctx.lineTo(flaskX + neckWidth / 2 - 3, flaskY - neckHeight);
      ctx.lineTo(flaskX + flaskRadius - 4, flaskY + flaskRadius);
      ctx.fill();

      // Stopper
      ctx.fillStyle = "#5c6b73";
      ctx.fillRect(
        flaskX - neckWidth / 2 - 3,
        flaskY - neckHeight - 8,
        neckWidth + 6,
        10
      );

      // Heater
      ctx.fillStyle = "#3c474f";
      ctx.fillRect(flaskX - 50, flaskY + flaskRadius * 2 + 10, 100, 15);
      ctx.fillStyle = "#ff7043";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Нагреватель", flaskX, flaskY + flaskRadius * 2 + 45);

      // Manometer connected to flask
      const gaugeX = flaskX + flaskRadius + 90;
      const gaugeY = flaskY + 40;
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flaskX + flaskRadius, flaskY + flaskRadius / 2);
      ctx.lineTo(gaugeX - 45, flaskY + flaskRadius / 2);
      ctx.lineTo(gaugeX - 45, gaugeY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 42, 0, Math.PI * 2);
      ctx.fill();

      const maxPressure = 500;
      const angle =
        -Math.PI / 2 +
        (Math.min(pressureKPa, maxPressure) / maxPressure) * Math.PI;
      ctx.strokeStyle = "#ff7043";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gaugeX, gaugeY);
      ctx.lineTo(gaugeX + 35 * Math.cos(angle), gaugeY + 35 * Math.sin(angle));
      ctx.stroke();
      ctx.fillStyle = "#ff7043";
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.fillText("Манометр", gaugeX, gaugeY - 58);
      ctx.fillStyle = "#ff7043";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`${pressureKPa.toFixed(1)} кПа`, gaugeX, gaugeY + 62);

      // Volume label
      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.fillText(`V = ${volume.toFixed(1)} л`, flaskX, flaskY - 90);

      // p-T graph
      const graphX = 420;
      const graphY = 130;
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
      ctx.fillText("p, кПа", 0, 0);
      ctx.restore();

      const minT = 200;
      const maxT = 500;
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 50; i++) {
        const tPlot = minT + (i / 50) * (maxT - minT);
        const pPlot = (amount * R * tPlot) / (volume * 1e-3) / 1000;
        const px =
          graphX + 30 + ((tPlot - minT) / (maxT - minT)) * (graphW - 40);
        const py = graphY + graphH - 25 - (pPlot / 500) * (graphH - 40);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const curPx =
        graphX + 30 + ((temperature - minT) / (maxT - minT)) * (graphW - 40);
      const curPy = graphY + graphH - 25 - (pressureKPa / 500) * (graphH - 40);
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
      ctx.fillText("Изохорный процесс", 95, 355);
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`V = ${volume.toFixed(1)} л`, 95, 373);
      ctx.fillText(`p/T = ${pt.toFixed(3)} кПа/К`, 220, 373);

      if (onStateChange) {
        onStateChange({
          volume,
          temperature,
          pressure: pressureKPa,
          pt,
        });
      }
    };
  }, [volume, temperature, amount, pressureKPa, pt, onStateChange]);

  return (
    <SimulationCanvas draw={draw} width={700} height={400} isRunning={false} />
  );
}
