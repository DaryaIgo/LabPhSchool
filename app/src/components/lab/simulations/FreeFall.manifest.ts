import type { MeasurementRow, SimulationManifest } from "./types";

export const freeFallManifest: SimulationManifest = {
  slug: "free-fall",
  title: "Свободное падение",
  componentRef: "free-fall",
  params: [
    {
      key: "h0",
      label: "Начальная высота",
      paramType: "slider",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 20,
      unit: "м",
    },
    {
      key: "v0",
      label: "Начальная скорость",
      paramType: "slider",
      min: -20,
      max: 20,
      step: 0.5,
      defaultValue: 0,
      unit: "м/с",
    },
    {
      key: "g",
      label: "Ускорение свободного падения",
      paramType: "select",
      defaultValue: "9.8",
      options: [
        { value: "9.8", label: "Земля (9.8 м/с²)" },
        { value: "1.62", label: "Луна (1.62 м/с²)" },
        { value: "3.71", label: "Марс (3.71 м/с²)" },
      ],
    },
  ],
  wrapper: {
    blockTitles: {
      parameters: "Параметры",
      controls: "Управление",
      currentValues: "Текущие величины",
      graphs: "Графики",
      measurements: "Измерения",
    },
    hasGraphs: true,
  },
  currentValues: [
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "h", label: "h", unit: "м", decimals: 1 },
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
    { key: "g", label: "g", unit: "м/с²", decimals: 2 },
  ],
  measurements: [
    { key: "h0", label: "h₀", unit: "м", decimals: 0 },
    { key: "v0", label: "v₀", unit: "м/с", decimals: 1 },
    { key: "g", label: "g", unit: "м/с²", decimals: 2 },
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "h", label: "h", unit: "м", decimals: 1 },
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
  ],
  graphs: [
    {
      title: "Зависимость высоты от времени h(t)",
      type: "line",
      xKey: "time",
      yKey: "h",
      xLabel: "t, с",
      yLabel: "h, м",
    },
    {
      title: "Зависимость скорости от времени v(t)",
      type: "line",
      xKey: "time",
      yKey: "v",
      xLabel: "t, с",
      yLabel: "v, м/с",
    },
  ],
};

export function computeFreeFallMeasurement(
  state: Record<string, number>,
  params: Record<string, number | string>
): MeasurementRow {
  const h0 = Number(params.h0 || 0);
  const v0 = Number(params.v0 || 0);
  const g = Number(params.g || 9.8);
  const time = state.time ?? 0;

  const yDown = v0 * time + 0.5 * g * time * time;
  let h = h0 - yDown;
  let v = v0 + g * time;

  const discriminant = v0 * v0 + 2 * g * h0;
  const tHit = discriminant > 0 ? (-v0 + Math.sqrt(discriminant)) / g : 0;

  if (time >= tHit) {
    h = 0;
    v = 0;
  }

  return {
    h0,
    v0,
    g,
    time: time.toFixed(1),
    h: h.toFixed(1),
    v: v.toFixed(1),
  };
}
