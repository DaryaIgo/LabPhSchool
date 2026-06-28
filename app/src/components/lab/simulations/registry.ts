/**
 * Реестр «своих» физических симуляций.
 *
 * Чтобы добавить новую симуляцию:
 *   1. Создай файл в этой папке.
 *   2. Экспортируй из него React-компонент.
 *   3. Создай файл `.manifest.ts` с манифестом и функцией computeMeasurement.
 *   4. Зарегистрируй здесь по ключу componentRef.
 *   5. Добавь запись в app/db/simulations-seed.ts.
 */

import UniformLinearMotion from "./UniformLinearMotion";
import {
  uniformLinearMotionManifest,
  computeUniformLinearMotionMeasurement,
} from "./UniformLinearMotion.manifest";
import UniformlyAcceleratedMotion from "./UniformlyAcceleratedMotion";
import {
  uniformlyAcceleratedMotionManifest,
  computeUniformlyAcceleratedMotionMeasurement,
} from "./UniformlyAcceleratedMotion.manifest";
import FreeFall from "./FreeFall";
import {
  freeFallManifest,
  computeFreeFallMeasurement,
} from "./FreeFall.manifest";
import type { RegisteredSimulation } from "./types";

export const simulationRegistry: Record<string, RegisteredSimulation> = {
  "uniform-linear-motion": {
    manifest: uniformLinearMotionManifest,
    component: UniformLinearMotion,
    computeMeasurement: computeUniformLinearMotionMeasurement,
  },
  "uniformly-accelerated-motion": {
    manifest: uniformlyAcceleratedMotionManifest,
    component: UniformlyAcceleratedMotion,
    computeMeasurement: computeUniformlyAcceleratedMotionMeasurement,
  },
  "free-fall": {
    manifest: freeFallManifest,
    component: FreeFall,
    computeMeasurement: computeFreeFallMeasurement,
  },
};

export function getRegisteredSimulation(
  componentRef: string | null | undefined
): RegisteredSimulation | null {
  if (!componentRef) return null;
  return simulationRegistry[componentRef] ?? null;
}
