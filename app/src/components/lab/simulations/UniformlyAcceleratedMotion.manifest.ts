import type { MeasurementRow, SimulationManifest } from "./types";

export const uniformlyAcceleratedMotionManifest: SimulationManifest = {
  slug: "uniformly-accelerated-motion",
  title: "Равноускоренное прямолинейное движение",
  componentRef: "uniformly-accelerated-motion",
  params: [
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
      key: "angle",
      label: "Угол наклона плоскости",
      paramType: "slider",
      min: -45,
      max: 45,
      step: 1,
      defaultValue: 10,
      unit: "°",
    },
    {
      key: "time",
      label: "Время",
      paramType: "slider",
      min: 1,
      max: 30,
      step: 0.5,
      defaultValue: 5,
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
    { key: "x", label: "x", unit: "м", decimals: 1 },
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
    { key: "a", label: "a", unit: "м/с²", decimals: 2 },
  ],
  measurements: [
    { key: "v0", label: "v₀", unit: "м/с", decimals: 1 },
    { key: "angle", label: "α", unit: "°", decimals: 0 },
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "startX", label: "x₀", unit: "м", decimals: 0 },
    { key: "x", label: "x", unit: "м", decimals: 1 },
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
    { key: "a", label: "a", unit: "м/с²", decimals: 2 },
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

export function computeUniformlyAcceleratedMotionMeasurement(
  state: Record<string, number>,
  params: Record<string, number | string>
): MeasurementRow {
  const v0 = Number(params.v0 || 0);
  const angleDeg = Number(params.angle || 0);
  const startX = Number(params.startX || 0);
  const a = 9.8 * Math.sin((angleDeg * Math.PI) / 180);
  const time = state.time ?? 0;
  const v = v0 + a * time;
  const x = startX + v0 * time + 0.5 * a * time * time;

  return {
    v0,
    angle: angleDeg,
    time: time.toFixed(1),
    startX,
    x: x.toFixed(1),
    v: v.toFixed(1),
    a: a.toFixed(2),
  };
}
