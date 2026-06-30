/**
 * Типы и утилиты для пользовательских таблиц и графиков
 * в сторонних (external) лабораторных работах.
 */

export interface ExternalTableColumn {
  id: string;
  name: string;
}

export interface ExternalTableRow {
  id: string;
  values: Record<string, string>;
}

export interface ExternalDataTable {
  id: string;
  name: string;
  columns: ExternalTableColumn[];
  rows: ExternalTableRow[];
}

export interface ExternalGraphConfig {
  id: string;
  title: string;
  tableId: string;
  xColumnId: string;
  yColumnId: string;
  type: "line" | "scatter";
}

export interface ExternalLabData {
  tables: ExternalDataTable[];
  graphs: ExternalGraphConfig[];
}

export const DEFAULT_EXTERNAL_DATA: ExternalLabData = {
  tables: [],
  graphs: [],
};

export function createEmptyTable(index?: number): ExternalDataTable {
  return {
    id: crypto.randomUUID(),
    name: `Таблица ${(index ?? 0) + 1}`,
    columns: [],
    rows: [],
  };
}

export function createEmptyGraph(index?: number): ExternalGraphConfig {
  return {
    id: crypto.randomUUID(),
    title: `График ${(index ?? 0) + 1}`,
    tableId: "",
    xColumnId: "",
    yColumnId: "",
    type: "scatter",
  };
}

export function isValidNumber(value: string): boolean {
  if (value.trim() === "") return true;
  return /^-?\d+([.,]\d+)?$/.test(value.trim());
}

export function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export function tableToMeasurementRows(
  table: ExternalDataTable
): Record<string, string | number>[] {
  return table.rows.map(row => {
    const result: Record<string, string | number> = {};
    for (const col of table.columns) {
      const num = parseNumber(row.values[col.id] ?? "");
      result[col.id] = num ?? "";
    }
    return result;
  });
}

export function getColumnName(
  table: ExternalDataTable | undefined,
  columnId: string
): string {
  return table?.columns.find(c => c.id === columnId)?.name ?? columnId;
}
