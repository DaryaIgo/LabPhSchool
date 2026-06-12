import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function LensFocalSimulation({
  params,
  onStateChange,
}: Props) {
  const objectDistance = Number(params["objectDistance"] || 30);
  const focalLength = Number(params["focalLength"] || 10);

  const draw = useMemo(() => {
    const F = focalLength;
    const d = objectDistance;
    let f = 0;
    let imageReal = false;
    if (d > F) {
      f = 1 / (1 / F - 1 / d);
      imageReal = true;
    } else {
      f = 1 / (1 / F - 1 / d); // negative
      imageReal = false;
    }
    const D = 100 / F; // diopters if F in cm
    const fAbs = Math.abs(f);

    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const scale = 4;
      const lensX = w / 2;
      const axisY = h / 2;
      const focalPx = F * scale;
      const objectPx = d * scale;
      const imagePx = fAbs * scale;

      // Optical axis
      ctx.strokeStyle = "#5c6b73";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, axisY);
      ctx.lineTo(w - 40, axisY);
      ctx.stroke();

      // Lens
      ctx.strokeStyle = "#01acff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lensX, axisY - 60);
      ctx.lineTo(lensX - 8, axisY - 50);
      ctx.lineTo(lensX + 8, axisY - 50);
      ctx.lineTo(lensX, axisY - 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lensX, axisY + 40);
      ctx.lineTo(lensX - 8, axisY + 50);
      ctx.lineTo(lensX + 8, axisY + 50);
      ctx.lineTo(lensX, axisY + 60);
      ctx.stroke();

      // Focal points
      ctx.fillStyle = "#ffc832";
      ctx.beginPath();
      ctx.arc(lensX - focalPx, axisY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lensX + focalPx, axisY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffc832";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("F", lensX - focalPx, axisY + 8);
      ctx.fillText("F", lensX + focalPx, axisY + 8);

      // Double focal points
      ctx.fillStyle = "rgba(255,200,50,0.5)";
      ctx.beginPath();
      ctx.arc(lensX - 2 * focalPx, axisY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lensX + 2 * focalPx, axisY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Object (arrow)
      const objectX = lensX - objectPx;
      drawArrowObject(ctx, objectX, axisY, -40, "#ff7043");

      // Image
      if (imageReal) {
        const imageX = lensX + imagePx;
        const magnification = f / d;
        const imageHeight = -40 * magnification;
        drawArrowObject(ctx, imageX, axisY, imageHeight, "#2eff8c");

        // Rays
        ctx.strokeStyle = "rgba(255,112,67,0.4)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(objectX, axisY - 40);
        ctx.lineTo(lensX, axisY - 40);
        ctx.lineTo(imageX, axisY + imageHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(objectX, axisY - 40);
        ctx.lineTo(lensX, axisY);
        ctx.lineTo(imageX, axisY + imageHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Virtual image on same side
        const imageX = lensX - imagePx;
        const magnification = fAbs / d;
        const imageHeight = 40 * magnification;
        drawArrowObject(ctx, imageX, axisY, imageHeight, "#2eff8c");

        ctx.fillStyle = "#2eff8c";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("мнимое", imageX, axisY - imageHeight - 4);
      }

      // Labels
      ctx.fillStyle = "#ff7043";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("предмет", objectX, axisY - 42);

      if (imageReal) {
        ctx.fillStyle = "#2eff8c";
        ctx.fillText("изображение", lensX + imagePx, axisY + Math.abs(-40 * (f / d)) + 16);
      }

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(420, 30, 250, 150, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Тонкая собирающая линза", 435, 45);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`F = ${F.toFixed(1)} см`, 435, 75);
      ctx.fillText(`d = ${d.toFixed(1)} см`, 435, 95);
      if (imageReal) {
        ctx.fillText(`f = ${fAbs.toFixed(1)} см`, 435, 115);
        ctx.fillStyle = "#2eff8c";
        ctx.fillText(`D = ${D.toFixed(2)} дптр`, 435, 135);
      } else {
        ctx.fillText("Изображение мнимое", 435, 115);
        ctx.fillStyle = "#2eff8c";
        ctx.fillText(`D = ${D.toFixed(2)} дптр`, 435, 135);
      }

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Фокусное расстояние собирающей линзы", w / 2, 16);

      if (onStateChange) {
        onStateChange({
          F,
          d,
          f: imageReal ? fAbs : -fAbs,
          D,
        });
      }
    };
  }, [objectDistance, focalLength, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
  );
}

function drawArrowObject(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number,
  color: string
) {
  const headSize = 8;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x, baseY + height);
  ctx.stroke();

  const dir = height >= 0 ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x, baseY + height);
  ctx.lineTo(x - headSize / 2, baseY + height + dir * headSize);
  ctx.lineTo(x + headSize / 2, baseY + height + dir * headSize);
  ctx.closePath();
  ctx.fill();
}
