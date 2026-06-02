import { useRef, useEffect } from "react";

interface SimulationCanvasProps {
  setup?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  width?: number;
  height?: number;
  isRunning?: boolean;
  className?: string;
}

export default function SimulationCanvas({
  setup,
  draw,
  width = 700,
  height = 400,
  isRunning = false,
  className = "",
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const setupRef = useRef(setup);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    drawRef.current = draw;
    setupRef.current = setup;
  }, [draw, setup]);

  // Draw immediately when draw/setup/dimensions change (even when stopped)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (setupRef.current) {
      setupRef.current(ctx, width, height);
    }
    drawRef.current(ctx, width, height);
  }, [draw, setup, width, height]);

  // Animation loop — only when isRunning
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cancelAnimationFrame(rafRef.current);

    if (!isRunning) return;

    const loop = () => {
      if (setupRef.current) {
        setupRef.current(ctx, width, height);
      }
      drawRef.current(ctx, width, height);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`bg-[#1a1f22] rounded-xl border border-[#37474f] ${className}`}
    />
  );
}
