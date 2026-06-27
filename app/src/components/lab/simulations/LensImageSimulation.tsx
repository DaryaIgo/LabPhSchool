import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function LensImageSimulation({ params, onStateChange }: Props) {
  const objectDistance = Number(params["objectDistance"] || 30);
  const focalLength = Number(params["focalLength"] || 10);
  const objectHeight = Number(params["objectHeight"] || 3);

  const draw = useMemo(() => {
    const F = focalLength;
    const d = objectDistance;
    const h = objectHeight;
    let f = 0;
    let gamma = 0;
    let imageType = "";
    let imageDescription = "";
    let real = false;

    if (d > 2 * F) {
      f = 1 / (1 / F - 1 / d);
      gamma = f / d;
      imageType = "уменьшенное, перевёрнутое, действительное";
      imageDescription =
        "d > 2F: изображение уменьшенное, перевёрнутое, действительное";
      real = true;
    } else if (Math.abs(d - 2 * F) < 0.1) {
      f = 1 / (1 / F - 1 / d);
      gamma = f / d;
      imageType = "равное, перевёрнутое, действительное";
      imageDescription = "d = 2F: изображение равное по размеру, перевёрнутое";
      real = true;
    } else if (d > F && d < 2 * F) {
      f = 1 / (1 / F - 1 / d);
      gamma = f / d;
      imageType = "увеличенное, перевёрнутое, действительное";
      imageDescription =
        "F < d < 2F: изображение увеличенное, перевёрнутое, действительное";
      real = true;
    } else if (Math.abs(d - F) < 0.1) {
      f = Infinity;
      gamma = Infinity;
      imageType = "нет изображения";
      imageDescription = "d = F: лучи параллельны, изображение не получается";
      real = false;
    } else {
      f = 1 / (1 / F - 1 / d);
      gamma = Math.abs(f / d);
      imageType = "увеличенное, прямое, мнимое";
      imageDescription = "d < F: изображение увеличенное, прямое, мнимое";
      real = false;
    }

    const fAbs = Math.abs(f === Infinity ? 1000 : f);
    const imageHeight = real ? -h * gamma : h * gamma;

    return (ctx: CanvasRenderingContext2D, w: number, h2: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h2);

      const scale = 3.5;
      const lensX = w / 2;
      const axisY = h2 / 2;
      const focalPx = F * scale;
      const objectPx = Math.min(d * scale, lensX - 60);
      const imagePx = Math.min(fAbs * scale, lensX - 60);

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
      ctx.moveTo(lensX, axisY - 70);
      ctx.lineTo(lensX - 10, axisY - 55);
      ctx.lineTo(lensX + 10, axisY - 55);
      ctx.lineTo(lensX, axisY - 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lensX, axisY + 40);
      ctx.lineTo(lensX - 10, axisY + 55);
      ctx.lineTo(lensX + 10, axisY + 55);
      ctx.lineTo(lensX, axisY + 70);
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

      // Object
      const objectX = lensX - objectPx;
      const objPixelHeight = h * 8;
      drawArrowObject(ctx, objectX, axisY, -objPixelHeight, "#ff7043");

      ctx.fillStyle = "#ff7043";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("предмет", objectX, axisY - objPixelHeight - 4);

      // Image
      if (real) {
        const imageX = lensX + imagePx;
        drawArrowObject(ctx, imageX, axisY, imageHeight, "#2eff8c");

        // Principal rays
        ctx.strokeStyle = "rgba(255,112,67,0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(objectX, axisY - objPixelHeight);
        ctx.lineTo(lensX, axisY - objPixelHeight);
        ctx.lineTo(imageX, axisY + imageHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(objectX, axisY - objPixelHeight);
        ctx.lineTo(lensX, axisY);
        ctx.lineTo(imageX, axisY + imageHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#2eff8c";
        ctx.fillText("изображение", imageX, axisY + Math.abs(imageHeight) + 12);
      } else if (!Number.isFinite(f)) {
        // d = F rays parallel
        ctx.strokeStyle = "rgba(255,112,67,0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(objectX, axisY - objPixelHeight);
        ctx.lineTo(lensX, axisY - objPixelHeight);
        ctx.lineTo(w - 40, axisY - objPixelHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(objectX, axisY - objPixelHeight);
        ctx.lineTo(lensX, axisY);
        ctx.lineTo(w - 40, axisY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Virtual image
        const imageX = lensX - imagePx;
        drawArrowObject(ctx, imageX, axisY, imageHeight, "#2eff8c");

        ctx.fillStyle = "#2eff8c";
        ctx.fillText("мнимое изображение", imageX, axisY - imageHeight - 4);
      }

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(40, 30, 300, 150, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Получение изображения в линзе", 55, 45);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`F = ${F.toFixed(1)} см, d = ${d.toFixed(1)} см`, 55, 75);
      ctx.fillText(`Гамма Γ = ${gamma.toFixed(2)}`, 55, 95);
      ctx.fillStyle = real ? "#2eff8c" : "#01acff";
      ctx.fillText(imageType, 55, 115);

      ctx.fillStyle = "#ffffff";
      ctx.font = "11px sans-serif";
      ctx.fillText(imageDescription, 55, 140);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Изображения, получаемые собирающей линзой", w / 2, 16);

      if (onStateChange) {
        onStateChange({
          F,
          d,
          f: real ? fAbs : -fAbs,
          gamma: Number.isFinite(gamma) ? gamma : 0,
        });
      }
    };
  }, [objectDistance, focalLength, objectHeight, onStateChange]);

  return (
    <SimulationCanvas draw={draw} width={700} height={400} isRunning={false} />
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
