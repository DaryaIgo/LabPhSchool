import React, { useState, useMemo, useRef, useCallback } from "react";
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
import { CategoryIconPicker } from "@/components/admin/CategoryIconPicker";
import { CategoryIcon } from "@/components/CategoryIcon";
import { DEFAULT_CATEGORY_ICON_KEY } from "@/lib/lab-icons";
import { LAB_CATEGORY_ICON_KEYS } from "@contracts/constants";

type CategoryIconKey = (typeof LAB_CATEGORY_ICON_KEYS)[number];

interface TreeNode extends TopicNode {
  children: TreeNode[];
}

function buildTree(nodes: TopicNode[]): TreeNode[] {
  const sorted = [...nodes].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.id - b.id;
  });
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];
  for (const node of sorted) {
    map.set(node.id, { ...node, children: [] });
  }
  for (const node of sorted) {
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

type DropPosition = "before" | "after" | "inside";

function TreeItem({
  node,
  selectedId,
  onSelect,
  depth = 0,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  dragOver,
}: {
  node: TreeNode;
  selectedId: number | null;
  onSelect: (id: number) => void;
  depth?: number;
  draggable?: boolean;
  onDragStart?: (id: number) => void;
  onDragOver?: (e: React.DragEvent, id: number, pos: DropPosition) => void;
  onDrop?: (e: React.DragEvent, id: number, pos: DropPosition) => void;
  dragOver?: { id: number; pos: DropPosition } | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const [selfExpanded, setSelfExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isOver = dragOver?.id === node.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(node.id));
    onDragStart?.(node.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDragOver) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const threshold = 8;

    let pos: DropPosition = "inside";
    if (relY < threshold) {
      pos = "before";
    } else if (relY > rect.height - threshold) {
      pos = "after";
    }

    if (pos === "inside" && hasChildren && !expanded && !selfExpanded) {
      setSelfExpanded(true);
      setExpanded(true);
    }

    onDragOver(e, node.id, pos);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e, node.id, dragOver?.pos ?? "inside");
  };

  return (
    <div>
      <button
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => setSelfExpanded(false)}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setExpanded(e => !e);
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
          selectedId === node.id
            ? "bg-[#2eff8c]/20 text-[#2eff8c]"
            : "text-[#c8cdd1] hover:bg-white/5"
        } ${
          isOver && dragOver?.pos === "before"
            ? "border-t-2 border-[#2eff8c]"
            : ""
        } ${
          isOver && dragOver?.pos === "after"
            ? "border-b-2 border-[#2eff8c]"
            : ""
        } ${
          isOver && dragOver?.pos === "inside" ? "bg-[#2eff8c]/10" : ""
        } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span
            onClick={e => {
              e.stopPropagation();
              setExpanded(e => !e);
            }}
            className="shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        {node.parentId ? (
          <FileText size={14} className="shrink-0" />
        ) : (
          <CategoryIcon iconKey={node.iconType} size={14} />
        )}
        <span className="truncate">{node.title}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              draggable={draggable}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragOver={dragOver}
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
  iconType: DEFAULT_CATEGORY_ICON_KEY,
  content: "",
  jupyterUrl: "",
  parentId: null as number | null,
};

