import { Trash2 } from "lucide-react";

interface HeaderDef {
  key: string;
  label: string;
}

interface ResultsTableProps {
  headers: HeaderDef[];
  data: Record<string, string | number>[];
  onDelete: (index: number) => void;
}

export default function ResultsTable({
  headers,
  data,
  onDelete,
}: ResultsTableProps) {
  const hasHeaders = headers.length > 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-[#37474f]">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#1e2529]">
            {hasHeaders ? (
              headers.map(h => (
                <th
                  key={h.key}
                  className="text-left px-3 py-2.5 text-[#96a3ab] font-medium border-b border-[#37474f] whitespace-nowrap"
                >
                  {h.label}
                </th>
              ))
            ) : (
              <th className="text-left px-3 py-2.5 text-[#96a3ab] font-medium border-b border-[#37474f]">
                Колонки
              </th>
            )}
            <th className="w-10 border-b border-[#37474f]" />
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={hasHeaders ? headers.length + 1 : 2}
                className="px-3 py-6 text-center text-[#798389]"
              >
                Нет данных. Нажмите «Зафиксировать».
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="bg-[#1a1f22] hover:bg-[#1e2529] transition-colors"
              >
                {headers.map((h, hi) => (
                  <td
                    key={h.key}
                    className={`px-3 py-2 text-[#c8cdd1] whitespace-nowrap ${
                      hi === 0 ? "text-white font-medium" : ""
                    }`}
                  >
                    {row[h.key] ?? "—"}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <button
                    onClick={() => onDelete(i)}
                    className="text-[#798389] hover:text-red-400 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
