import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function FreeFallG({ params, isRunning }: Props) {
  const method = String(params["method"] || "pendulum");
  const length = Number(params["length"] || 0.5);
  const n = Number(params["oscillations"] || 20);
  const measuredTime = Number(params["measuredTime"] || 28.3);
  const height = Number(params["height"] || 2.0);
  const fallTime = Number(params["fallTime"] || 0.64);
  const trials = Number(params["trials"] || 5);

  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      if (method === "pendulum") {
        drawPendulum(ctx, w, h, length, n, measuredTime, isRunning, startTimeRef);
      } else {
        drawFall(ctx, w, h, height, fallTime, trials, isRunning, startTimeRef);
      }
    };
  }, [method, length, n, measuredTime, height, fallTime, trials, isRunning]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}

function drawPendulum(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  length: number,
  n: number,
  measuredTime: number,
  isRunning?: boolean,
  startTimeRef?: React.MutableRefObject<number>
) {
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
  if (isRunning && startTimeRef) {
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
  ctx.fillText("Расчёты (Способ 1):", 495, 75);

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
}

function drawFall(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  height: number,
  fallTime: number,
  trials: number,
  isRunning?: boolean,
  startTimeRef?: React.MutableRefObject<number>
) {
  const gCalc = 9.8;
  const gExp = (2 * height) / (fallTime * fallTime);
  const tTheory = Math.sqrt((2 * height) / gCalc);

  // Scale: max height 10m -> 300px
  const scale = 300 / 10;
  const groundY = 350;
  const startY = groundY - height * scale;
  const ballX = 200;

  // Ruler / height marks
  ctx.strokeStyle = "#37474f";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i += 1) {
    const y = groundY - i * scale;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(80, y);
    ctx.stroke();
    ctx.fillStyle = "#96a3ab";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${i} м`, 55, y);
  }

  // Ground line
  ctx.strokeStyle = "#647078";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, groundY);
  ctx.lineTo(320, groundY);
  ctx.stroke();

  // Tower / drop point
  ctx.fillStyle = "#505a60";
  ctx.fillRect(ballX - 4, startY - 10, 8, 10);

  // Falling ball animation
  let ballY = startY;
  if (isRunning && startTimeRef) {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    // Simulate free fall with g = 9.8
    // Use s = 0.5 * g * t^2 for position
    const fallenDist = 0.5 * gCalc * elapsed * elapsed * scale;
    ballY = startY + fallenDist;
    if (ballY > groundY - 14) ballY = groundY - 14;
  }

  // Ball
  ctx.fillStyle = "#2eff8c";
  ctx.beginPath();
  ctx.arc(ballX, ballY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1f22";
  ctx.beginPath();
  ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Height label
  ctx.fillStyle = "#96a3ab";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`h = ${height.toFixed(1)} м`, ballX + 20, (startY + groundY) / 2);

  // Dashed line for height
  ctx.strokeStyle = "rgba(46,255,140,0.3)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(ballX, startY);
  ctx.lineTo(ballX, groundY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Info panel
  ctx.fillStyle = "#3c474f";
  ctx.beginPath();
  ctx.roundRect(380, 60, 290, 260, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Расчёты (Способ 2):", 395, 75);

  ctx.fillStyle = "#96a3ab";
  ctx.font = "12px sans-serif";
  ctx.fillText(`Высота падения: ${height.toFixed(1)} м`, 395, 105);
  ctx.fillText(`Время падения: ${fallTime.toFixed(2)} с`, 395, 130);
  ctx.fillText(`Число измерений: ${trials}`, 395, 155);
  ctx.fillText(`t(теор) = ${tTheory.toFixed(2)} с`, 395, 180);

  ctx.fillStyle = "#2eff8c";
  ctx.font = "13px sans-serif";
  ctx.fillText(`g = 2h/t²`, 395, 210);
  ctx.font = "14px sans-serif";
  ctx.fillText(`g = ${gExp.toFixed(2)} м/с²`, 395, 240);

  ctx.fillStyle = "#ffcb3d";
  ctx.font = "12px sans-serif";
  ctx.fillText(`Совет: повторите опыт ${trials} раз`, 395, 270);
  ctx.fillText(`и используйте среднее время`, 395, 290);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Свободное падение тела", w / 2, 20);

  // Formula
  ctx.fillStyle = "#96a3ab";
  ctx.font = "11px sans-serif";
  ctx.fillText("h = gt²/2  →  g = 2h/t²", w / 2, 45);
}
