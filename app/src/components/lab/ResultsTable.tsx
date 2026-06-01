import { Trash2, Plus, Eraser } from "lucide-react";

interface HeaderDef {
  key: string;
  label: string;
}

interface ResultsTableProps {
  headers: HeaderDef[];
  data: Record<string, string | number>[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onClear: () => void;
  averages?: Record<string, string | number>;
}

export default function ResultsTable({
  headers,
  data,
  onAdd,
  onDelete,
  onClear,
  averages,
}: ResultsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2eff8c] text-[#0d1117] text-sm font-medium hover:bg-[#25cc70] transition-colors"
        >
          <Plus size={16} />
          Добавить измерение
        </button>
        {data.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            <Eraser size={16} />
            Очистить таблицу
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#37474f]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e2529]">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className="text-left px-4 py-3 text-[#798389] font-medium border-b border-[#37474f] whitespace-nowrap"
                >
                  {h.label}
                </th>
              ))}
              <th className="w-12 border-b border-[#37474f]" />
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-4 py-8 text-center text-[#798389]"
                >
                  Нет данных. Нажмите «Добавить измерение».
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="bg-[#1a1f22] hover:bg-[#1e2529] transition-colors"
                >
                  {headers.map((h) => (
                    <td
                      key={h.key}
                      className="px-4 py-2.5 text-white border-b border-[#37474f]/50 whitespace-nowrap"
                    >
                      {row[h.key] ?? "—"}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 border-b border-[#37474f]/50">
                    <button
                      onClick={() => onDelete(i)}
                      className="text-[#798389] hover:text-red-400 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
            {averages && data.length > 0 && (
              <tr className="bg-[#2a3237]">
                {headers.map((h) => (
                  <td
                    key={h.key}
                    className="px-4 py-2.5 text-[#2eff8c] font-medium whitespace-nowrap"
                  >
                    {averages[h.key] ?? ""}
                  </td>
                ))}
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
