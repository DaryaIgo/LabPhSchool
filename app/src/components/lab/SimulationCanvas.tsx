import { useRef, useEffect } from "react";
import p5 from "p5";

interface SimulationCanvasProps {
  setup?: (p: p5) => void;
  draw: (p: p5) => void;
  width?: number;
  height?: number;
  className?: string;
}

export default function SimulationCanvas({
  setup,
  draw,
  width = 600,
  height = 400,
  className = "",
}: SimulationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef(draw);
  const setupRef = useRef(setup);

  useEffect(() => {
    drawRef.current = draw;
    setupRef.current = setup;
  }, [draw, setup]);

  useEffect(() => {
    if (!containerRef.current) return;
    const sketch = (p: p5) => {
      p.setup = () => {
        if (setupRef.current) {
          setupRef.current(p);
        } else {
          p.createCanvas(width, height);
        }
      };
      p.draw = () => {
        drawRef.current(p);
      };
    };
    const instance = new p5(sketch, containerRef.current);
    return () => {
      instance.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ maxWidth: width, maxHeight: height }}
      className={`bg-[#1a1f22] rounded-xl border border-[#37474f] overflow-hidden inline-block ${className}`}
    />
  );
}
