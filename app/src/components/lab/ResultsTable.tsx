import { Trash2, Eraser } from "lucide-react";

interface HeaderDef {
  key: string;
  label: string;
}

interface ResultsTableProps {
  headers: HeaderDef[];
  data: Record<string, string | number>[];
  onDelete: (index: number) => void;
  onClear: () => void;
}

export default function ResultsTable({
  headers,
  data,
  onDelete,
  onClear,
}: ResultsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
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
              {headers.map(h => (
                <th
                  key={h.key}
                  className="text-left px-4 py-3 text-[#c8cdd1] font-semibold border-b border-[#37474f] whitespace-nowrap"
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
                  className="px-4 py-8 text-center text-[#c8cdd1]"
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
                  {headers.map(h => (
                    <td
                      key={h.key}
                      className="px-4 py-2.5 text-[#c8cdd1] border-b border-[#37474f]/50 whitespace-nowrap"
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
