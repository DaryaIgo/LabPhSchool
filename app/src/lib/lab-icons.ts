import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Wrench,
  Beaker,
  Thermometer,
  Zap,
  Eye,
  Atom,
  Magnet,
  Waves,
  Activity,
} from "lucide-react";

/**
 * Реестр иконок для разделов лабораторий (lab_categories.iconType).
 *
 * Как добавить новую иконку:
 * 1. Найдите нужную иконку в библиотеке Lucide: https://lucide.dev/icons
 * 2. Импортируйте компонент из "lucide-react" в начало этого файла.
 * 3. Добавьте запись в CATEGORY_ICONS с уникальным key (только a-z, 0-9 и дефис),
 *    человекочитаемым label, ссылкой на компонент и цветом.
 * 4. Добавьте этот key в массив LAB_CATEGORY_ICON_KEYS в contracts/constants.ts
 *    — это включает проверку на бэкенде и подсказку в админке.
 *
 * Формат значения iconType — это именно key из этого реестра (строка).
 * Иконки хранятся не как картинки, а как компоненты Lucide, поэтому загружать
 * файлы не нужно: достаточно импортировать иконку из библиотеки.
 */

export interface CategoryIconDef {
  key: string;
  label: string;
  component: ComponentType<LucideProps>;
  color: string;
}

export const CATEGORY_ICONS: CategoryIconDef[] = [
  { key: "mechanics", label: "Механика", component: Wrench, color: "#2eff8c" },
  {
    key: "fluid-mechanics",
    label: "Гидростатика",
    component: Beaker,
    color: "#01acff",
  },
  {
    key: "molecular-thermodynamics",
    label: "Молекулярная физика и термодинамика",
    component: Thermometer,
    color: "#ff7043",
  },
  {
    key: "thermal",
    label: "Термодинамика",
    component: Thermometer,
    color: "#ff7043",
  },
  {
    key: "electrodynamics",
    label: "Электродинамика",
    component: Zap,
    color: "#ffd600",
  },
  {
    key: "circuit",
    label: "Электрическая цепь",
    component: Zap,
    color: "#ffd600",
  },
  { key: "optics", label: "Оптика", component: Eye, color: "#66bb6a" },
  {
    key: "nuclear-physics",
    label: "Ядерная физика",
    component: Atom,
    color: "#ef5350",
  },
  {
    key: "atomic",
    label: "Атомная физика",
    component: Atom,
    color: "#ef5350",
  },
  { key: "magnetism", label: "Магнетизм", component: Magnet, color: "#7c4dff" },
  { key: "waves", label: "Волны", component: Waves, color: "#01acff" },
  {
    key: "oscillations",
    label: "Колебания",
    component: Activity,
    color: "#ff5722",
  },
];

export const CATEGORY_ICON_MAP = Object.fromEntries(
  CATEGORY_ICONS.map(i => [i.key, i])
) as Record<string, CategoryIconDef>;

export const DEFAULT_CATEGORY_ICON_KEY = "mechanics";

export function getCategoryIcon(key: string | null | undefined) {
  return (
    CATEGORY_ICON_MAP[key || ""] ?? CATEGORY_ICON_MAP[DEFAULT_CATEGORY_ICON_KEY]
  );
}

export function getCategoryIconKeys(): string[] {
  return CATEGORY_ICONS.map(i => i.key);
}
