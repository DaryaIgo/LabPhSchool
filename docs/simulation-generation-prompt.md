# Промт для генерации физических симуляций

Этот документ описывает формат, в котором нужно создавать новые «свои» физические симуляции для платформы **Ph**. Используй его как инструкцию для LLM/разработчика.

## Общие принципы

- Симуляция — это **React-компонент** на TypeScript, который рисует физический процесс на HTML5 Canvas через `SimulationCanvas`.
- Каждая симуляция живёт в двух файлах:
  - `app/src/components/lab/simulations/<PascalCaseSlug>.tsx` — компонент визуализации.
  - `app/src/components/lab/simulations/<PascalCaseSlug>.manifest.ts` — манифест и функция измерений.
- Каждая симуляция **обязана** экспортировать:
  1. `default` React-компонент визуализации.
  2. Из файла `.manifest.ts`: `xxxManifest: SimulationManifest` и `computeXxxMeasurement(state, params)`.
- После создания файлов симуляцию нужно зарегистрировать в `app/src/components/lab/simulations/registry.ts` и добавить seed-запись в `app/db/simulations-seed.ts`.
- Сторонние (`external`, iframe) симуляции не затрагиваются этим промтом.

## Шаги создания симуляции

### 1. Создай файл манифеста

Файл `app/src/components/lab/simulations/MySimulation.manifest.ts`:

```ts
import type {
  MeasurementRow,
  SimulationManifest,
} from "./types";

export const mySimulationManifest: SimulationManifest = {
  slug: "my-slug", // совпадает со slug в БД
  title: "Название симуляции",
  componentRef: "my-slug", // ключ в registry
  params: [
    // параметры, доступные пользователю в блоке «Параметры»
    {
      key: "paramKey",
      label: "Название параметра",
      paramType: "slider", // или "number" | "select"
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 10,
      unit: "м",
    },
  ],
  wrapper: {
    blockTitles: {
      parameters: "Параметры",
      controls: "Управление",
      currentValues: "Текущие величины",
      graphs: "Графики", // можно опустить, если hasGraphs: false
      measurements: "Измерения",
    },
    hasGraphs: true, // false — если графики не нужны
  },
  currentValues: [
    // величины, которые симуляция передаёт наружу через onStateChange
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "value", label: "x", unit: "м", decimals: 2 },
  ],
  measurements: [
    // колонки таблицы измерений
    { key: "paramKey", label: "параметр", unit: "м", decimals: 0 },
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "value", label: "x", unit: "м", decimals: 2 },
  ],
  graphs: [
    // графики по накопленным измерениям
    {
      title: "Зависимость x от времени",
      type: "line", // "line" | "scatter"
      xKey: "time",
      yKey: "value",
      xLabel: "t, с",
      yLabel: "x, м",
    },
  ],
};

export function computeMySimulationMeasurement(
  state: Record<string, number>,
  params: Record<string, number | string>
): MeasurementRow {
  const paramValue = Number(params.paramKey || 0);
  const time = state.time ?? 0;
  const value = state.value ?? 0;

  return {
    paramKey: paramValue,
    time: time.toFixed(1),
    value: value.toFixed(2),
  };
}
```

### 2. Создай файл компонента

Файл `app/src/components/lab/simulations/MySimulation.tsx`:

```tsx
import { useMemo, useRef, useEffect } from "react";
import SimulationCanvas from "@/components/lab/SimulationCanvas";
import type { SimComponentProps } from "./types";

export default function MySimulation({
  params,
  isRunning,
  onStateChange,
}: SimComponentProps) {
  const paramValue = Number(params.paramKey || 10);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  const draw = useMemo(() => {
    return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // 1. Очистка фона
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, w, h);

      // 2. Расчёт текущего времени (если анимация)
      let currentTime = 0;
      if (isRunning) {
        const elapsed = Date.now() - startTimeRef.current;
        currentTime = elapsed / 1000;
      }

      // 3. Рисование сцены
      // ...

      // 4. Передача текущих величин наружу
      if (onStateChange) {
        onStateChange({
          time: currentTime,
          value: currentTime * paramValue,
        });
      }
    };
  }, [paramValue, isRunning, onStateChange]);

  return (
    <SimulationCanvas
      draw={draw}
      width={700}
      height={400}
      isRunning={isRunning}
    />
  );
}
```