export default function TopicManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...initialForm });
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [importMd, setImportMd] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const lastSelectedIdRef = useRef<number | null>(null);

  const { data: nodes, isLoading } = trpc.admin.listTopicNodes.useQuery(
    undefined,
    {
      enabled: !!user && user.role === "admin",
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    }
  );

  const { data: images } = trpc.admin.listImages.useQuery(undefined, {
    enabled: !!user && user.role === "admin" && galleryOpen,
    refetchOnWindowFocus: false,
  });

  const tree = useMemo(() => buildTree(nodes || []), [nodes]);

  const loadNodeIntoForm = useCallback(
    (id: number) => {
      const node = nodes?.find(n => n.id === id);
      if (node) {
        setForm({
          title: node.title,
          slug: node.slug,
          order: node.order,
          color: node.color || "#2eff8c",
          iconType:
            (node.iconType as CategoryIconKey) ?? DEFAULT_CATEGORY_ICON_KEY,
          content: node.content || "",
          jupyterUrl: node.jupyterUrl || "",
          parentId: node.parentId ?? null,
        });
        setIsEditing(true);
        setIsCreating(false);
      }
    },
    [nodes]
  );

  const createMutation = trpc.admin.createTopicNode.useMutation({
    onSuccess: res => {
      toast("Узел создан");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
      if (res.id) {
        setSelectedId(res.id);
        lastSelectedIdRef.current = res.id;
        setIsEditing(true);
        setIsCreating(false);
      }
    },
    onError: err => toast(err.message),
  });

  const updateMutation = trpc.admin.updateTopicNode.useMutation({
    onSuccess: () => {
      toast("Сохранено");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
    },
    onError: err => toast(err.message),
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
      setIsCreating(false);
    },
    onError: err => toast(err.message),
  });

  const importMutation = trpc.admin.importTopicNode.useMutation({
    onSuccess: res => {
      toast("Импорт завершен");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
      setImportOpen(false);
      setImportMd("");
      if (res.id) {
        setSelectedId(res.id);
        lastSelectedIdRef.current = res.id;
        setIsEditing(true);
        setIsCreating(false);
      }
    },
    onError: err => toast(err.message),
  });

  const reorderMutation = trpc.admin.reorderTopicNodes.useMutation({
    onSuccess: () => {
      toast("Порядок обновлен");
      utils.admin.listTopicNodes.invalidate();
      utils.course.topicNodes.invalidate();
    },
    onError: err => toast(err.message),
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
        iconType: form.iconType,
        content: form.content,
        jupyterUrl: form.jupyterUrl || null,
      });
    } else {
      createMutation.mutate({
        parentId: form.parentId ?? undefined,
        title: form.title,
        slug: form.slug,
        order: form.order,
        color: form.color,
        iconType: form.iconType,
        content: form.content,
        jupyterUrl: form.jupyterUrl || null,
      });
    }
  }, [
    form,
    isEditing,
    selectedId,
    updateMutation,
    createMutation,
  ]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    if (confirm("Удалить узел и все его дочерние элементы?")) {
      deleteMutation.mutate({ id: selectedId });
    }
  }, [selectedId, deleteMutation]);

  const handleAddNew = useCallback(() => {
    const parentId = selectedId ?? null;
    const siblingCount =
      nodes?.filter(n => n.parentId === parentId).length ?? 0;
    setSelectedId(null);
    setForm({ ...initialForm, parentId, order: siblingCount + 1 });
    setIsEditing(false);
    setIsCreating(true);
  }, [selectedId, nodes]);

  const [dragOver, setDragOver] = useState<{ id: number; pos: DropPosition } | null>(null);

  const handleDragStart = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDragOver = useCallback(
    (_e: React.DragEvent, id: number, pos: DropPosition) => {
      setDragOver(prev => (prev?.id === id && prev?.pos === pos ? prev : { id, pos }));
    },
    []
  );

  const handleDragLeaveRoot = useCallback(() => {
    setDragOver(null);
  }, []);

  const computeReorderUpdates = useCallback(
    (draggedId: number, targetId: number, pos: DropPosition) => {
      const dragged = nodes?.find(n => n.id === draggedId);
      const target = nodes?.find(n => n.id === targetId);
      if (!dragged || !target || !nodes) return [];

      let newParentId: number | null;
      let siblings: TopicNode[];

      if (pos === "inside") {
        newParentId = target.id;
        siblings = nodes.filter(n => n.parentId === newParentId && n.id !== draggedId);
      } else {
        newParentId = target.parentId ?? null;
        siblings = nodes.filter(
          n => n.parentId === newParentId && n.id !== draggedId
        );
      }

      siblings.sort((a, b) => a.order - b.order);

      const insertIndex =
        pos === "inside"
          ? siblings.length
          : siblings.findIndex(n => n.id === targetId) + (pos === "after" ? 1 : 0);

      const reordered = [
        ...siblings.slice(0, insertIndex),
        dragged,
        ...siblings.slice(insertIndex),
      ];

      return reordered.map((n, index) => ({
        id: n.id,
        parentId: newParentId,
        order: index + 1,
      }));
    },
    [nodes]
  );

  const handleDrop = useCallback(
    (_e: React.DragEvent, targetId: number, pos: DropPosition) => {
      setDragOver(null);
      const data = _e.dataTransfer.getData("text/plain");
      const draggedId = Number(data);
      if (!draggedId || draggedId === targetId) return;

      const updates = computeReorderUpdates(draggedId, targetId, pos);
      if (updates.length > 0) {
        reorderMutation.mutate({ updates });
      }
    },
    [computeReorderUpdates, reorderMutation]
  );

  const handleDropRoot = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(null);
      const data = e.dataTransfer.getData("text/plain");
      const draggedId = Number(data);
      if (!draggedId || !nodes) return;

      const dragged = nodes.find(n => n.id === draggedId);
      if (!dragged) return;

      const roots = nodes.filter(n => n.parentId === null && n.id !== draggedId);
      roots.sort((a, b) => a.order - b.order);
      roots.push(dragged);
      const updates = roots.map((n, index) => ({
        id: n.id,
        parentId: null as number | null,
        order: index + 1,
      }));
      reorderMutation.mutate({ updates });
    },
    [nodes, reorderMutation]
  );

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
          setForm(f => ({ ...f, content: f.content + imageMarkdown }));
          toast("Картинка загружена");
        } else {
          toast("Ошибка загрузки: сервер не вернул ссылку");
        }
      } catch (err) {
        toast(
          `Ошибка загрузки: ${err instanceof Error ? err.message : "неизвестная ошибка"}`
        );
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
      parentId: form.parentId ?? undefined,
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
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4 mr-1" />
            Тема
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
        <div
          className="w-80 border-r border-[#37474f] bg-[#1a1f22] overflow-y-auto p-3"
          onDragOver={e => {
            e.preventDefault();
            setDragOver(null);
          }}
          onDrop={handleDropRoot}
          onDragLeave={handleDragLeaveRoot}
        >
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
              {tree.map(node => (
                <TreeItem
                  key={node.id}
                  node={node}
                  selectedId={selectedId}
                  onSelect={id => {
                    if (lastSelectedIdRef.current !== id) {
                      lastSelectedIdRef.current = id;
                      loadNodeIntoForm(id);
                    }
                    setSelectedId(id);
                  }}
                  draggable
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragOver={dragOver}
                />
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto bg-[#262e33] p-6">
          {isEditing || isCreating ? (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {isEditing ? "Редактирование" : "Новая тема"}
                </h2>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#37474f] text-black"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Экспорт MD
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                    onClick={handleSave}
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
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
                    onChange={e =>
                      setForm(f => ({ ...f, title: e.target.value }))
                    }
                    className="bg-[#1e2529] border-[#37474f] mt-1"
                    placeholder="Название темы"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#798389]">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={e =>
                      setForm(f => ({
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

              <div className="grid grid-cols-[1fr_200px] gap-4">
                <div>
                  <Label className="text-xs text-[#798389]">Цвет</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={form.color}
                      onChange={e =>
                        setForm(f => ({ ...f, color: e.target.value }))
                      }
                      className="w-12 h-9 p-1 bg-[#1e2529] border-[#37474f]"
                    />
                    <Input
                      value={form.color}
                      onChange={e =>
                        setForm(f => ({ ...f, color: e.target.value }))
                      }
                      className="flex-1 bg-[#1e2529] border-[#37474f]"
                    />
                  </div>
                </div>
                <CategoryIconPicker
                  value={form.iconType}
                  onChange={v =>
                    setForm(f => ({ ...f, iconType: v as CategoryIconKey }))
                  }
                />
              </div>

              <div>
                <Label className="text-xs text-[#798389]">
                  Jupyter-ноутбук (URL)
                </Label>
                <Input
                  value={form.jupyterUrl}
                  onChange={e =>
                    setForm(f => ({ ...f, jupyterUrl: e.target.value }))
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
                    onChange={v => setForm(f => ({ ...f, content: v || "" }))}
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
              images.map(img => {
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
                    <p
                      className="text-xs text-[#798389] truncate mb-2"
                      title={img.originalName}
                    >
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
              onChange={e => setImportMd(e.target.value)}
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
