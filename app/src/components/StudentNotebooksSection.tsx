import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  NotebookPen,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
} from "lucide-react";

export default function StudentNotebooksSection() {
  const { data, isLoading } = trpc.student.getMyJupyterNotebooks.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 bg-[#37474f]" />
        ))}
      </div>
    );
  }

  const notebooks = data ?? [];

  return (
    <div>
      {/* Active notebooks */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <Clock size={14} className="text-[#01acff]" />
          Доступные
        </h3>
        {notebooks.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notebooks.map(nb => (
              <Card
                key={nb.id}
                className="bg-[#2a3237] border-[#434e54] hover:border-[#2eff8c]/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <NotebookPen
                      size={20}
                      className="text-[#2eff8c] shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#c8cdd1] truncate">
                        {nb.title}
                      </h3>
                      <p className="text-xs text-[#798389] mt-1">
                        {nb.subtopicTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <a
                          href={`/api/jupyter/download/${nb.id}`}
                          className="inline-flex items-center gap-1 text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-3 py-1.5 rounded-md hover:bg-[#2eff8c]/20 transition-colors"
                        >
                          <Download size={12} />
                          Скачать
                        </a>
                        {nb.filePath && (
                          <a
                            href={`/api/jupyter/download/${nb.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#01acff] hover:underline"
                          >
                            <ExternalLink size={12} />
                            Открыть
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#798389]">
            У вас пока нет доступных тетрадей. Преподаватель откроет доступ к
            новым материалам.
          </p>
        )}
      </div>

      {/* Archive placeholder */}
      <div>
        <h3 className="text-sm font-medium text-[#798389] mb-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#2eff8c]" />
          Архив выполненных
        </h3>
        <p className="text-sm text-[#798389]">
          Архив тетрадей пока недоступен.
        </p>
      </div>
    </div>
  );
}
