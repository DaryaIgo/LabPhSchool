import type {
  MeasurementRow,
  SimulationManifest,
} from "./types";

export const uniformlyAcceleratedMotionManifest: SimulationManifest = {
  slug: "uniformly-accelerated-motion",
  title: "Равноускоренное прямолинейное движение",
  componentRef: "uniformly-accelerated-motion",
  params: [
    {
      key: "v0",
      label: "Начальная скорость",
      paramType: "slider",
      min: 0,
      max: 10,
      step: 0.5,
      defaultValue: 0,
      unit: "м/с",
    },
    {
      key: "angle",
      label: "Угол наклона плоскости",
      paramType: "slider",
      min: 0,
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
      max: 10,
      step: 0.5,
      defaultValue: 5,
      unit: "с",
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
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
    { key: "a", label: "a", unit: "м/с²", decimals: 2 },
  ],
  measurements: [
    { key: "v0", label: "v₀", unit: "м/с", decimals: 1 },
    { key: "angle", label: "α", unit: "°", decimals: 0 },
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "s", label: "s", unit: "м", decimals: 1 },
    { key: "v", label: "v", unit: "м/с", decimals: 1 },
    { key: "a", label: "a", unit: "м/с²", decimals: 2 },
  ],
  graphs: [
    {
      title: "Зависимость скорости от времени v(t)",
      type: "line",
      xKey: "time",
      yKey: "v",
      xLabel: "t, с",
      yLabel: "v, м/с",
    },
    {
      title: "Зависимость пройденного пути от времени s(t)",
      type: "line",
      xKey: "time",
      yKey: "s",
      xLabel: "t, с",
      yLabel: "s, м",
    },
  ],
};

export function computeUniformlyAcceleratedMotionMeasurement(
  state: Record<string, number>,
  params: Record<string, number | string>
): MeasurementRow {
  const v0 = Number(params.v0 || 0);
  const angleDeg = Number(params.angle || 0);
  const a = 9.8 * Math.sin((angleDeg * Math.PI) / 180);
  const time = state.time ?? 0;
  const v = v0 + a * time;
  const s = v0 * time + 0.5 * a * time * time;

  return {
    v0,
    angle: angleDeg,
    time: time.toFixed(1),
    s: s.toFixed(1),
    v: v.toFixed(1),
    a: a.toFixed(2),
  };
}
