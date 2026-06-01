import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type p5 from "p5";

interface Props {
  params: Record<string, number | string>;
}

export default function ArchimedesSimulation({ params }: Props) {
  const bodyVolume = Number(params["bodyVolume"] || 100);
  const immersionLevel = Number(params["immersionLevel"] || 50);
  const liquidDensity = Number(params["liquidDensity"] || 1000);

  const { setup, draw } = useMemo(() => {
    const setup = (p: p5) => {
      p.createCanvas(700, 400);
    };

    const draw = (p: p5) => {
      p.background(26, 31, 34);

      const cx = 200;
      const cy = 180;
      const cw = 120;
      const ch = 220;

      // Liquid
      const liquidH = 160;
      const liquidColor =
        liquidDensity > 13000
          ? [180, 180, 200]
          : liquidDensity > 1200
            ? [100, 180, 255]
            : [100, 200, 255];
      p.fill(liquidColor[0], liquidColor[1], liquidColor[2], 140);
      p.noStroke();
      p.rect(cx - cw / 2 + 4, cy + ch / 2 - liquidH, cw - 8, liquidH);

      // Cylinder
      p.noFill();
      p.stroke(120, 140, 150, 150);
      p.strokeWeight(2);
      p.rect(cx - cw / 2, cy - ch / 2, cw, ch, 4);

      // Scale
      p.stroke(120, 140, 150, 100);
      p.strokeWeight(1);
      for (let i = 0; i <= 10; i++) {
        const y = cy + ch / 2 - (i * ch) / 10;
        p.line(cx - cw / 2 + 10, y, cx - cw / 2 + 25, y);
        p.noStroke();
        p.fill(150, 160, 170);
        p.textSize(10);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(String(i * 20), cx - cw / 2 + 30, y);
      }

      // Body
      const bodySize = 30 + bodyVolume * 0.2;
      const immersionPixels = (bodySize * immersionLevel) / 100;
      const bodyY = cy + ch / 2 - liquidH + bodySize / 2 - (bodySize - immersionPixels) + 10;

      p.fill(200, 160, 80);
      p.stroke(255, 255, 255, 100);
      p.strokeWeight(1);
      p.rect(cx - bodySize / 2, bodyY - bodySize / 2, bodySize, bodySize, 3);

      // Water level rise
      const rise = (bodyVolume * immersionLevel) / 100 / 20;
      p.fill(liquidColor[0], liquidColor[1], liquidColor[2], 80);
      p.noStroke();
      p.rect(cx - cw / 2 + 4, cy + ch / 2 - liquidH - rise, cw - 8, rise);

      // Force vectors
      const g = 9.8;
      const fa = (liquidDensity * g * (bodyVolume * 1e-6) * (immersionLevel / 100));
      const arrowLen = Math.min(fa * 200, 80);

      // F_A up
      p.stroke(100, 255, 150);
      p.strokeWeight(2);
      p.line(cx, bodyY + bodySize / 2 + 10, cx, bodyY + bodySize / 2 + 10 - arrowLen);
      p.line(cx - 5, bodyY + bodySize / 2 + 10 - arrowLen + 5, cx, bodyY + bodySize / 2 + 10 - arrowLen);
      p.line(cx + 5, bodyY + bodySize / 2 + 10 - arrowLen + 5, cx, bodyY + bodySize / 2 + 10 - arrowLen);
      p.noStroke();
      p.fill(100, 255, 150);
      p.textSize(11);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(`Fₐ = ${fa.toFixed(3)} Н`, cx + 15, bodyY + bodySize / 2 + 10 - arrowLen / 2);

      // F_gravity down
      const fg = arrowLen * 1.2;
      p.stroke(255, 100, 100);
      p.strokeWeight(2);
      p.line(cx, bodyY - bodySize / 2 - 10, cx, bodyY - bodySize / 2 - 10 + fg);
      p.line(cx - 5, bodyY - bodySize / 2 - 10 + fg - 5, cx, bodyY - bodySize / 2 - 10 + fg);
      p.line(cx + 5, bodyY - bodySize / 2 - 10 + fg - 5, cx, bodyY - bodySize / 2 - 10 + fg);
      p.noStroke();
      p.fill(255, 100, 100);
      p.text("Fтяж", cx + 15, bodyY - bodySize / 2 - 10 + fg / 2);

      // Info panel
      p.fill(42, 50, 55);
      p.noStroke();
      p.rect(400, 80, 260, 240, 8);
      p.fill(255);
      p.textSize(14);
      p.textAlign(p.LEFT, p.TOP);
      p.text("Параметры:", 415, 95);
      p.textSize(12);
      p.fill(150, 160, 170);
      p.text(`Объём тела: ${bodyVolume} см³`, 415, 125);
      p.text(`Погружение: ${immersionLevel}%`, 415, 150);
      p.text(`Плотность жидк.: ${liquidDensity} кг/м³`, 415, 175);
      p.fill(46, 255, 140);
      p.textSize(14);
      p.text(`Fₐ = ${fa.toFixed(3)} Н`, 415, 210);
      p.textSize(11);
      p.fill(180, 190, 200);
      p.text(`Fₐ = ρж·g·Vпогр`, 415, 240);
      p.text(`Vпогр = ${((bodyVolume * immersionLevel) / 100).toFixed(1)} см³`, 415, 260);

      p.fill(255);
      p.textSize(16);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Архимедова сила", 350, 20);
    };

    return { setup, draw };
  }, [bodyVolume, immersionLevel, liquidDensity]);

  return <SimulationCanvas setup={setup} draw={draw} width={700} height={400} />;
}
