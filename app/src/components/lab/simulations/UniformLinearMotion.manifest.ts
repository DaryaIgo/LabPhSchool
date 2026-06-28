import type { MeasurementRow, SimulationManifest } from "./types";

export const uniformLinearMotionManifest: SimulationManifest = {
  slug: "uniform-linear-motion",
  title: "Равномерное прямолинейное движение",
  componentRef: "uniform-linear-motion",
  params: [
    {
      key: "speed",
      label: "Скорость",
      paramType: "slider",
      min: -20,
      max: 20,
      step: 0.5,
      defaultValue: 5,
      unit: "м/с",
    },
    {
      key: "time",
      label: "Время",
      paramType: "slider",
      min: 1,
      max: 30,
      step: 0.5,
      defaultValue: 10,
      unit: "с",
    },
    {
      key: "startX",
      label: "Начальная координата",
      paramType: "slider",
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 0,
      unit: "м",
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
    { key: "s", label: "s", unit: "м", decimals: 1 },
    { key: "x", label: "x", unit: "м", decimals: 1 },
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
  ],
  measurements: [
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "startX", label: "x₀", unit: "м", decimals: 0 },
    { key: "s", label: "s", unit: "м", decimals: 1 },
    { key: "x", label: "x", unit: "м", decimals: 1 },
  ],
  graphs: [
    {
      title: "Зависимость координаты от времени x(t)",
      type: "line",
      xKey: "time",
      yKey: "x",
      xLabel: "t, с",
      yLabel: "x, м",
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

export function computeUniformLinearMotionMeasurement(
  state: Record<string, number>,
  params: Record<string, number | string>
): MeasurementRow {
  const speed = Number(params.speed || 0);
  const startX = Number(params.startX || 0);
  const time = state.time ?? 0;
  const s = speed * time;
  const x = startX + s;

  return {
    v: speed,
    time: time.toFixed(1),
    startX,
    s: s.toFixed(1),
    x: x.toFixed(1),
  };
}
