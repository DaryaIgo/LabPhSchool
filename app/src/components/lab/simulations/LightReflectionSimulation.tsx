import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function LightReflectionSimulation({
  params,
  onStateChange,
}: Props) {
  const incidentAngle = Number(params["incidentAngle"] || 30);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2 + 40;
      const rayLength = 220;
      const alphaRad = (incidentAngle * Math.PI) / 180;

      // Mirror surface
      ctx.fillStyle = "#37474f";
      ctx.fillRect(centerX - 220, centerY, 440, 80);
      ctx.fillStyle = "#5c6b73";
      ctx.fillRect(centerX - 220, centerY, 440, 4);

      // Normal (dashed)
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 180);
      ctx.lineTo(centerX, centerY + 20);
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

      // Arrow on incident ray
      drawArrow(ctx, incidentEndX, incidentEndY, centerX, centerY, "#ff7043");

      // Reflected ray
      const reflectedEndX = centerX + rayLength * Math.sin(alphaRad);
      const reflectedEndY = centerY - rayLength * Math.cos(alphaRad);
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(reflectedEndX, reflectedEndY);
      ctx.stroke();

      drawArrow(ctx, centerX, centerY, reflectedEndX, reflectedEndY, "#2eff8c");

      // Angle arcs
      const arcRadius = 55;
      ctx.strokeStyle = "rgba(255,112,67,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, arcRadius, -Math.PI / 2 - alphaRad, -Math.PI / 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(46,255,140,0.6)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, arcRadius, -Math.PI / 2, -Math.PI / 2 + alphaRad);
      ctx.stroke();

      // Labels
      ctx.fillStyle = "#ff7043";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("падающий луч", incidentEndX - 10, incidentEndY + 10);

      ctx.fillStyle = "#2eff8c";
      ctx.textAlign = "left";
      ctx.fillText("отражённый луч", reflectedEndX + 10, reflectedEndY + 10);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("нормаль", centerX, centerY - 185);

      // Angle labels
      ctx.fillStyle = "#ff7043";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `α = ${incidentAngle}°`,
        centerX - arcRadius - 10,
        centerY - arcRadius / 2
      );

      ctx.fillStyle = "#2eff8c";
      ctx.textAlign = "left";
      ctx.fillText(
        `β = ${incidentAngle}°`,
        centerX + arcRadius + 10,
        centerY - arcRadius / 2
      );

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(40, 30, 260, 110, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Закон отражения", 55, 45);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Угол падения α = ${incidentAngle}°`, 55, 75);
      ctx.fillText(`Угол отражения β = ${incidentAngle}°`, 55, 95);
      ctx.fillStyle = "#2eff8c";
      ctx.fillText("α = β ✓", 55, 115);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Отражение света от плоского зеркала", w / 2, 16);

      if (onStateChange) {
        onStateChange({
          alpha: incidentAngle,
          beta: incidentAngle,
        });
      }
    };
  }, [incidentAngle, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
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
