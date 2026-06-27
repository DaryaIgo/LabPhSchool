import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function WavelengthMeasurementSimulation({
  params,
  onStateChange,
}: Props) {
  const gratingConstant = Number(params["gratingConstant"] || 1.0);
  const diffractionAngle = Number(params["diffractionAngle"] || 20);
  const order = Number(params["order"] || 1);

  const draw = useMemo(() => {
    const phiRad = (diffractionAngle * Math.PI) / 180;
    const lambda = (gratingConstant * 1000 * Math.sin(phiRad)) / order;

    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const centerX = 120;
      const centerY = h / 2;
      const screenX = w - 80;
      const screenY = 60;
      const screenH = h - 120;

      // Grating
      ctx.strokeStyle = "#5c6b73";
      ctx.lineWidth = 2;
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + i * 6);
        ctx.lineTo(centerX, centerY + i * 6 + 3);
        ctx.stroke();
      }

      // Incident beam
      ctx.strokeStyle = "#ff7043";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, centerY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      drawArrow(ctx, 40, centerY, centerX, centerY, "#ff7043");

      // Diffracted beams
      const rayLen = screenX - centerX - 10;
      for (let k = 1; k <= 3; k++) {
        const sinPhiK = (k * lambda) / (gratingConstant * 1000);
        if (sinPhiK > 1) continue;
        const phiK = Math.asin(sinPhiK);
        const y = rayLen * Math.tan(phiK);

        ctx.strokeStyle = k === order ? "#2eff8c" : "rgba(46,255,140,0.25)";
        ctx.lineWidth = k === order ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(screenX - 10, centerY - y);
        ctx.stroke();

        // Maxima on screen
        ctx.fillStyle = k === order ? "#2eff8c" : "rgba(46,255,140,0.35)";
        ctx.beginPath();
        ctx.arc(screenX - 10, centerY - y, k === order ? 6 : 3, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.fillStyle = "#96a3ab";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`k=${k}`, screenX, centerY - y);
      }

      // Central maximum
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(screenX - 10, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#96a3ab";
      ctx.fillText("k=0", screenX, centerY);

      // Screen
      ctx.strokeStyle = "#37474f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX, screenY + screenH);
      ctx.stroke();

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(40, 30, 300, 140, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Дифракционная решётка", 55, 45);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`d = ${gratingConstant.toFixed(1)} мкм`, 55, 75);
      ctx.fillText(`φ = ${diffractionAngle.toFixed(1)}°`, 55, 95);
      ctx.fillText(`k = ${order}`, 55, 115);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`λ = ${lambda.toFixed(1)} нм`, 55, 135);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Измерение длины световой волны", w / 2, 16);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText("d·sinφ = kλ", w / 2, 42);

      if (onStateChange) {
        onStateChange({
          d: gratingConstant,
          phi: diffractionAngle,
          k: order,
          lambda,
        });
      }
    };
  }, [gratingConstant, diffractionAngle, order, onStateChange]);

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
