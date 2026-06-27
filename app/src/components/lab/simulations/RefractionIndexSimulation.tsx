import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function RefractionIndexSimulation({
  params,
  onStateChange,
}: Props) {
  const incidentAngle = Number(params["incidentAngle"] || 45);
  const nGlass = Number(params["nGlass"] || 1.5);

  const draw = useMemo(() => {
    const alphaRad = (incidentAngle * Math.PI) / 180;
    const sinBeta = Math.min(Math.sin(alphaRad) / nGlass, 1);
    const betaRad = Math.asin(sinBeta);
    const betaDeg = (betaRad * 180) / Math.PI;
    const nMeasured = Math.sin(alphaRad) / Math.sin(betaRad);

    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const rayLength = 200;

      // Glass plate
      ctx.fillStyle = "rgba(1,172,255,0.1)";
      ctx.fillRect(centerX - 200, centerY, 400, h - centerY);
      ctx.strokeStyle = "#5c6b73";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 200, centerY);
      ctx.lineTo(centerX + 200, centerY);
      ctx.stroke();

      // Normal
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 180);
      ctx.lineTo(centerX, centerY + 180);
      ctx.stroke();
      ctx.setLineDash([]);

      // Incident ray
      const incidentEndX = centerX - rayLength * Math.sin(alphaRad);
      const incidentEndY = centerY - rayLength * Math.cos(alphaRad);
      ctx.strokeStyle = "#ff7043";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(incidentEndX, incidentEndY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      drawArrow(ctx, incidentEndX, incidentEndY, centerX, centerY, "#ff7043");

      // Refracted ray
      const refractedEndX = centerX + rayLength * Math.sin(betaRad);
      const refractedEndY = centerY + rayLength * Math.cos(betaRad);
      ctx.strokeStyle = "#01acff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(refractedEndX, refractedEndY);
      ctx.stroke();
      drawArrow(ctx, centerX, centerY, refractedEndX, refractedEndY, "#01acff");

      // Angle arcs
      const arcRadius = 55;
      ctx.strokeStyle = "rgba(255,112,67,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        arcRadius,
        -Math.PI / 2 - alphaRad,
        -Math.PI / 2
      );
      ctx.stroke();

      ctx.strokeStyle = "rgba(1,172,255,0.6)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, arcRadius, Math.PI / 2, Math.PI / 2 + betaRad);
      ctx.stroke();

      // Labels
      ctx.fillStyle = "#ff7043";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `α = ${incidentAngle}°`,
        centerX - arcRadius - 8,
        centerY - arcRadius / 2
      );

      ctx.fillStyle = "#01acff";
      ctx.textAlign = "left";
      ctx.fillText(
        `β = ${betaDeg.toFixed(1)}°`,
        centerX + arcRadius + 8,
        centerY + arcRadius / 2
      );

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(40, 30, 300, 150, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Измерение показателя преломления", 55, 45);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Формула: n = sinα / sinβ`, 55, 75);
      ctx.fillText(
        `sin(${incidentAngle}°) / sin(${betaDeg.toFixed(1)}°) = ${nMeasured.toFixed(3)}`,
        55,
        95
      );
      ctx.fillText(`Заданное значение n = ${nGlass.toFixed(2)}`, 55, 115);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`n_изм = ${nMeasured.toFixed(2)}`, 55, 140);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Показатель преломления стекла", w / 2, 16);

      if (onStateChange) {
        onStateChange({
          alpha: incidentAngle,
          beta: betaDeg,
          nMeasured,
          nTabular: nGlass,
        });
      }
    };
  }, [incidentAngle, nGlass, onStateChange]);

  return (
    <SimulationCanvas draw={draw} width={700} height={400} isRunning={false} />
  );
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string
) {
  const headLen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const endX = toX - 12 * Math.cos(angle);
  const endY = toY - 12 * Math.sin(angle);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle - Math.PI / 6),
    endY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - headLen * Math.cos(angle + Math.PI / 6),
    endY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}
