/**
 * Jupyter Notebook Management — Admin GUI for uploading and managing
 * Jupyter notebooks attached to course subtopics.
 *
 * Features:
 * - Upload .ipynb files linked to subtopics
 * - Grant/revoke per-student access
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
import { Badge } from "@/components/ui/badge";
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
  Users,
  ExternalLink,
  Download,
  X,
  Plus,
  Loader2,
} from "lucide-react";

export default function JupyterNotebookManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [accessDialogNotebook, setAccessDialogNotebook] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSubtopicNodeId, setUploadSubtopicNodeId] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Access grant
  const [grantStudentId, setGrantStudentId] = useState<string>("");

  const { data: notebooks, isLoading } =
    trpc.admin.listJupyterNotebooks.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });

  const { data: topicNodes } = trpc.admin.listTopicNodes.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: students } = trpc.student.list.useQuery(
    { status: "active", pageSize: 100 },
    { enabled: !!user && user.role === "admin" }
  );

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

  const { data: accessList, isLoading: accessLoading } =
    trpc.admin.listJupyterAccess.useQuery(
      { notebookId: accessDialogNotebook?.id ?? 0 },
      { enabled: !!accessDialogNotebook }
    );

  const grantMutation = trpc.admin.grantJupyterAccess.useMutation({
    onSuccess: data => {
      if (data.alreadyGranted) {
        toast("Доступ уже был предоставлен");
      } else {
        toast("Доступ предоставлен");
      }
      utils.admin.listJupyterAccess.invalidate({
        notebookId: accessDialogNotebook?.id ?? 0,
      });
      utils.admin.listJupyterNotebooks.invalidate();
      setGrantStudentId("");
    },
    onError: err => toast(err.message),
  });

  const revokeMutation = trpc.admin.revokeJupyterAccess.useMutation({
    onSuccess: () => {
      toast("Доступ отозван");
      utils.admin.listJupyterAccess.invalidate({
        notebookId: accessDialogNotebook?.id ?? 0,
      });
      utils.admin.listJupyterNotebooks.invalidate();
    },
    onError: err => toast(err.message),
  });

  const subtopicMap = useMemo(() => {
    const map = new Map<number, string>();
    topicNodes?.forEach(n => {
      if (n.parentId !== null) map.set(n.id, n.title);
    });
    return map;
  }, [topicNodes]);

  const filtered = notebooks?.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      (subtopicMap.get(n.subtopicNodeId) ?? "").toLowerCase().includes(q)
    );
  });

  function resetUploadForm() {
    setUploadFile(null);
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

  function handleGrantAccess() {
    if (!accessDialogNotebook || !grantStudentId) return;
    grantMutation.mutate({
      notebookId: accessDialogNotebook.id,
      localUserId: Number(grantStudentId),
    });
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
              Управление ноутбуками, доступом студентов и просмотр
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
            placeholder="Поиск по названию или подразделу..."
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
                      Название
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Файл
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Доступы
                    </th>
                    <th className="text-right p-4 text-gray-400 font-medium">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
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
                        {subtopicMap.get(n.subtopicNodeId) ?? "—"}
                      </td>
                      <td className="p-4 font-medium">{n.title}</td>
                      <td className="p-4">
                        <a
                          href={`/api/jupyter/download/${n.id}`}
                          className="inline-flex items-center gap-1 text-[#2eff8c] hover:underline text-xs truncate max-w-[200px]"
                        >
                          <Download className="h-3 w-3" />
                          {n.filename}
                        </a>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-[#37474f] text-white">
                          <Users className="h-3 w-3 mr-1" />
                          {n.accessCount}
                        </Badge>
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
                            onClick={() =>
                              setAccessDialogNotebook({
                                id: n.id,
                                title: n.title,
                              })
                            }
                            title="Управление доступом"
                          >
                            <Users className="h-4 w-4 text-[#01acff]" />
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
              <Label htmlFor="subtopic">Подраздел</Label>
              <Select
                value={uploadSubtopicNodeId}
                onValueChange={setUploadSubtopicNodeId}
              >
                <SelectTrigger className="bg-[#263238] border-[#37474f] mt-1">
                  <SelectValue placeholder="Выберите подраздел..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2529] border-[#37474f]">
                  {topicNodes
                    ?.filter(n => n.parentId !== null)
                    .map(s => (
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

      {/* Access Management Dialog */}
      <Dialog
        open={!!accessDialogNotebook}
        onOpenChange={open => !open && setAccessDialogNotebook(null)}
      >
        <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Доступ к ноутбуку</DialogTitle>
            <DialogDescription className="text-gray-400">
              {accessDialogNotebook?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Grant access */}
          <div className="flex gap-2 mt-4">
            <Select value={grantStudentId} onValueChange={setGrantStudentId}>
              <SelectTrigger className="bg-[#263238] border-[#37474f] flex-1">
                <SelectValue placeholder="Выберите студента..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e2529] border-[#37474f]">
                {students?.users.map(
                  (s: { id: number; name: string; login: string }) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.login})
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleGrantAccess}
              disabled={!grantStudentId || grantMutation.isPending}
              className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Дать доступ
            </Button>
          </div>

          {/* Access list */}
          <div className="mt-4 max-h-64 overflow-y-auto">
            {accessLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 bg-[#37474f]" />
                ))}
              </div>
            ) : accessList && accessList.length > 0 ? (
              <div className="space-y-2">
                {accessList.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 bg-[#263238] rounded-lg border border-[#37474f]"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.studentName}</p>
                      <p className="text-xs text-gray-400">{a.studentLogin}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeMutation.mutate({ accessId: a.id })}
                    >
                      <X className="h-4 w-4 text-[#ff6b6b]" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Нет выданных доступов
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
