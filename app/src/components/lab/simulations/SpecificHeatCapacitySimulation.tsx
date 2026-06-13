import { useMemo } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";

interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

const materialData: Record<string, { name: string; c: number }> = {
  aluminum: { name: "Алюминий", c: 920 },
  copper: { name: "Медь", c: 390 },
  steel: { name: "Сталь", c: 500 },
  lead: { name: "Свинец", c: 130 },
};

export default function SpecificHeatCapacitySimulation({
  params,
  onStateChange,
}: Props) {
  const bodyMass = Number(params["bodyMass"] || 200); // g
  const waterMass = Number(params["waterMass"] || 200); // g
  const bodyTemp = Number(params["bodyTemp"] || 100); // °C
  const waterTemp = Number(params["waterTemp"] || 20); // °C
  const material = String(params["material"] || "aluminum");

  const cWater = 4200;
  const tabularC = materialData[material]?.c ?? 920;
  const mt = bodyMass / 1000;
  const mw = waterMass / 1000;

  // Heat balance: c_t * mt * (T_t - T_eq) = c_w * mw * (T_eq - T_w)
  const equilibriumTemp =
    (tabularC * mt * bodyTemp + cWater * mw * waterTemp) /
    (tabularC * mt + cWater * mw);

  const measuredC =
    (cWater * mw * (equilibriumTemp - waterTemp)) /
    (mt * (bodyTemp - equilibriumTemp));

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const bg = "#1a1f22";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Calorimeter cup
      const cupX = 120;
      const cupY = 130;
      const cupW = 160;
      const cupH = 140;

      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cupX, cupY);
      ctx.lineTo(cupX, cupY + cupH);
      ctx.lineTo(cupX + cupW, cupY + cupH);
      ctx.lineTo(cupX + cupW, cupY);
      ctx.stroke();

      // Water
      const waterLevel = 80;
      ctx.fillStyle = "rgba(1, 172, 255, 0.25)";
      ctx.fillRect(cupX + 3, cupY + cupH - waterLevel, cupW - 6, waterLevel);

      // Body block
      const bodySize = 50;
      ctx.fillStyle = "#ff7043";
      ctx.fillRect(
        cupX + cupW / 2 - bodySize / 2,
        cupY + cupH - waterLevel - bodySize + 10,
        bodySize,
        bodySize
      );
      ctx.fillStyle = "#1a1f22";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        materialData[material]?.name || "",
        cupX + cupW / 2,
        cupY + cupH - waterLevel - bodySize / 2 + 14
      );

      // Thermometers
      const thermX1 = cupX - 30;
      const thermY = cupY + 20;
      const thermH = 100;
      ctx.strokeStyle = "#788389";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(thermX1, thermY);
      ctx.lineTo(thermX1, thermY + thermH);
      ctx.stroke();
      ctx.fillStyle = "#ff7043";
      const mercury1 = ((bodyTemp - 0) / 150) * thermH;
      ctx.fillRect(thermX1 - 3, thermY + thermH - mercury1, 6, mercury1);
      ctx.beginPath();
      ctx.arc(thermX1, thermY + thermH, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px sans-serif";
      ctx.fillText(`T_т=${bodyTemp.toFixed(0)}°C`, thermX1 - 35, thermY + 10);

      const thermX2 = cupX + cupW + 30;
      ctx.beginPath();
      ctx.moveTo(thermX2, thermY);
      ctx.lineTo(thermX2, thermY + thermH);
      ctx.stroke();
      ctx.fillStyle = "#01acff";
      const mercury2 = ((equilibriumTemp - 0) / 150) * thermH;
      ctx.fillRect(thermX2 - 3, thermY + thermH - mercury2, 6, mercury2);
      ctx.beginPath();
      ctx.arc(thermX2, thermY + thermH, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        `T_р=${equilibriumTemp.toFixed(1)}°C`,
        thermX2 + 40,
        thermY + thermH - mercury2
      );

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.beginPath();
      ctx.roundRect(320, 80, 340, 220, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Тепловой баланс в калориметре", 340, 110);

      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Масса тела: ${bodyMass.toFixed(0)} г`, 340, 140);
      ctx.fillText(`Масса воды: ${waterMass.toFixed(0)} г`, 340, 162);
      ctx.fillText(
        `Начальная T тела: ${bodyTemp.toFixed(0)} °C`,
        340,
        184
      );
      ctx.fillText(
        `Начальная T воды: ${waterTemp.toFixed(0)} °C`,
        340,
        206
      );

      ctx.fillStyle = "#2eff8c";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(
        `T_равн = ${equilibriumTemp.toFixed(1)} °C`,
        340,
        238
      );
      ctx.fillText(
        `c_изм = ${measuredC.toFixed(0)} Дж/(кг·°C)`,
        340,
        262
      );
      ctx.fillStyle = "#96a3ab";
      ctx.font = "12px sans-serif";
      ctx.fillText(
        `c_табл (${materialData[material]?.name}) = ${tabularC} Дж/(кг·°C)`,
        340,
        284
      );

      if (onStateChange) {
        onStateChange({
          bodyMass,
          waterMass,
          bodyTemp,
          waterTemp,
          equilibriumTemp,
          specificHeat: measuredC,
          tabularHeat: tabularC,
        });
      }
    };
  }, [
    bodyMass,
    waterMass,
    bodyTemp,
    waterTemp,
    material,
    equilibriumTemp,
    measuredC,
    tabularC,
    onStateChange,
  ]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={false}
    />
  );
}
