import { useState } from "react";
import { Plus, Trash2, Table2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ExternalDataTable,
  ExternalTableColumn,
  ExternalTableRow,
} from "./external-data";
import { createEmptyTable, isValidNumber } from "./external-data";

interface ExternalDataTablesProps {
  tables: ExternalDataTable[];
  onChange: (tables: ExternalDataTable[]) => void;
}

export default function ExternalDataTables({
  tables,
  onChange,
}: ExternalDataTablesProps) {
  const addTable = () => {
    onChange([...tables, createEmptyTable(tables.length)]);
  };

  const updateTable = (
    id: string,
    updates: Partial<ExternalDataTable>
  ) => {
    onChange(tables.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeTable = (id: string) => {
    onChange(tables.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Таблицы данных</h3>
        <Button
          onClick={addTable}
          variant="outline"
          size="sm"
          className="border-[#2eff8c]/50 text-[#2eff8c] hover:bg-[#2eff8c]/10"
        >
          <Plus size={14} className="mr-1" />
          Таблица
        </Button>
      </div>

      {tables.length === 0 && (
        <p className="text-sm text-[#798389]">
          Нажмите «+ Таблица», чтобы добавить таблицу для записи измерений.
        </p>
      )}

      {tables.map(table => (
        <TableEditor
          key={table.id}
          table={table}
          onUpdate={updates => updateTable(table.id, updates)}
          onRemove={() => removeTable(table.id)}
        />
      ))}
    </div>
  );
}

function TableEditor({
  table,
  onUpdate,
  onRemove,
}: {
  table: ExternalDataTable;
  onUpdate: (updates: Partial<ExternalDataTable>) => void;
  onRemove: () => void;
}) {
  const [newColumnName, setNewColumnName] = useState("");

  const updateColumnName = (columnId: string, name: string) => {
    onUpdate({
      columns: table.columns.map(c =>
        c.id === columnId ? { ...c, name } : c
      ),
    });
  };

  const addColumn = () => {
    const baseName = newColumnName.trim() || `x${table.columns.length + 1}`;
    let name = baseName;
    let suffix = 2;
    while (table.columns.some(c => c.name === name)) {
      name = `${baseName}_${suffix}`;
      suffix++;
    }

    const newColumn: ExternalTableColumn = { id: crypto.randomUUID(), name };
    onUpdate({
      columns: [...table.columns, newColumn],
      rows: table.rows.map(r => ({
        ...r,
        values: { ...r.values, [newColumn.id]: "" },
      })),
    });
    setNewColumnName("");
  };

  const removeColumn = (columnId: string) => {
    onUpdate({
      columns: table.columns.filter(c => c.id !== columnId),
      rows: table.rows.map(r => {
        const values = { ...r.values };
        delete values[columnId];
        return { ...r, values };
      }),
    });
  };

  const addRow = () => {
    const values: Record<string, string> = {};
    for (const col of table.columns) {
      values[col.id] = "";
    }
    const newRow: ExternalTableRow = { id: crypto.randomUUID(), values };
    onUpdate({ rows: [...table.rows, newRow] });
  };

  const removeRow = (rowId: string) => {
    onUpdate({ rows: table.rows.filter(r => r.id !== rowId) });
  };

  const updateCell = (rowId: string, columnId: string, value: string) => {
    onUpdate({
      rows: table.rows.map(r =>
        r.id === rowId
          ? { ...r, values: { ...r.values, [columnId]: value } }
          : r
      ),
    });
  };

  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    columnIndex: number
  ) => {
    const columnsCount = table.columns.length;
    if (columnsCount === 0) return;

    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        `[data-table-id="${table.id}"][data-cell="true"]`
      )
    );
    const currentIndex = rowIndex * columnsCount + columnIndex;
    let nextIndex = -1;

    if (e.key === "Tab") {
      e.preventDefault();
      nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
    } else if (e.key === "Enter") {
      e.preventDefault();
      nextIndex = currentIndex + columnsCount;
    }

    if (nextIndex >= 0 && nextIndex < inputs.length) {
      inputs[nextIndex]?.focus();
    }
  };

  return (
    <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#37474f] bg-[#21282c]">
        <Table2 size={16} className="text-[#2eff8c] shrink-0" />
        <Input
          value={table.name}
          onChange={e => onUpdate({ name: e.target.value })}
          className="h-8 bg-transparent border-0 text-white font-medium px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[#798389] hover:text-red-400 hover:bg-red-500/10 shrink-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {table.columns.length === 0 ? (
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs text-[#798389]">
            Добавьте первую переменную, чтобы начать заполнять таблицу.
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={newColumnName}
              onChange={e => setNewColumnName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") addColumn();
              }}
              placeholder="Название переменной"
              className="h-8 w-48 bg-[#2a3237] border-[#434e54] text-white text-xs"
            />
            <Button
              onClick={addColumn}
              variant="outline"
              size="sm"
              className="h-8 border-[#2eff8c]/50 text-[#2eff8c] hover:bg-[#2eff8c]/10"
            >
              <Plus size={14} className="mr-1" />
              Столбец
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Spreadsheet-like table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-10 p-0 border-b border-r border-[#37474f] bg-[#232a2e]"></th>
                  {table.columns.map(col => (
                    <th
                      key={col.id}
                      className="p-0 border-b border-r border-[#37474f] bg-[#232a2e] min-w-[120px] group"
                    >
                      <div className="flex items-center gap-1 px-3 py-2">
                        <input
                          value={col.name}
                          onChange={e =>
                            updateColumnName(col.id, e.target.value)
                          }
                          className="w-full bg-transparent text-white font-medium text-xs outline-none placeholder:text-[#5c676d]"
                          placeholder="Переменная"
                        />
                        <button
                          onClick={() => removeColumn(col.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#798389] hover:text-red-400 p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="p-0 border-b border-[#37474f] bg-[#232a2e]">
                    <button
                      onClick={addColumn}
                      className="flex items-center gap-1 w-full h-full px-3 py-2 text-xs text-[#798389] hover:text-[#2eff8c] hover:bg-[#2a3237] transition-colors"
                    >
                      <Plus size={12} />
                      Столбец
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={row.id} className="group">
                    <td className="w-10 p-0 border-b border-r border-[#37474f] bg-[#1f262a]">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="flex items-center justify-center w-full h-9 opacity-0 group-hover:opacity-100 transition-opacity text-[#798389] hover:text-red-400"
                      >
                        <X size={12} />
                      </button>
                    </td>
                    {table.columns.map((col, colIndex) => {
                      const value = row.values[col.id] ?? "";
                      const valid = isValidNumber(value);
                      return (
                        <td
                          key={col.id}
                          className="p-0 border-b border-r border-[#37474f]"
                        >
                          <input
                            data-table-id={table.id}
                            data-cell="true"
                            value={value}
                            onChange={e =>
                              updateCell(row.id, col.id, e.target.value)
                            }
                            onKeyDown={e =>
                              handleCellKeyDown(e, rowIndex, colIndex)
                            }
                            className={`w-full h-9 px-3 bg-[#1a1f22] text-white text-xs outline-none transition-colors focus:bg-[#232a2e] ${
                              !valid
                                ? "text-red-400 border-b-2 border-red-500"
                                : "border-b-2 border-transparent"
                            }`}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                    <td className="p-0 border-b border-[#37474f] bg-[#1a1f22]/50"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add row button */}
          <button
            onClick={addRow}
            className="flex items-center gap-1 w-full px-4 py-2 text-xs text-[#798389] hover:text-[#2eff8c] hover:bg-[#2a3237] transition-colors border-t border-[#37474f]"
          >
            <Plus size={12} />
            Строка
          </button>
        </>
      )}
    </div>
  );
}
