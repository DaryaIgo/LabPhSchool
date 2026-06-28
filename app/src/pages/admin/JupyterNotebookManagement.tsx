/**
 * Jupyter Notebook Management — Admin GUI for uploading and managing
 * Jupyter notebooks attached to course subtopics.
 *
 * Features:
 * - Upload .ipynb files linked to subtopics
 * - Open notebooks in JupyterLite
 * - Download notebooks
 */

import { useState, useRef, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
  NotebookPen,
  Search,
  Upload,
  Trash2,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Б";
  const k = 1024;
  const sizes = ["Б", "КБ", "МБ", "ГБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function JupyterNotebookManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTopicNodeId, setUploadTopicNodeId] = useState<string>("");
  const [uploadSubtopicNodeId, setUploadSubtopicNodeId] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: notebooks, isLoading } =
    trpc.admin.listJupyterNotebooks.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });

  const { data: topics } = trpc.course.topics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: subtopics } = trpc.course.listSubtopics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const createMutation = trpc.admin.createJupyterNotebook.useMutation({
    onSuccess: () => {
      toast("Ноутбук загружен");
      utils.admin.listJupyterNotebooks.invalidate();
      setUploadOpen(false);
      resetUploadForm();
    },
    onError: err => toast(err.message),
  });

  const deleteMutation = trpc.admin.deleteJupyterNotebook.useMutation({
    onSuccess: () => {
      toast("Ноутбук удалён");
      utils.admin.listJupyterNotebooks.invalidate();
    },
    onError: err => toast(err.message),
  });

  const topicMap = useMemo(() => {
    const map = new Map<number, string>();
    topics?.forEach(t => map.set(t.id, t.title));
    return map;
  }, [topics]);

  const subtopicMap = useMemo(() => {
    const map = new Map<number, { title: string; parentId: number }>();
    subtopics?.forEach(s => {
      if (s.parentId !== null) {
        map.set(s.id, { title: s.title, parentId: s.parentId });
      }
    });
    return map;
  }, [subtopics]);

  const subtopicOptions = useMemo(() => {
    if (!uploadTopicNodeId || !subtopics) return [];
    const topicId = Number(uploadTopicNodeId);
    return subtopics.filter(s => s.parentId === topicId);
  }, [uploadTopicNodeId, subtopics]);

  const filtered = notebooks?.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    const sub = subtopicMap.get(n.subtopicNodeId);
    const topicTitle = sub ? (topicMap.get(sub.parentId) ?? "") : "";
    return (
      n.filename.toLowerCase().includes(q) ||
      (sub?.title ?? "").toLowerCase().includes(q) ||
      topicTitle.toLowerCase().includes(q)
    );
  });

  function resetUploadForm() {
    setUploadFile(null);
    setUploadTopicNodeId("");
    setUploadSubtopicNodeId("");
    setUploadTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadSubtopicNodeId || !uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch("/api/upload/jupyter", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        createMutation.mutate({
          subtopicNodeId: Number(uploadSubtopicNodeId),
          title: uploadTitle.trim(),
          filename: uploadFile.name,
          filePath: data.url,
        });
      } else {
        toast(data.error || "Ошибка загрузки файла");
      }
    } catch {
      toast("Ошибка загрузки файла");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".ipynb")) {
      toast("Только файлы .ipynb");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.ipynb$/i, ""));
    }
  }

  function openJupyterLite() {
    const url = `https://jupyterlite.github.io/demo/lab/index.html`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <NotebookPen className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Notebook Management</h1>
            <p className="text-sm text-gray-400">
              Управление ноутбуками для назначения через Enrollments
            </p>
          </div>
        </div>
        <Button
          className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Загрузить ноутбук
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по файлу или подразделу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
                    <th className="text-left p-4 text-gray-400 font-medium">
                      ID
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Подраздел
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Файл
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Размер
                    </th>
                    <th className="text-right p-4 text-gray-400 font-medium">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Ноутбуки не найдены
                      </td>
                    </tr>
                  )}
                  {filtered?.map(n => (
                    <tr
                      key={n.id}
                      className="border-b border-[#37474f]/50 hover:bg-[#263238]/50"
                    >
                      <td className="p-4 font-mono text-xs text-gray-400">
                        {n.id}
                      </td>
                      <td className="p-4 text-gray-300">
                        {(() => {
                          const sub = subtopicMap.get(n.subtopicNodeId);
                          if (!sub) return "—";
                          const topicTitle = topicMap.get(sub.parentId) ?? "—";
                          return (
                            <span className="text-xs">
                              <span className="text-gray-400">
                                {topicTitle}
                              </span>
                              <span className="mx-1 text-gray-500">→</span>
                              <span>{sub.title}</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <a
                          href={`/api/jupyter/download/${n.id}`}
                          className="inline-flex items-center gap-1 text-[#2eff8c] hover:underline text-xs truncate max-w-[200px]"
                        >
                          <Download className="h-3 w-3" />
                          {n.filename}
                        </a>
                      </td>
                      <td className="p-4 text-gray-300 text-xs">
                        {n.fileSize != null ? formatBytes(n.fileSize) : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openJupyterLite()}
                            title="Открыть в JupyterLite"
                          >
                            <ExternalLink className="h-4 w-4 text-[#2eff8c]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Удалить ноутбук?")) {
                                deleteMutation.mutate({ id: n.id });
                              }
                            }}
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4 text-[#ff6b6b]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Загрузить Jupyter-ноутбук</DialogTitle>
            <DialogDescription className="text-gray-400">
              Выберите файл .ipynb и укажите подраздел курса.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="file">Файл .ipynb</Label>
              <Input
                id="file"
                type="file"
                accept=".ipynb"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="bg-[#263238] border-[#37474f] mt-1 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="topic">Тема</Label>
              <Select
                value={uploadTopicNodeId}
                onValueChange={v => {
                  setUploadTopicNodeId(v);
                  setUploadSubtopicNodeId("");
                }}
              >
                <SelectTrigger className="bg-[#263238] border-[#37474f] mt-1">
                  <SelectValue placeholder="Выберите тему..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  {topics?.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subtopic">Раздел</Label>
              <Select
                value={uploadSubtopicNodeId}
                onValueChange={setUploadSubtopicNodeId}
                disabled={!uploadTopicNodeId}
              >
                <SelectTrigger className="bg-[#263238] border-[#37474f] mt-1">
                  <SelectValue
                    placeholder={
                      uploadTopicNodeId
                        ? "Выберите раздел..."
                        : "Сначала выберите тему"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  {subtopicOptions.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="Название ноутбука"
                className="bg-[#263238] border-[#37474f] mt-1"
                required
                maxLength={255}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUploadOpen(false);
                  resetUploadForm();
                }}
                className="border-[#37474f] text-white hover:bg-[#263238]"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !uploadFile || !uploadSubtopicNodeId}
                className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Загрузить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
