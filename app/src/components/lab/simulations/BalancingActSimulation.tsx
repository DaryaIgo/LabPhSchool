import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export default function BalancingActSimulation({
  params,
  onStateChange,
}: Props) {
  const leftMass = Number(params["leftMass"] || 100);
  const leftDistance = Number(params["leftDistance"] || 20);
  const rightMass = Number(params["rightMass"] || 100);
  const rightDistance = Number(params["rightDistance"] || 20);

  const g = 9.8;
  const leftForce = (leftMass / 1000) * g; // N
  const rightForce = (rightMass / 1000) * g; // N
  const leftMoment = leftForce * (leftDistance / 100); // N·m
  const rightMoment = rightForce * (rightDistance / 100); // N·m
  const diff = leftMoment - rightMoment;
  const isBalanced = Math.abs(diff) < 0.001;

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2 + 40;
      const scale = 5; // px per cm

      // Fulcrum (triangle)
      ctx.fillStyle = "#5c6b73";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 10);
      ctx.lineTo(centerX - 20, centerY + 50);
      ctx.lineTo(centerX + 20, centerY + 50);
      ctx.closePath();
      ctx.fill();

      // Beam
      const beamLength = 260;
      const beamY = centerY;

      // Tilt based on moment difference
      const maxTilt = 0.15; // radians
      const tilt = isBalanced
        ? 0
        : Math.max(-maxTilt, Math.min(maxTilt, diff * 2));

      ctx.save();
      ctx.translate(centerX, beamY);
      ctx.rotate(tilt);

      ctx.strokeStyle = "#96a3ab";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-beamLength / 2, 0);
      ctx.lineTo(beamLength / 2, 0);
      ctx.stroke();

      // Scale marks
      ctx.fillStyle = "#788389";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      for (let i = -25; i <= 25; i += 5) {
        const x = i * scale;
        ctx.beginPath();
        ctx.moveTo(x, -5);
        ctx.lineTo(x, 5);
        ctx.stroke();
        if (i !== 0) {
          ctx.fillText(`${Math.abs(i)}`, x, -10);
        }
      }

      // Left weight
      const leftX = -leftDistance * scale;
      const leftSize = 20 + leftMass / 25;
      ctx.fillStyle = "#ff7043";
      ctx.fillRect(leftX - leftSize / 2, -leftSize, leftSize, leftSize);
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px sans-serif";
      ctx.fillText(`${leftMass}г`, leftX, -leftSize - 8);

      // Right weight
      const rightX = rightDistance * scale;
      const rightSize = 20 + rightMass / 25;
      ctx.fillStyle = "#01acff";
      ctx.fillRect(rightX - rightSize / 2, -rightSize, rightSize, rightSize);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${rightMass}г`, rightX, -rightSize - 8);

      ctx.restore();

      // Balance indicator
      const indicatorY = 60;
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(centerX - 80, indicatorY - 20, 160, 40, 8);
      ctx.fill();

      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      if (isBalanced) {
        ctx.fillStyle = "#2eff8c";
        ctx.fillText("РАВНОВЕСИЕ", centerX, indicatorY + 5);
      } else if (diff > 0) {
        ctx.fillStyle = "#ff7043";
        ctx.fillText("Перевес влево", centerX, indicatorY + 5);
      } else {
        ctx.fillStyle = "#01acff";
        ctx.fillText("Перевес вправо", centerX, indicatorY + 5);
      }

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(80, 300, 540, 80, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Моменты силы относительно точки опоры", 95, 325);

      ctx.fillStyle = "#ff7043";
      ctx.font = "12px sans-serif";
      ctx.fillText(`M_лев = ${(leftMoment * 100).toFixed(1)} Н·см`, 95, 350);
      ctx.fillStyle = "#01acff";
      ctx.fillText(`M_прав = ${(rightMoment * 100).toFixed(1)} Н·см`, 95, 370);
      ctx.fillStyle = isBalanced ? "#2eff8c" : "#ffcb3d";
      ctx.fillText(`ΔM = ${(diff * 100).toFixed(2)} Н·см`, 300, 360);

      if (onStateChange) {
        onStateChange({
          leftMass,
          leftDistance,
          rightMass,
          rightDistance,
          leftMoment: leftMoment * 100,
          rightMoment: rightMoment * 100,
          diff: diff * 100,
        });
      }
    };
  }, [
    leftMass,
    leftDistance,
    rightMass,
    rightDistance,
    leftMoment,
    rightMoment,
    diff,
    isBalanced,
    onStateChange,
  ]);

  return (
    <SimulationCanvas draw={draw} width={700} height={400} isRunning={false} />
  );
}
