import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type p5 from "p5";

interface Props {
  params: Record<string, number | string>;
}

export default function BuoyancySimulation({ params }: Props) {
  const bodyVolume = Number(params["bodyVolume"] || 100);
  const material1 = Number(params["material1"] || 2700);
  const material2 = Number(params["material2"] || 7800);

  const { setup, draw } = useMemo(() => {
    const setup = (p: p5) => {
      p.createCanvas(700, 400);
    };

    const draw = (p: p5) => {
      p.background(26, 31, 34);

      const g = 9.8;
      const rhoWater = 1000;
      const fa = rhoWater * g * (bodyVolume * 1e-6);

      // Table
      p.fill(42, 50, 55);
      p.noStroke();
      p.rect(0, 320, 700, 80);
      p.fill(60, 70, 75);
      p.rect(0, 315, 700, 10);

      // Two cylinders with water
      const positions = [160, 360];
      const materials = [material1, material2];
      const labels = ["Тело 1", "Тело 2"];
      const colors = [
        [180, 140, 100],
        [140, 140, 160],
      ];

      positions.forEach((cx, idx) => {
        const cy = 160;
        const cw = 90;
        const ch = 180;
        const liquidH = 120;

        // Water
        p.fill(100, 200, 255, 140);
        p.noStroke();
        p.rect(cx - cw / 2 + 4, cy + ch / 2 - liquidH, cw - 8, liquidH);

        // Glass
        p.noFill();
        p.stroke(120, 140, 150, 150);
        p.strokeWeight(2);
        p.rect(cx - cw / 2, cy - ch / 2, cw, ch, 4);

        // Body
        const bodySize = 30 + bodyVolume * 0.15;
        const bodyY = cy + ch / 2 - liquidH + bodySize / 2 + 10;
        p.fill(colors[idx][0], colors[idx][1], colors[idx][2]);
        p.stroke(255, 255, 255, 100);
        p.strokeWeight(1);
        p.rect(cx - bodySize / 2, bodyY - bodySize / 2, bodySize, bodySize, 3);

        // Material label
        p.noStroke();
        p.fill(255);
        p.textSize(10);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(labels[idx], cx, bodyY);

        // F_A arrow up
        const arrowLen = Math.min(fa * 300, 60);
        p.stroke(100, 255, 150);
        p.strokeWeight(2);
        p.line(cx, bodyY + bodySize / 2 + 10, cx, bodyY + bodySize / 2 + 10 - arrowLen);
        p.line(cx - 5, bodyY + bodySize / 2 + 10 - arrowLen + 5, cx, bodyY + bodySize / 2 + 10 - arrowLen);
        p.line(cx + 5, bodyY + bodySize / 2 + 10 - arrowLen + 5, cx, bodyY + bodySize / 2 + 10 - arrowLen);
        p.noStroke();
        p.fill(100, 255, 150);
        p.textSize(10);
        p.textAlign(p.CENTER, p.TOP);
        p.text(`Fₐ = ${fa.toFixed(3)} Н`, cx, bodyY + bodySize / 2 + 15);
      });

      // Info panel
      p.fill(42, 50, 55);
      p.noStroke();
      p.rect(520, 80, 160, 220, 8);
      p.fill(255);
      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Сравнение:", 535, 95);
      p.textSize(11);
      p.fill(150, 160, 170);
      p.text(`Объём обоих: ${bodyVolume} см³`, 535, 125);
      p.text(`ρ₁ = ${materials[0]} кг/м³`, 535, 150);
      p.text(`ρ₂ = ${materials[1]} кг/м³`, 535, 170);
      p.text(`m₁ = ${((materials[0] * bodyVolume) / 1e6).toFixed(2)} кг`, 535, 195);
      p.text(`m₂ = ${((materials[1] * bodyVolume) / 1e6).toFixed(2)} кг`, 535, 215);
      p.fill(46, 255, 140);
      p.textSize(12);
      p.text(`Fₐ₁ = Fₐ₂ = ${fa.toFixed(3)} Н`, 535, 250);
      p.textSize(10);
      p.fill(180, 190, 200);
      p.text("Сила не зависит от массы", 535, 275);

      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Независимость Fₐ от массы", 350, 20);
    };

    return { setup, draw };
  }, [bodyVolume, material1, material2]);

  return <SimulationCanvas setup={setup} draw={draw} width={700} height={400} />;
}
