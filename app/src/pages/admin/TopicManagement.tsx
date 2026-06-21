import { useState, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TreePine,
  Plus,

  Trash2,
  Save,
  Download,
  Upload,
  Image as ImageIcon,
  Images,
  ChevronRight,
  ChevronDown,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { TopicNode } from "@db/schema";

interface TreeNode extends TopicNode {
  children: TreeNode[];
}

function buildTree(nodes: TopicNode[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];
  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }
  for (const node of nodes) {
    const treeNode = map.get(node.id)!;
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  }
  return roots;
}

function TreeItem({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: {
  node: TreeNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setExpanded((e) => !e);
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
          selectedId === node.id
            ? "bg-[#2eff8c]/20 text-[#2eff8c]"
            : "text-[#c8cdd1] hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((e) => !e);
            }}
            className="shrink-0"
          >
            {expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </span>
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        <FileText size={14} className="shrink-0" />
        <span className="truncate">{node.title}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const initialForm = {
  title: "",
  slug: "",
  order: 1,
  color: "#2eff8c",
  content: "",
  jupyterUrl: "",
};

export default function TopicManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creatingChildOf, setCreatingChildOf] = useState<number | null>(null);
  const [form, setForm] = useState({ ...initialForm });
  const [isEditing, setIsEditing] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [importMd, setImportMd] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const lastSelectedIdRef = useRef<number | null>(null);

  const { data: nodes, isLoading } = trpc.admin.listTopicNodes.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const { data: images } = trpc.admin.listImages.useQuery(undefined, {
    enabled: !!user && user.role === "admin" && galleryOpen,
    refetchOnWindowFocus: false,
  });

  const tree = useMemo(() => buildTree(nodes || []), [nodes]);

  const loadNodeIntoForm = useCallback((id: number) => {
    const node = nodes?.find((n) => n.id === id);
    if (node) {
      setForm({
        title: node.title,
        slug: node.slug,
        order: node.order,
        color: node.color || "#2eff8c",
        content: node.content || "",
        jupyterUrl: node.jupyterUrl || "",
      });
      setIsEditing(true);
    }
  }, [nodes]);

  const createMutation = trpc.admin.createTopicNode.useMutation({
    onSuccess: (res) => {
      toast("Узел создан");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
      if (res.id) {
        setSelectedId(res.id);
        lastSelectedIdRef.current = res.id;
        setIsEditing(true);
      }
      setCreatingChildOf(null);
    },
    onError: (err) => toast(err.message),
  });

  const updateMutation = trpc.admin.updateTopicNode.useMutation({
    onSuccess: () => {
      toast("Сохранено");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  const deleteMutation = trpc.admin.deleteTopicNode.useMutation({
    onSuccess: () => {
      toast("Удалено");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
      setSelectedId(null);
      lastSelectedIdRef.current = null;
      setForm({ ...initialForm });
      setIsEditing(false);
    },
    onError: (err) => toast(err.message),
  });

  const importMutation = trpc.admin.importTopicNode.useMutation({
    onSuccess: (res) => {
      toast("Импорт завершен");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
      setImportOpen(false);
      setImportMd("");
      if (res.id) {
        setSelectedId(res.id);
        lastSelectedIdRef.current = res.id;
        setIsEditing(true);
      }
    },
    onError: (err) => toast(err.message),
  });

  const handleSave = useCallback(() => {
    if (!form.title || !form.slug) {
      toast("Заполните название и slug");
      return;
    }
    if (isEditing && selectedId) {
      updateMutation.mutate({
        id: selectedId,
        title: form.title,
        slug: form.slug,
        order: form.order,
        color: form.color,
        content: form.content,
        jupyterUrl: form.jupyterUrl || null,
      });
    } else {
      createMutation.mutate({
        parentId: creatingChildOf ?? undefined,
        title: form.title,
        slug: form.slug,
        order: form.order,
        color: form.color,
        content: form.content,
        jupyterUrl: form.jupyterUrl || null,
      });
    }
  }, [form, isEditing, selectedId, creatingChildOf, updateMutation, createMutation]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    if (confirm("Удалить узел и все его дочерние элементы?")) {
      deleteMutation.mutate({ id: selectedId });
    }
  }, [selectedId, deleteMutation]);

  const handleAddChild = useCallback(() => {
    if (!selectedId) return;
    setCreatingChildOf(selectedId);
    setSelectedId(null);
    const siblingCount =
      nodes?.filter((n) => n.parentId === selectedId).length ?? 0;
    setForm({ ...initialForm, order: siblingCount + 1 });
    setIsEditing(false);
  }, [selectedId, nodes]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          toast(`Ошибка загрузки: ${data.error || res.statusText}`);
          return;
        }
        if (data.url) {
          const imageMarkdown = `\n![${file.name}](${data.url})\n`;
          setForm((f) => ({ ...f, content: f.content + imageMarkdown }));
          toast("Картинка загружена");
        } else {
          toast("Ошибка загрузки: сервер не вернул ссылку");
        }
      } catch (err) {
        toast(`Ошибка загрузки: ${err instanceof Error ? err.message : "неизвестная ошибка"}`);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      setImportMd(text);
      if (importFileRef.current) importFileRef.current.value = "";
    },
    []
  );

  const handleImport = useCallback(() => {
    if (!importMd.trim()) {
      toast("Вставьте markdown");
      return;
    }
    importMutation.mutate({
      parentId: selectedId ?? undefined,
      markdown: importMd,
    });
  }, [importMd, selectedId, importMutation]);

  const handleExport = useCallback(async () => {
    if (!selectedId) return;
    try {
      const data = await utils.admin.exportTopicNode.fetch({ id: selectedId });
      if (data) {
        const blob = new Blob([data.markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast("Экспорт завершен");
      }
    } catch {
      toast("Ошибка экспорта");
    }
  }, [selectedId, utils]);

  const mdPreviewOptions = useMemo(
    () => ({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    []
  );
  const mdTextareaProps = useMemo(
    () => ({ placeholder: "Введите Markdown..." }),
    []
  );

  if (!user || user.role !== "admin") return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#37474f] bg-[#1e2529] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <TreePine className="h-6 w-6 text-[#2eff8c]" />
          <div>
            <h1 className="text-xl font-bold">Topic Management</h1>
            <p className="text-xs text-[#798389]">
              Иерархические темы с Markdown, формулами и картинками
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#37474f] hover:bg-[#2eff8c]/10 text-black"
            onClick={() => {
              setSelectedId(null);
              setCreatingChildOf(null);
              setForm({ ...initialForm });
              setIsEditing(false);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Новая тема
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-[#37474f] hover:bg-[#2eff8c]/10 text-black"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Импорт MD
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Tree */}
        <div className="w-80 border-r border-[#37474f] bg-[#1a1f22] overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-[#2eff8c]" size={20} />
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center text-sm text-[#798389] py-8">
              Нет тем. Создайте первую.
            </div>
          ) : (
            <div className="space-y-0.5">
              {tree.map((node) => (
                <TreeItem
                  key={node.id}
                  node={node}
                  selectedId={selectedId}
                  onSelect={(id) => {
                    if (lastSelectedIdRef.current !== id) {
                      lastSelectedIdRef.current = id;
                      loadNodeIntoForm(id);
                    }
                    setSelectedId(id);
                    setCreatingChildOf(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto bg-[#262e33] p-6">
          {isEditing || creatingChildOf !== null ? (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {isEditing ? "Редактирование" : creatingChildOf !== null ? "Новый дочерний узел" : "Новая тема"}
                </h2>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#37474f] text-black"
                        onClick={handleAddChild}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить подтему
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#37474f] text-black"
                        onClick={handleExport}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Экспорт MD
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {createMutation.isPending || updateMutation.isPending
                      ? "Сохранение..."
                      : "Сохранить"}
                  </Button>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[#798389]">Название</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="bg-[#1e2529] border-[#37474f] mt-1"
                    placeholder="Название темы"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#798389]">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "-")
                          .replace(/^-|-$/g, ""),
                      }))
                    }
                    className="bg-[#1e2529] border-[#37474f] mt-1"
                    placeholder="topic-slug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <div>
                  <Label className="text-xs text-[#798389]">Порядок</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        order: Number(e.target.value),
                      }))
                    }
                    className="bg-[#1e2529] border-[#37474f] mt-1"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#798389]">Цвет</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={form.color}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, color: e.target.value }))
                      }
                      className="w-12 h-9 p-1 bg-[#1e2529] border-[#37474f]"
                    />
                    <Input
                      value={form.color}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, color: e.target.value }))
                      }
                      className="flex-1 bg-[#1e2529] border-[#37474f]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-[#798389]">
                  Jupyter-ноутбук (URL)
                </Label>
                <Input
                  value={form.jupyterUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jupyterUrl: e.target.value }))
                  }
                  className="bg-[#1e2529] border-[#37474f] mt-1"
                  placeholder="https://..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-[#798389]">
                    Содержимое (Markdown с поддержкой $формул$ и $$блоков$$)
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#37474f] h-7 text-xs text-black"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Загрузить картинку
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#37474f] h-7 text-xs text-black"
                      onClick={() => setGalleryOpen(true)}
                    >
                      <Images className="h-3 w-3 mr-1" />
                      Галерея
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                <div data-color-mode="dark">
                  <MDEditor
                    value={form.content}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, content: v || "" }))
                    }
                    height={500}
                    preview="live"
                    previewOptions={mdPreviewOptions}
                    textareaProps={mdTextareaProps}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#798389]">
              <TreePine size={48} className="mb-4 opacity-30" />
              <p className="text-lg">Выберите тему для редактирования</p>
              <p className="text-sm mt-2">или создайте новую</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Dialog */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Галерея загруженных картинок</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {images && images.length > 0 ? (
              images.map((img) => {
                const url = `/uploads/${img.id}/${img.filename}`;
                const markdown = `![${img.originalName}](${url})`;
                return (
                  <div
                    key={img.id}
                    className="bg-[#1a1f22] border border-[#37474f] rounded-lg p-2 flex flex-col"
                  >
                    <div className="aspect-square rounded bg-[#0d1117] overflow-hidden mb-2 flex items-center justify-center">
                      <img
                        src={url}
                        alt={img.originalName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-[#798389] truncate mb-2" title={img.originalName}>
                      {img.originalName}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#37474f] text-black mt-auto"
                      onClick={() => {
                        navigator.clipboard.writeText(markdown);
                        toast("Ссылка скопирована");
                      }}
                    >
                      Копировать ссылку
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#798389] col-span-full">
                {images ? "Картинок пока нет" : "Загрузка..."}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Импорт Markdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-[#798389]">
              Front matter поддерживает: title, slug, order, color. Остальное
              станет content.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-[#37474f] text-black"
                onClick={() => importFileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Выбрать файл
              </Button>
              <input
                ref={importFileRef}
                type="file"
                className="hidden"
                accept=".md,.markdown"
                onChange={handleImportFile}
              />
            </div>
            <textarea
              value={importMd}
              onChange={(e) => setImportMd(e.target.value)}
              className="w-full h-64 p-3 bg-[#262e33] border border-[#37474f] rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#2eff8c]"
              placeholder={`---\ntitle: "Название"\nslug: "slug"\norder: 1\ncolor: "#2eff8c"\n---\n\nСодержимое в Markdown...`}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-black"
                onClick={() => {
                  setImportOpen(false);
                  setImportMd("");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Отмена
              </Button>
              <Button
                size="sm"
                className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                onClick={handleImport}
                disabled={importMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-1" />
                {importMutation.isPending ? "Импорт..." : "Импортировать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
