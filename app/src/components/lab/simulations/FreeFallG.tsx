import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function FreeFallG({ params, isRunning }: Props) {
  const length = Number(params["length"] || 0.5);
  const n = Number(params["oscillations"] || 20);
  const measuredTime = Number(params["measuredTime"] || 28.3);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const gCalc = 9.8;
      const Ttheory = 2 * Math.PI * Math.sqrt(length / gCalc);
      const Texp = measuredTime / n;
      const gExp = (4 * Math.PI * Math.PI * length) / (Texp * Texp);

      // Stand
      ctx.fillStyle = "#505a60";
      ctx.fillRect(340, 40, 20, 40);
      ctx.fillStyle = "#647078";
      ctx.fillRect(320, 80, 60, 8);

      // Pivot
      const pivotX = 350;
      const pivotY = 88;

      // Pendulum animation
      let swingAngle = 0;
      if (isRunning) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        swingAngle = Math.sin(elapsed * (2 * Math.PI / Ttheory)) * 0.15;
      }

      const maxLenPx = 250;
      const lenPx = Math.min(length * maxLenPx, maxLenPx);
      const bobX = pivotX + lenPx * Math.sin(swingAngle);
      const bobY = pivotY + lenPx * Math.cos(swingAngle);

      ctx.strokeStyle = "#b4bcc0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Bob
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1f22";
      ctx.beginPath();
      ctx.arc(bobX, bobY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Trace arc
      ctx.strokeStyle = "rgba(46,255,140,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, lenPx, -0.2, 0.2);
      ctx.stroke();

      // Length label
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `l = ${length.toFixed(2)} м`,
        pivotX + 12,
        (pivotY + bobY) / 2
      );

      // Info panel
      ctx.fillStyle = "#3c474f";
      ctx.beginPath();
      ctx.roundRect(480, 60, 200, 260, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Расчёты:", 495, 75);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Длина нити: ${length.toFixed(2)} м`, 495, 105);
      ctx.fillText(`Число колебаний: ${n}`, 495, 130);
      ctx.fillText(`Время: ${measuredTime.toFixed(1)} с`, 495, 155);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "13px sans-serif";
      ctx.fillText(`T = t/n = ${Texp.toFixed(2)} с`, 495, 185);
      ctx.fillText(`T(теор) = ${Ttheory.toFixed(2)} с`, 495, 210);
      ctx.fillText(`g = 4π²l/T²`, 495, 240);
      ctx.font = "14px sans-serif";
      ctx.fillText(`g = ${gExp.toFixed(2)} м/с²`, 495, 270);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Математический маятник", w / 2, 20);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("T = 2π√(l/g)", w / 2, 45);
    };
  }, [length, n, measuredTime, isRunning]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}
