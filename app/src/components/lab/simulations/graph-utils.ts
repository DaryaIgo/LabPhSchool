/**
 * Утилиты для построения графиков симуляций.
 *
 * Отвечают за:
 *   - преобразование строковых измерений в числа;
 *   - вычисление "красивых" (nice) границ осей и меток ticks;
 *   - форматирование подписей осей.
 */

import type { GraphConfig, MeasurementRow } from "./types";

export interface AxisBounds {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}

export interface GraphPoint {
  x: number;
  y: number;
  raw: MeasurementRow;
}

/**
 * Превращает строковые/числовые значения графика в числа.
 * Recharts иногда некорректно интерпретирует строки, особенно при
 * расчёте домена осей, поэтому нормализуем данные заранее.
 */
export function prepareChartData(
  graph: GraphConfig,
  rows: MeasurementRow[]
): GraphPoint[] {
  return rows.map(row => ({
    x: Number(row[graph.xKey]),
    y: Number(row[graph.yKey]),
    raw: row,
  }));
}

/**
 * Вычисляет "красивые" границы оси и набор меток.
 *
 * Алгоритм:
 *   1. Добавляет небольшой отступ (padding) к min/max, чтобы точки
 *      не прилипали к краям графика.
 *   2. Подбирает step из ряда 1·10ⁿ, 2·10ⁿ, 5·10ⁿ так, чтобы
 *      количество меток было близко к targetTicks.
 *   3. Округляет min вниз, max вверх до ближайшего step.
 */
export function getNiceAxisBounds(
  values: number[],
  targetTicks = 6
): AxisBounds {
  const finite = values.filter(Number.isFinite);

  if (finite.length === 0) {
    return { min: 0, max: 1, step: 0.2, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] };
  }

  let min = Math.min(...finite);
  let max = Math.max(...finite);

  if (min === max) {
    // Все значения одинаковые — показываем небольшой диапазон вокруг точки.
    const center = min === 0 ? 0 : min;
    const delta = Math.abs(center) < 1e-9 ? 1 : Math.abs(center) * 0.5;
    min = center - delta;
    max = center + delta;
  }

  const range = max - min;
  const padding = range * 0.08;
  min -= padding;
  max += padding;

  // Гарантируем, что ось 0 видна, если данные пересекают ноль
  // (полезно для физических величин).
  if (Math.min(...finite) < 0 && Math.max(...finite) > 0) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }

  const roughStep = range / targetTicks;
  const step = niceStep(roughStep);

  const roundedMin = Math.floor(min / step) * step;
  const roundedMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  // Защита от бесконечного цикла при очень малых step.
  const maxIterations = 50;
  for (
    let v = roundedMin, i = 0;
    v <= roundedMax + 1e-9 && i < maxIterations;
    v += step, i++
  ) {
    const rounded = Number(v.toFixed(10));
    // Recharts игнорирует метки, выходящие за домен, поэтому обрезаем
    // возможные float-артефакты на границах.
    if (rounded >= roundedMin - 1e-9 && rounded <= roundedMax + 1e-9) {
      ticks.push(rounded);
    }
  }

  return {
    min: roundedMin,
    max: roundedMax,
    step,
    ticks,
  };
}

/**
 * Подбирает "красивый" шаг из ряда 1, 2, 5, 10, 20, 50, ...
 */
function niceStep(rough: number): number {
  if (rough <= 0 || !Number.isFinite(rough)) {
    return 1;
  }

  const exp = Math.floor(Math.log10(rough));
  const frac = rough / 10 ** exp;

  let multiplier: number;
  if (frac <= 1.4) {
    multiplier = 1;
  } else if (frac <= 3.5) {
    multiplier = 2;
  } else if (frac <= 7.5) {
    multiplier = 5;
  } else {
    multiplier = 10;
  }

  return multiplier * 10 ** exp;
}

/**
 * Форматирует число для подписи оси:
 *   - убирает лишние десятичные нули;
 *   - не использует экспоненциальную нотацию для "бытовых" чисел.
 */
export function formatAxisTick(value: number): string {
  if (!Number.isFinite(value)) return "";

  const abs = Math.abs(value);
  if (abs >= 1e6 || (abs > 0 && abs < 1e-3)) {
    return value.toExponential(1);
  }

  // Округляем до 3 значащих десятичных знаков, чтобы избежать
  // артефактов вроде 0.30000000000000004.
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded);
}
