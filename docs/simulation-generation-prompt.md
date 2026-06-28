# Промт для генерации физических симуляций

Этот документ описывает формат, в котором нужно создавать новые «свои» физические симуляции для платформы. Используй его как инструкцию для LLM/разработчика.

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
    // колонки таблицы измерений. Каждый key здесь должен возвращаться
    // из computeXxxMeasurement. Ключи графиков (xKey / yKey) обязаны
    // присутствовать в этих данных.
    { key: "paramKey", label: "параметр", unit: "м", decimals: 0 },
    { key: "time", label: "t", unit: "с", decimals: 1 },
    { key: "value", label: "x", unit: "м", decimals: 2 },
  ],
  graphs: [
    // графики по накопленным измерениям. xKey / yKey должны совпадать
    // с ключами в объекте, возвращаемом computeXxxMeasurement.
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

      // 2. Расчёт текущего времени. При isRunning === false время должно
      // быть 0, чтобы объект отображался в начальном положении (x₀), а не
      // в конечной точке анимации.
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

## Ключевые правила корректной работы

### Графики и измерения должны использовать одинаковые ключи

- Ключи `xKey` и `yKey` в `graphs` обязаны присутствовать в объекте, который возвращает `computeXxxMeasurement`.
- Если график строится по скорости `v`, в `measurements` и в возвращаемом объекте измерения должен быть ключ `v`. Не полагайся на то, что параметр симуляции (`speed`, `v0` и т.п.) автоматически попадёт в данные графика.
- Пример: для графика `v(t)` (`xKey: "time"`, `yKey: "v"`) функция измерений должна возвращать `{ time: ..., v: ..., ... }`.

### Начальное положение объекта при остановленной симуляции

- Когда `isRunning === false`, физический объект (машинка, шар и т.д.) должен отображаться **строго в начальной точке** (`x₀`), а не в конечной позиции анимации.
- Время анимации в неактивном состоянии должно быть `0`. Текущие величины (`onStateChange`) в этом состоянии соответствуют начальному моменту: `time = 0`, пройденный путь `s = 0`, координата `x = x₀`.
- Это позволяет пользователю менять параметры и видеть, откуда начнётся движение, без "прыжка" объекта к финальной точке.

### Масштаб пространственной оси

- Видимый диапазон по оси X должен иметь разумный дефолт, например **±25 м от начальной позиции `x₀`**.
- Если полный путь анимации (`x₀ + v · t` или аналогичное выражение) выходит за эти границы, диапазон должен автоматически расширяться, чтобы весь путь помещался на canvas.
- Рекомендуется добавлять небольшой padding (8–12 %) к вычисленному диапазону, чтобы объект не прилипал к краям canvas.

### Формат чисел в измерениях

- `time` обычно возвращается как строка с фиксированным числом знаков после запятой, например `time.toFixed(1)`.
- Значения для графиков можно возвращать числами или строками — `SimulationWrapper` нормализует их перед передачей в Recharts. Главное — правильный ключ.
- Колонки `measurements` определяют, какие поля попадут в таблицу измерений. Избегай дублирования одной и той же физической величины под разными ключами (например, `speed` и `v`) — выбери один ключ и используй его в таблице и в графиках.

### Передача текущих величин

- `onStateChange` должен вызываться на каждом кадре и содержать все ключи, перечисленные в `manifest.currentValues`.
- При `isRunning === false` значения должны соответствовать начальному моменту (`time = 0`).

## Требования к визуальной части

- Canvas-размер по умолчанию: `700 × 400`.
- Фон canvas: `#1a1f22`.
- Акцентный цвет объектов: `#2eff8c`.
- Вспомогательный цвет: `#01acff`.
- Цвета дорожек/осей: `#2a3237`, `#3c474f`, `#788389`.
- Шрифт: системный sans-serif, размеры 10–16 px.
- При `isRunning === true` использовать `requestAnimationFrame` (уже реализовано в `SimulationCanvas`).
- Не рисовать собственные слайдеры/кнопки внутри canvas — обвязка (`SimulationWrapper`) рендерит их автоматически по манифесту.
- Видимый диапазон по оси X должен иметь разумный дефолт (например, ±25 м от `x₀`) и расширяться, если полный путь анимации выходит за эти границы.

## Требования к обвязке

Обвязка рендерится компонентом `SimulationWrapper` и имеет компактный двухколоночный layout:

- **Левая колонка** — canvas симуляции и панель управления под ним.
- **Правая колонка (sidebar)** — компактные блоки «Параметры» и «Текущие величины».
- **Ниже** — таблица «Измерения» и блок «Графики» (если включены).

Конкретные блоки:

1. **Параметры** — слайдеры/числа/селекты из `manifest.params`, отображаются в компактном вертикальном виде справа от canvas.
2. **Управление** — кнопки «Старт/Остановить», «Сброс» и «Зафиксировать» располагаются в одном ряду под canvas.
3. **Симуляция** — canvas компонента.
4. **Текущие величины** — компактная сетка значений из `onStateChange`, описанных в `manifest.currentValues`, справа от canvas под параметрами.
5. **Измерения** — таблица, формируемая функцией `computeXxxMeasurement`. Кнопка «Зафиксировать» находится в панели управления, а не над таблицей. Таблица имеет компактный дизайн с иконкой линейки в заголовке и кнопкой «Очистить».
6. **Графики** — строятся по накопленным измерениям, если `manifest.wrapper.hasGraphs === true`. На больших экранах графики занимают **2/3 ширины** в левой колонке, а таблица измерений — компактную **1/3 ширины** в правой колонке. Графики являются основным визуальным элементом и отрисовывают оси даже при отсутствии данных. На узких экранах блоки складываются вертикально.

Дополнительно:

- Нажатие клавиши **Пробел** на клавиатуре работает как кнопка «Зафиксировать» (добавляет измерение), если фокус не находится в поле ввода (`input`/`textarea`/`select`).
- Все блоки выполнены в компактном стиле: уменьшенные отступы, компактные карточки величин, плотная вертикальная раскладка параметров.

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
