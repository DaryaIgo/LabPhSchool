import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function BoyleMariotteSimulation({
  params,
  onStateChange,
}: Props) {
  const temperature = Number(params["temperature"] || 300);
  const volume = Number(params["volume"] || 2);
  const amount = Number(params["amount"] || 0.05);

  const R = 8.31;
  // pressure in Pa
  const pressure = (amount * R * temperature) / (volume * 1e-3);
  const pressureKPa = pressure / 1000;
  const pv = pressure * volume * 1e-3;

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Cylinder dimensions
      const cylX = 80;
      const cylY = 80;
      const cylWidth = 140;
      const maxCylHeight = 220;
      const minVolume = 0.5;
      const maxVolume = 5;
      const pistonHeight =
        maxCylHeight *
        (1 - (volume - minVolume) / (maxVolume - minVolume));
      const clampedPiston = Math.max(20, Math.min(pistonHeight, maxCylHeight - 20));

      // Cylinder body
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cylX, cylY);
      ctx.lineTo(cylX, cylY + maxCylHeight);
      ctx.lineTo(cylX + cylWidth, cylY + maxCylHeight);
      ctx.lineTo(cylX + cylWidth, cylY);
      ctx.stroke();

      // Gas fill
      const gasGradient = ctx.createLinearGradient(
        cylX,
        cylY + clampedPiston,
        cylX,
        cylY + maxCylHeight
      );
      gasGradient.addColorStop(0, "rgba(255, 112, 67, 0.35)");
      gasGradient.addColorStop(1, "rgba(255, 112, 67, 0.15)");
      ctx.fillStyle = gasGradient;
      ctx.fillRect(
        cylX + 3,
        cylY + clampedPiston,
        cylWidth - 6,
        maxCylHeight - clampedPiston
      );

      // Piston
      ctx.fillStyle = "#5c6b73";
      ctx.fillRect(cylX - 5, cylY + clampedPiston - 8, cylWidth + 10, 12);
      ctx.fillStyle = "#96a3ab";
      ctx.fillRect(cylX + cylWidth / 2 - 2, cylY + clampedPiston - 40, 4, 32);

      // Volume label
      ctx.fillStyle = "#ffffff";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`V = ${volume.toFixed(1)} л`, cylX + cylWidth / 2, cylY + maxCylHeight + 28);

      // Manometer
      const gaugeX = cylX + cylWidth + 90;
      const gaugeY = cylY + 70;
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 42, 0, Math.PI * 2);
      ctx.fill();

      // Needle
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
      ctx.textAlign = "center";
      ctx.fillText("Манометр", gaugeX, gaugeY - 58);
      ctx.fillStyle = "#ff7043";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`${pressureKPa.toFixed(1)} кПа`, gaugeX, gaugeY + 62);

      // p-V graph
      const graphX = 420;
      const graphY = 80;
      const graphW = 240;
      const graphH = 180;

      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      // Axes
      ctx.beginPath();
      ctx.moveTo(graphX + 30, graphY + graphH - 25);
      ctx.lineTo(graphX + graphW - 10, graphY + graphH - 25);
      ctx.moveTo(graphX + 30, graphY + 15);
      ctx.lineTo(graphX + 30, graphY + graphH - 25);
      ctx.stroke();

      // Labels
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("V, л", graphX + graphW / 2, graphY + graphH - 5);
      ctx.save();
      ctx.translate(graphX + 10, graphY + graphH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("p, кПа", 0, 0);
      ctx.restore();

      // Hyperbola curve p(V) = const / V
      const constPV = pv; // J = Pa·m³
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const vPlot = minVolume + (i / 80) * (maxVolume - minVolume);
        const pPlot = constPV / vPlot; // kPa because constPV is in Pa·m³? Actually constPV = Pa * L = Pa * 1e-3 m3 = J
        // pPlot in kPa
        const px = graphX + 30 + ((vPlot - minVolume) / (maxVolume - minVolume)) * (graphW - 40);
        const py =
          graphY + graphH - 25 - (pPlot / 500) * (graphH - 40);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Current point
      const curPx =
        graphX + 30 + ((volume - minVolume) / (maxVolume - minVolume)) * (graphW - 40);
      const curPy = graphY + graphH - 25 - (pressureKPa / 500) * (graphH - 40);
      ctx.fillStyle = "#ff7043";
      ctx.beginPath();
      ctx.arc(curPx, curPy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(80, 320, 580, 60, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Изотермический процесс", 95, 345);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`T = ${temperature.toFixed(0)} К`, 95, 368);
      ctx.fillText(`n = ${amount.toFixed(2)} моль`, 210, 368);
      ctx.fillText(`p·V = ${pv.toFixed(2)} Дж`, 340, 368);

      if (onStateChange) {
        onStateChange({
          temperature,
          volume,
          pressure: pressureKPa,
          pv,
        });
      }
    };
  }, [temperature, volume, amount, pressureKPa, pv, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
  );
}
