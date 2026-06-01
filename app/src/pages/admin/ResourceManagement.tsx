/**
 * Resource Management — Admin GUI for CRUD on additional resources
 *
 * Features:
 * - List all resources with filtering by type
 * - Create resource with form
 * - Edit resource
 * - Delete with confirmation
 */

import { useState } from "react";
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
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";

import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  Video,
  FileText,
  Box,
} from "lucide-react";

const TYPE_OPTIONS = [
  { value: "video", label: "Видео" },
  { value: "reference", label: "Справочник" },
  { value: "workbook", label: "Задачник" },
  { value: "model", label: "Модель" },
];

const TYPE_COLORS: Record<string, string> = {
  video: "bg-blue-600 text-white",
  reference: "bg-emerald-600 text-white",
  workbook: "bg-yellow-600 text-white",
  model: "bg-red-600 text-white",
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  reference: BookOpen,
  workbook: FileText,
  model: Box,
};

type Resource = {
  id: number;
  title: string;
  description: string | null;
  type: "video" | "reference" | "workbook" | "model";
  url: string | null;
  tags: string | null;
  createdAt: Date | null;
};

export default function ResourceManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "video" | "reference" | "workbook" | "model" | undefined
  >(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"video" | "reference" | "workbook" | "model">("video");
  const [formUrl, setFormUrl] = useState("");
  const [formTags, setFormTags] = useState("");

  const { data: resources, isLoading } = trpc.admin.listResources.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const createMutation = trpc.admin.createResource.useMutation({
    onSuccess: () => {
      toast("Ресурс создан");
      utils.admin.listResources.invalidate();
      utils.course.resources.invalidate();
      setCreateOpen(false);
      resetCreateForm();
    },
    onError: (err) => toast(err.message),
  });

  const updateMutation = trpc.admin.updateResource.useMutation({
    onSuccess: () => {
      toast("Ресурс обновлён");
      utils.admin.listResources.invalidate();
      utils.course.resources.invalidate();
      setEditResource(null);
    },
    onError: (err) => toast(err.message),
  });

  const deleteMutation = trpc.admin.deleteResource.useMutation({
    onSuccess: () => {
      toast("Ресурс удалён");
      utils.admin.listResources.invalidate();
      utils.course.resources.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  const filtered = resources?.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const inTitle = r.title.toLowerCase().includes(q);
      const inDesc = r.description?.toLowerCase().includes(q);
      const inTags = r.tags?.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inTags) return false;
    }
    return true;
  });

  function resetCreateForm() {
    setFormTitle("");
    setFormDescription("");
    setFormType("video");
    setFormUrl("");
    setFormTags("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      title: formTitle,
      description: formDescription || undefined,
      type: formType,
      url: formUrl || undefined,
      tags: formTags || undefined,
    });
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editResource) return;
    const data: {
      title?: string;
      description?: string;
      type?: "video" | "reference" | "workbook" | "model";
      url?: string;
      tags?: string;
    } = {};
    if (formTitle !== editResource.title) data.title = formTitle;
    if (formDescription !== (editResource.description ?? "")) data.description = formDescription;
    if (formType !== editResource.type) data.type = formType;
    if (formUrl !== (editResource.url ?? "")) data.url = formUrl;
    if (formTags !== (editResource.tags ?? "")) data.tags = formTags;
    if (Object.keys(data).length === 0) {
      setEditResource(null);
      return;
    }
    updateMutation.mutate({ id: editResource.id, ...data });
  }

  function openEdit(resource: Resource) {
    setEditResource(resource);
    setFormTitle(resource.title);
    setFormDescription(resource.description ?? "");
    setFormType(resource.type);
    setFormUrl(resource.url ?? "");
    setFormTags(resource.tags ?? "");
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Управление ресурсами</h1>
            <p className="text-sm text-gray-400">
              Добавление, редактирование и удаление материалов вкладки «Ресурсы»
            </p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]">
              <Plus className="h-4 w-4 mr-2" />
              Добавить ресурс
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Новый ресурс</DialogTitle>
              <DialogDescription className="text-gray-400">
                Заполните информацию о новом материале.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Название ресурса"
                  className="bg-[#263238] border-[#37474f] mt-1"
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <Label htmlFor="type">Тип</Label>
                <Select
                  value={formType}
                  onValueChange={(v) =>
                    setFormType(v as "video" | "reference" | "workbook" | "model")
                  }
                >
                  <SelectTrigger className="bg-[#263238] border-[#37474f] mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2529] border-[#37474f]">
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="url">URL (ссылка)</Label>
                <Input
                  id="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-[#263238] border-[#37474f] mt-1"
                  maxLength={500}
                />
              </div>
              <div>
                <Label htmlFor="tags">Теги (через запятую)</Label>
                <Input
                  id="tags"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Механика, Кинематика, Динамика"
                  className="bg-[#263238] border-[#37474f] mt-1"
                  maxLength={500}
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Краткое описание ресурса..."
                  className="bg-[#263238] border-[#37474f] mt-1"
                  rows={3}
                  maxLength={5000}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Создание..." : "Создать ресурс"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по названию, описанию или тегам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1e2529] border-[#37474f]"
          />
        </div>
        <Select
          value={typeFilter ?? "all"}
          onValueChange={(v) =>
            setTypeFilter(
              v === "all" ? undefined : (v as "video" | "reference" | "workbook" | "model")
            )
          }
        >
          <SelectTrigger className="w-48 bg-[#1e2529] border-[#37474f]">
            <SelectValue placeholder="Все типы" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2529] border-[#37474f]">
            <SelectItem value="all">Все типы</SelectItem>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                    <th className="text-left p-4 text-gray-400 font-medium">Название</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Тип</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Теги</th>
                    <th className="text-left p-4 text-gray-400 font-medium">URL</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Ресурсы не найдены
                      </td>
                    </tr>
                  )}
                  {filtered?.map((r) => {
                    const Icon = TYPE_ICONS[r.type] || BookOpen;
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-[#37474f]/50 hover:bg-[#263238]/50"
                      >
                        <td className="p-4 font-mono text-xs text-gray-400">{r.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[#2eff8c]" />
                            <span className="font-medium">{r.title}</span>
                          </div>
                          {r.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {r.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={TYPE_COLORS[r.type] ?? "bg-gray-600"}>
                            {TYPE_OPTIONS.find((o) => o.value === r.type)?.label ?? r.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {r.tags?.split(",").map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] text-gray-400 bg-[#263238] px-2 py-0.5 rounded-full"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          {r.url ? (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2eff8c] hover:underline text-xs truncate max-w-[150px] inline-block"
                              title={r.url}
                            >
                              {r.url}
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(r as Resource)}
                              title="Редактировать"
                            >
                              <Pencil className="h-4 w-4 text-[#2eff8c]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Удалить ресурс «${r.title}»? Это действие нельзя отменить.`
                                  )
                                ) {
                                  deleteMutation.mutate({ id: r.id });
                                }
                              }}
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
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
      {editResource && (
        <Dialog open={!!editResource} onOpenChange={() => setEditResource(null)}>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать ресурс</DialogTitle>
              <DialogDescription className="text-gray-400">
                Измените данные ресурса. Оставьте поля пустыми, если не требуется изменение.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-[#263238] border-[#37474f] mt-1"
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <Label>Тип</Label>
                <Select
                  value={formType}
                  onValueChange={(v) =>
                    setFormType(v as "video" | "reference" | "workbook" | "model")
                  }
                >
                  <SelectTrigger className="bg-[#263238] border-[#37474f] mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2529] border-[#37474f]">
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="bg-[#263238] border-[#37474f] mt-1"
                  maxLength={500}
                />
              </div>
              <div>
                <Label>Теги (через запятую)</Label>
                <Input
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="bg-[#263238] border-[#37474f] mt-1"
                  maxLength={500}
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-[#263238] border-[#37474f] mt-1"
                  rows={3}
                  maxLength={5000}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
