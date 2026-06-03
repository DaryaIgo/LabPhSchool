/**
 * Subtopic Management — Admin GUI for managing Jupyter notebook URLs
 * attached to course subtopics.
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  BookOpen,
  Search,
  Pencil,
  ExternalLink,
  NotebookPen,
} from "lucide-react";

export default function SubtopicManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [editSubtopic, setEditSubtopic] = useState<{
    id: number;
    title: string;
    jupyterUrl: string | null;
  } | null>(null);
  const [formUrl, setFormUrl] = useState("");

  const { data: subtopics, isLoading } = trpc.admin.listSubtopics.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const { data: topics } = trpc.course.topics.useQuery();

  const updateMutation = trpc.admin.updateSubtopic.useMutation({
    onSuccess: () => {
      toast("Ссылка обновлена");
      utils.admin.listSubtopics.invalidate();
      utils.student.getLearningPath.invalidate();
      setEditSubtopic(null);
    },
    onError: (err) => toast(err.message),
  });

  const topicMap = useMemo(() => {
    const map = new Map<number, string>();
    topics?.forEach((t) => map.set(t.id, t.title));
    return map;
  }, [topics]);

  const filtered = subtopics?.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (topicMap.get(s.topicId) ?? "").toLowerCase().includes(q)
    );
  });

  function openEdit(subtopic: typeof editSubtopic) {
    if (!subtopic) return;
    setEditSubtopic(subtopic);
    setFormUrl(subtopic.jupyterUrl ?? "");
  }

  function handleUpdate(e?: React.FormEvent) {
    e?.preventDefault();
    console.log("[SubtopicManagement] handleUpdate", { editSubtopic, formUrl });
    if (!editSubtopic) return;
    const url = formUrl.trim() || null;
    if (url === editSubtopic.jupyterUrl) {
      console.log("[SubtopicManagement] no change, closing dialog");
      setEditSubtopic(null);
      return;
    }
    console.log("[SubtopicManagement] calling mutate with", { id: editSubtopic.id, jupyterUrl: url });
    updateMutation.mutate({
      id: editSubtopic.id,
      jupyterUrl: url,
    });
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <NotebookPen className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Jupyter-ноутбуки подразделов</h1>
            <p className="text-sm text-gray-400">
              Управление ссылками на внешние Jupyter-ноутбуки для каждого подраздела курса
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по названию подраздела или темы..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1e2529] border-[#37474f]"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#1e2529] border-[#37474f]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-[#37474f]" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#37474f]">
                    <th className="text-left p-4 text-gray-400 font-medium">ID</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Тема</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Подраздел</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Системное имя ссылки</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Ссылка</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Подразделы не найдены
                      </td>
                    </tr>
                  )}
                  {filtered?.map((s) => {
                    const linkName = `Jupyter- ${s.title}`;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-[#37474f]/50 hover:bg-[#263238]/50"
                      >
                        <td className="p-4 font-mono text-xs text-gray-400">{s.id}</td>
                        <td className="p-4 text-gray-300">
                          {topicMap.get(s.topicId) ?? "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-[#2eff8c]" />
                            <span className="font-medium">{s.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{linkName}</td>
                        <td className="p-4">
                          {s.jupyterUrl ? (
                            <a
                              href={s.jupyterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#2eff8c] hover:underline text-xs truncate max-w-[200px]"
                              title={s.jupyterUrl}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {linkName}
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs">Не задана</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openEdit({
                                  id: s.id,
                                  title: s.title,
                                  jupyterUrl: s.jupyterUrl ?? null,
                                })
                              }
                              title="Редактировать ссылку"
                            >
                              <Pencil className="h-4 w-4 text-[#2eff8c]" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editSubtopic && (
        <Dialog open={!!editSubtopic} onOpenChange={() => setEditSubtopic(null)}>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать Jupyter-ссылку</DialogTitle>
              <DialogDescription className="text-gray-400">
                Подраздел: <span className="text-white">{editSubtopic.title}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="jupyterUrl">URL Jupyter-ноутбука</Label>
                <Input
                  id="jupyterUrl"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-[#263238] border-[#37474f] mt-1"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Оставьте пустым, чтобы удалить ссылку.
                </p>
              </div>
              <Button
                onClick={handleUpdate}
                className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