### 3. Зарегистрируй симуляцию

В `app/src/components/lab/simulations/registry.ts` добавь импорт и запись:

```ts
import MySimulation from "./MySimulation";
import {
  mySimulationManifest,
  computeMySimulationMeasurement,
} from "./MySimulation.manifest";

export const simulationRegistry: Record<string, RegisteredSimulation> = {
  // ...existing simulations...
  "my-slug": {
    manifest: mySimulationManifest,
    component: MySimulation,
    computeMeasurement: computeMySimulationMeasurement,
  },
};
```

### 4. Добавь seed-запись

В `app/db/simulations-seed.ts` добавь запись в массив `simulationData`:

```ts
{
  slug: "my-slug",
  title: "Название симуляции",
  description: "Краткое описание для админки.",
  category: "mechanics", // раздел физики
  isDynamic: true, // нужна ли кнопка Старт/Сброс
  componentRef: "my-slug",
  params: [
    {
      key: "paramKey",
      label: "Название параметра",
      paramType: "slider",
      min: "0",
      max: "100",
      step: "1",
      defaultValue: "10",
      unit: "м",
    },
  ],
},
```

### 5. Обнови базу данных

После изменений запусти:

```bash
cd app/
npx tsx db/simulations-seed.ts
```

Скрипт автоматически удалит симуляции, отсутствующие в `simulationData`.

## Требования к визуальной части

- Canvas-размер по умолчанию: `700 × 400`.
- Фон canvas: `#1a1f22`.
- Акцентный цвет объектов: `#2eff8c`.
- Вспомогательный цвет: `#01acff`.
- Цвета дорожек/осей: `#2a3237`, `#3c474f`, `#788389`.
- Шрифт: системный sans-serif, размеры 10–16 px.
- При `isRunning === true` использовать `requestAnimationFrame` (уже реализовано в `SimulationCanvas`).
- Не рисовать собственные слайдеры/кнопки внутри canvas — обвязка (`SimulationWrapper`) рендерит их автоматически по манифесту.

## Требования к обвязке

Обвязка состоит из блоков:

1. **Параметры** — слайдеры/числа/селекты из `manifest.params`.
2. **Управление** — кнопки «Старт» и «Сброс» (показываются всегда; анимация необязательна).
3. **Симуляция** — canvas компонента.
4. **Текущие величины** — карточки значений из `onStateChange`, описанных в `manifest.currentValues`.
5. **Измерения** — таблица с кнопкой «Зафиксировать», формируемая функцией `computeXxxMeasurement`.
6. **Графики** — строятся по накопленным измерениям, если `manifest.wrapper.hasGraphs === true`.

Если для симуляции графики не нужны, установи `hasGraphs: false` и опусти `graphs` (или оставь пустым массивом).

## Правила именования

- Файл компонента: `PascalCase`, совпадает с названием симуляции, например `UniformLinearMotion.tsx`.
- Файл манифеста: `UniformLinearMotion.manifest.ts`.
- `slug` и `componentRef`: `kebab-case`, уникальны в системе.
- Манифест: `camelCaseManifest`, например `uniformLinearMotionManifest`.
- Функция измерений: `computeXxxMeasurement`.

## Проверка перед коммитом

1. `cd app && npm run check` — проверка типов.
2. `cd app && npm run lint` — линтер.
3. Запустить seed и убедиться, что симуляция появилась в админке (`/admin/lab-management`).
4. Создать/открыть лабораторную работу с этой симуляцией и проверить все блоки обвязки.
