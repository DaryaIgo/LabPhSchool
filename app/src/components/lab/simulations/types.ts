/**
 * Общие типы для «своих» физических симуляций.
 *
 * Каждая симуляция экспортирует:
 *   1. React-компонент визуализации (canvas/WebGL/...).
 *   2. Манифест (SimulationManifest) — описание параметров, текущих величин,
 *      измерений, графиков и названий блоков обвязки.
 *   3. Функцию computeMeasurement(state, params) для формирования строки
 *      таблицы измерений.
 */

export type SimParamType = "slider" | "number" | "select";

export interface SimSelectOption {
  value: string;
  label: string;
}

export interface SimParamConfig {
  key: string;
  label: string;
  paramType: SimParamType;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string;
  options?: SimSelectOption[];
  unit?: string;
}

export interface CurrentValueConfig {
  key: string;
  label: string;
  unit?: string;
  decimals?: number;
}

export interface MeasurementColumnConfig {
  key: string;
  label: string;
  unit?: string;
  decimals?: number;
}

export interface GraphConfig {
  title: string;
  type: "line" | "scatter";
  xKey: string;
  yKey: string;
  xLabel?: string;
  yLabel?: string;
}

export interface WrapperBlockTitles {
  parameters?: string;
  controls?: string;
  currentValues?: string;
  graphs?: string;
  measurements?: string;
}

export interface SimulationManifest {
  /** Уникальный slug симуляции. Должен совпадать со slug в БД. */
  slug: string;
  /** Название, которое показывается в заголовке блока симуляции. */
  title: string;
  /** Ключ, по которому LabWorkPage находит симуляцию в registry. */
  componentRef: string;
  /** Параметры, доступные пользователю в блоке «Параметры». */
  params: SimParamConfig[];
  /** Описание обвязки: какие блоки есть и как называются. */
  wrapper: {
    blockTitles: WrapperBlockTitles;
    /** Если false, блок «Графики» не рендерится. */
    hasGraphs: boolean;
  };
  /** Величины, отображаемые в таблице «Текущие величины». */
  currentValues: CurrentValueConfig[];
  /** Колонки таблицы «Измерения». */
  measurements: MeasurementColumnConfig[];
  /** Графики, строящиеся по накопленным измерениям. */
  graphs: GraphConfig[];
}

export interface SimComponentProps {
  params: Record<string, number | string>;
  isRunning?: boolean;
  /** If true, the simulation animation has finished and the component
   *  should render the final state instead of the initial one. */
  isFinished?: boolean;
  onStateChange?: (state: Record<string, number>) => void;
}

export type MeasurementRow = Record<string, string | number>;

export type ComputeMeasurementFn = (
  state: Record<string, number>,
  params: Record<string, number | string>
) => MeasurementRow;

export interface RegisteredSimulation {
  manifest: SimulationManifest;
  component: React.FC<SimComponentProps>;
  computeMeasurement: ComputeMeasurementFn;
}
