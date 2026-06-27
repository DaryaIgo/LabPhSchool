import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function ElectricWorkSimulation({ params }: Props) {
  const voltage = Number(params["voltage"] || 6);
  const resistance = Number(params["resistance"] || 10);
  const time = Number(params["time"] || 60);

  const current = voltage / resistance;
  const power = voltage * current;
  const work = power * time;

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      // Circuit diagram
      const cx = 350;
      const cy = 200;

      // Battery
      ctx.strokeStyle = "#ffc832";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy - 60);
      ctx.lineTo(cx - 80, cy + 60);
      ctx.stroke();
      // Battery terminals
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy - 20);
      ctx.lineTo(cx - 70, cy - 20);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy + 20);
      ctx.lineTo(cx - 75, cy + 20);
      ctx.stroke();

      // Resistor
      ctx.strokeStyle = "#c86464";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 60);
      ctx.lineTo(cx + 20, cy - 60);
      ctx.lineTo(cx + 30, cy - 50);
      ctx.lineTo(cx + 40, cy - 70);
      ctx.lineTo(cx + 50, cy - 50);
      ctx.lineTo(cx + 60, cy - 70);
      ctx.lineTo(cx + 70, cy - 50);
      ctx.lineTo(cx + 80, cy - 60);
      ctx.lineTo(cx + 120, cy - 60);
      ctx.stroke();

      // Connecting wires
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy - 60);
      ctx.lineTo(cx - 20, cy - 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 120, cy - 60);
      ctx.lineTo(cx + 120, cy + 60);
      ctx.lineTo(cx - 80, cy + 60);
      ctx.stroke();

      // Ammeter symbol
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + 50, cy - 60, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#00aaff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("A", cx + 50, cy - 60);

      // Voltmeter symbol
      ctx.beginPath();
      ctx.arc(cx + 50, cy + 80, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("V", cx + 50, cy + 80);
      // Voltmeter wires
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 50, cy - 60);
      ctx.lineTo(cx + 50, cy + 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 80);
      ctx.lineTo(cx - 80, cy + 80);
      ctx.lineTo(cx - 80, cy + 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 70, cy + 80);
      ctx.lineTo(cx + 120, cy + 80);
      ctx.lineTo(cx + 120, cy + 60);
      ctx.stroke();

      // Current arrow
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 90, cy - 60);
      ctx.lineTo(cx + 110, cy - 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 105, cy - 65);
      ctx.lineTo(cx + 110, cy - 60);
      ctx.lineTo(cx + 105, cy - 55);
      ctx.stroke();

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
      ctx.fillText(`Напряжение: ${voltage} В`, 495, 105);
      ctx.fillText(`Сопротивление: ${resistance} Ом`, 495, 130);
      ctx.fillText(`Время: ${time} с`, 495, 155);

      ctx.fillStyle = "#00aaff";
      ctx.font = "13px sans-serif";
      ctx.fillText(`I = ${current.toFixed(2)} А`, 495, 185);
      ctx.fillText(`P = ${power.toFixed(1)} Вт`, 495, 210);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "14px sans-serif";
      ctx.fillText(`A = ${work.toFixed(1)} Дж`, 495, 240);
      ctx.fillText(`Q = ${work.toFixed(1)} Дж`, 495, 265);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Измерение работы тока", w / 2, 20);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "11px sans-serif";
      ctx.fillText("A = U·I·t = I²·R·t", w / 2, 45);
    };
  }, [voltage, resistance, time, current, power, work]);

  return <SimulationCanvas draw={draw} width={700} height={400} />;
}
