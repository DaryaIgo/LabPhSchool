import { useRef, useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type p5 from "p5";

interface DensitySimulationProps {
  params: Record<string, number | string>;
}

export default function DensitySimulation({ params }: DensitySimulationProps) {
  const mass = Number(params["mass"] || 200);
  const volume = Number(params["volume"] || 50);
  const liquidDensity = Number(params["liquidDensity"] || 1000);
  const imgRef = useRef<p5 | null>(null);

  const { setup, draw } = useMemo(() => {
    const setup = (p: p5) => {
      p.createCanvas(700, 400);
      imgRef.current = p.createGraphics(700, 400) as unknown as p5;
    };

    const draw = (p: p5) => {
      const g = imgRef.current;
      if (!g) return;

      // Background
      g.background(26, 31, 34);

      // Table
      g.fill(42, 50, 55);
      g.noStroke();
      g.rect(0, 320, 700, 80);
      g.fill(60, 70, 75);
      g.rect(0, 315, 700, 10);

      // Graduated cylinder
      const cx = 180;
      const cy = 200;
      const cw = 100;
      const ch = 200;

      // Liquid
      const liquidHeight = 120 + volume * 0.4;
      const liquidColor = liquidDensity > 1200 ? [100, 180, 255] : liquidDensity > 900 ? [100, 200, 255] : [180, 220, 100];
      g.fill(liquidColor[0], liquidColor[1], liquidColor[2], 120);
      g.noStroke();
      g.rect(cx - cw / 2 + 4, cy + ch / 2 - liquidHeight, cw - 8, liquidHeight);

      // Cylinder glass
      g.noFill();
      g.stroke(120, 140, 150, 150);
      g.strokeWeight(2);
      g.rect(cx - cw / 2, cy - ch / 2, cw, ch, 4);

      // Scale marks
      g.stroke(120, 140, 150, 100);
      g.strokeWeight(1);
      for (let i = 0; i <= 10; i++) {
        const y = cy + ch / 2 - (i * ch) / 10;
        g.line(cx - cw / 2 + 10, y, cx - cw / 2 + 25, y);
        g.noStroke();
        g.fill(150, 160, 170);
        g.textSize(10);
        g.textAlign(g.LEFT, g.CENTER);
        g.text(String(i * 20), cx - cw / 2 + 30, y);
      }

      // Body (cube)
      const bodySize = Math.min(40 + volume * 0.15, 70);
      const bodyY = cy + ch / 2 - liquidHeight + bodySize / 2 + 10;
      const density = mass / volume;
      const liquidD = liquidDensity / 1000;
      const bodyColor = density > liquidD ? [200, 100, 100] : [100, 200, 150];

      g.fill(bodyColor[0], bodyColor[1], bodyColor[2]);
      g.stroke(255, 255, 255, 100);
      g.strokeWeight(1);
      g.rect(cx - bodySize / 2, bodyY - bodySize / 2, bodySize, bodySize, 3);

      // Body label
      g.noStroke();
      g.fill(255);
      g.textSize(11);
      g.textAlign(g.CENTER, g.CENTER);
      g.text(`${mass}г`, cx, bodyY);

      // Scale on the left
      g.fill(60, 70, 75);
      g.noStroke();
      g.rect(480, 100, 180, 220, 8);
      g.fill(255);
      g.textSize(14);
      g.textAlign(g.LEFT, g.TOP);
      g.text("Показания:", 495, 115);
      g.textSize(12);
      g.fill(150, 160, 170);
      g.text(`Масса тела: ${mass} г`, 495, 145);
      g.text(`Объём тела: ${volume} см³`, 495, 170);
      g.text(`Плотность жидк.: ${liquidDensity} кг/м³`, 495, 195);
      g.fill(46, 255, 140);
      g.textSize(14);
      g.text(`ρ = ${(mass / volume).toFixed(2)} г/см³`, 495, 230);
      g.text(`ρ = ${((mass / volume) * 1000).toFixed(0)} кг/м³`, 495, 255);

      // Arrows
      if (density > liquidD) {
        // Down arrow (gravity)
        g.stroke(255, 100, 100);
        g.strokeWeight(2);
        g.line(cx, bodyY - bodySize / 2 - 30, cx, bodyY - bodySize / 2 - 5);
        g.line(cx - 5, bodyY - bodySize / 2 - 10, cx, bodyY - bodySize / 2 - 5);
        g.line(cx + 5, bodyY - bodySize / 2 - 10, cx, bodyY - bodySize / 2 - 5);
        g.noStroke();
        g.fill(255, 100, 100);
        g.text("Fтяж", cx + 15, bodyY - bodySize / 2 - 20);
      } else {
        // Up arrow (buoyancy)
        g.stroke(100, 255, 150);
        g.strokeWeight(2);
        g.line(cx, bodyY + bodySize / 2 + 30, cx, bodyY + bodySize / 2 + 5);
        g.line(cx - 5, bodyY + bodySize / 2 + 10, cx, bodyY + bodySize / 2 + 5);
        g.line(cx + 5, bodyY + bodySize / 2 + 10, cx, bodyY + bodySize / 2 + 5);
        g.noStroke();
        g.fill(100, 255, 150);
        g.text("Fₐ", cx + 15, bodyY + bodySize / 2 + 20);
      }

      // Title
      g.fill(255);
      g.textSize(16);
      g.textAlign(g.CENTER, g.TOP);
      g.text("Измерение плотности вещества", 350, 20);

      p.image(g as unknown as p5.Image, 0, 0);
    };

    return { setup, draw };
  }, [mass, volume, liquidDensity]);

  return <SimulationCanvas setup={setup} draw={draw} width={700} height={400} />;
}
