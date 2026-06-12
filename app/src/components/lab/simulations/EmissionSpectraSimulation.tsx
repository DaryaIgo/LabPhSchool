import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

const SUBSTANCE_LINES: Record<string, { wavelength: number; color: string; intensity: number }[]> = {
  hydrogen: [
    { wavelength: 656, color: "#ff0000", intensity: 1.0 },
    { wavelength: 486, color: "#00aaff", intensity: 0.9 },
    { wavelength: 434, color: "#4400ff", intensity: 0.7 },
    { wavelength: 410, color: "#7700ff", intensity: 0.5 },
  ],
  helium: [
    { wavelength: 668, color: "#ff2200", intensity: 0.8 },
    { wavelength: 588, color: "#ffcc00", intensity: 1.0 },
    { wavelength: 502, color: "#00ff66", intensity: 0.7 },
    { wavelength: 447, color: "#0044ff", intensity: 0.8 },
    { wavelength: 388, color: "#aa00ff", intensity: 0.5 },
  ],
  neon: [
    { wavelength: 693, color: "#ff0000", intensity: 0.9 },
    { wavelength: 640, color: "#ff4400", intensity: 1.0 },
    { wavelength: 615, color: "#ff6600", intensity: 0.9 },
    { wavelength: 585, color: "#ffcc00", intensity: 1.0 },
    { wavelength: 540, color: "#66ff00", intensity: 0.6 },
  ],
  sodium: [
    { wavelength: 589, color: "#ffcc00", intensity: 1.0 },
    { wavelength: 589.6, color: "#ffcc00", intensity: 1.0 },
  ],
  mercury: [
    { wavelength: 578, color: "#ffcc00", intensity: 0.8 },
    { wavelength: 546, color: "#00ff44", intensity: 1.0 },
    { wavelength: 436, color: "#0044ff", intensity: 0.9 },
    { wavelength: 405, color: "#6600ff", intensity: 0.7 },
  ],
  tungsten: [],
};

const SUBSTANCE_NAMES: Record<string, string> = {
  hydrogen: "Водород",
  helium: "Гелий",
  neon: "Неон",
  sodium: "Натрий",
  mercury: "Ртуть",
  tungsten: "Вольфрам",
};

export default function EmissionSpectraSimulation({
  params,
  onStateChange,
}: Props) {
  const substance = String(params["substance"] || "hydrogen");
  const spectrumType = String(params["spectrumType"] || "line");

  const draw = useMemo(() => {
    const lines = SUBSTANCE_LINES[substance] || [];
    const isContinuous = spectrumType === "continuous" || substance === "tungsten";

    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      const spectrumY = h / 2 - 30;
      const spectrumH = 60;
      const startX = 80;
      const endX = w - 80;
      const minLambda = 380;
      const maxLambda = 750;

      // Scale
      ctx.fillStyle = "#5c6b73";
      ctx.fillRect(startX, spectrumY + spectrumH + 10, endX - startX, 2);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let lambda = 400; lambda <= 700; lambda += 50) {
        const x = startX + ((lambda - minLambda) / (maxLambda - minLambda)) * (endX - startX);
        ctx.beginPath();
        ctx.moveTo(x, spectrumY + spectrumH + 10);
        ctx.lineTo(x, spectrumY + spectrumH + 16);
        ctx.stroke();
        ctx.fillText(`${lambda}`, x, spectrumY + spectrumH + 20);
      }

      // Spectrum
      if (isContinuous) {
        // Continuous spectrum gradient
        const gradient = ctx.createLinearGradient(startX, 0, endX, 0);
        gradient.addColorStop(0, "#6600ff");
        gradient.addColorStop(0.15, "#0000ff");
        gradient.addColorStop(0.3, "#00aaff");
        gradient.addColorStop(0.45, "#00ff44");
        gradient.addColorStop(0.6, "#ffcc00");
        gradient.addColorStop(0.8, "#ff4400");
        gradient.addColorStop(1, "#ff0000");

        ctx.fillStyle = gradient;
        ctx.fillRect(startX, spectrumY, endX - startX, spectrumH);

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("Сплошной спектр", (startX + endX) / 2, spectrumY - 8);
      } else {
        // Dark background for line spectrum
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(startX, spectrumY, endX - startX, spectrumH);

        // Draw spectral lines
        for (const line of lines) {
          const x = startX + ((line.wavelength - minLambda) / (maxLambda - minLambda)) * (endX - startX);
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 2 + line.intensity * 2;
          ctx.globalAlpha = 0.6 + line.intensity * 0.4;
          ctx.beginPath();
          ctx.moveTo(x, spectrumY);
          ctx.lineTo(x, spectrumY + spectrumH);
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Label
          ctx.fillStyle = line.color;
          ctx.font = "9px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(`${line.wavelength.toFixed(0)}`, x, spectrumY - 4);
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("Линейчатый спектр", (startX + endX) / 2, spectrumY - 25);
      }

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(40, 30, 300, 110, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Спектры испускания", 55, 45);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Вещество: ${SUBSTANCE_NAMES[substance] || substance}`, 55, 75);
      ctx.fillText(`Тип спектра: ${isContinuous ? "сплошной" : "линейчатый"}`, 55, 95);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Спектры испускания различных веществ", w / 2, 16);

      // Formula
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText("hν = E_m − E_n", w / 2, 42);

      if (onStateChange) {
        onStateChange({
          substance: substance === "tungsten" ? 1 : 0,
          spectrumType: isContinuous ? 1 : 0,
        });
      }
    };
  }, [substance, spectrumType, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
  );
}
