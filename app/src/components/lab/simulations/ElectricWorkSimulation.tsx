import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type p5 from "p5";

interface Props {
  params: Record<string, number | string>;
}

export default function ElectricWorkSimulation({ params }: Props) {
  const voltage = Number(params["voltage"] || 6);
  const resistance = Number(params["resistance"] || 10);
  const time = Number(params["time"] || 60);

  const current = voltage / resistance;
  const power = voltage * current;
  const work = power * time;

  const { setup, draw } = useMemo(() => {
    const setup = (p: p5) => {
      p.createCanvas(700, 400);
    };

    const draw = (p: p5) => {
      p.background(26, 31, 34);

      const cx = 200;
      const cy = 200;

      // Circuit board
      p.fill(42, 50, 55);
      p.noStroke();
      p.rect(cx - 150, cy - 100, 300, 200, 8);
      p.stroke(60, 70, 75);
      p.strokeWeight(2);
      p.noFill();
      p.rect(cx - 140, cy - 90, 280, 180, 4);

      // Battery
      p.fill(100, 200, 100);
      p.noStroke();
      p.rect(cx - 120, cy - 30, 40, 60, 3);
      p.fill(255);
      p.textSize(10);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(`${voltage}В`, cx - 100, cy);

      // Switch
      p.fill(200, 200, 100);
      p.rect(cx - 50, cy - 10, 30, 20, 2);
      p.fill(255);
      p.textSize(8);
      p.text("K", cx - 35, cy);

      // Resistor
      p.fill(200, 100, 100);
      p.rect(cx + 30, cy - 15, 60, 30, 3);
      p.fill(255);
      p.textSize(10);
      p.text(`${resistance}Ом`, cx + 60, cy);

      // Ammeter
      p.fill(50, 50, 60);
      p.ellipse(cx + 60, cy + 60, 40, 40);
      p.fill(46, 255, 140);
      p.textSize(10);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(`${current.toFixed(2)}А`, cx + 60, cy + 60);

      // Voltmeter (parallel)
      p.fill(50, 50, 60);
      p.ellipse(cx + 60, cy - 60, 40, 40);
      p.fill(100, 200, 255);
      p.text(`${voltage.toFixed(1)}В`, cx + 60, cy - 60);

      // Wires
      p.stroke(150, 160, 170);
      p.strokeWeight(2);
      p.noFill();
      // Top wire
      p.line(cx - 100, cy - 30, cx - 100, cy - 70);
      p.line(cx - 100, cy - 70, cx + 60, cy - 70);
      p.line(cx + 60, cy - 70, cx + 60, cy - 80);
      // Bottom wire
      p.line(cx - 100, cy + 30, cx - 100, cy + 70);
      p.line(cx - 100, cy + 70, cx + 60, cy + 70);
      p.line(cx + 60, cy + 70, cx + 60, cy + 40);
      // Through resistor
      p.line(cx - 35, cy, cx + 30, cy);
      p.line(cx + 90, cy, cx + 120, cy);
      p.line(cx + 120, cy, cx + 120, cy - 70);

      // Electron animation
      const t = (Date.now() / 1000) * current * 2;
      p.fill(255, 255, 0);
      p.noStroke();
      for (let i = 0; i < 5; i++) {
        const offset = (i / 5) * 200;
        const x = cx - 80 + ((t * 20 + offset) % 200);
        p.ellipse(x, cy - 70, 4, 4);
      }

      // Heat glow
      const heatAlpha = Math.min(power * 5, 200);
      p.fill(255, 100, 50, heatAlpha);
      p.noStroke();
      p.rect(cx + 30, cy - 15, 60, 30, 3);

      // Info panel
      p.fill(42, 50, 55);
      p.noStroke();
      p.rect(420, 80, 250, 240, 8);
      p.fill(255);
      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Измерения:", 435, 95);
      p.textSize(12);
      p.fill(150, 160, 170);
      p.text(`Напряжение U = ${voltage} В`, 435, 125);
      p.text(`Сопротивление R = ${resistance} Ом`, 435, 150);
      p.text(`Время t = ${time} с`, 435, 175);
      p.fill(46, 255, 140);
      p.textSize(14);
      p.text(`I = ${current.toFixed(2)} А`, 435, 205);
      p.text(`P = ${power.toFixed(1)} Вт`, 435, 230);
      p.text(`A = ${work.toFixed(1)} Дж`, 435, 255);
      p.textSize(10);
      p.fill(180, 190, 200);
      p.text(`Q = ${work.toFixed(1)} Дж (Джоуль–Ленц)`, 435, 285);

      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Работа электрического тока", 350, 20);
    };

    return { setup, draw };
  }, [voltage, resistance, time, current, power, work]);

  return <SimulationCanvas setup={setup} draw={draw} width={700} height={400} />;
}
