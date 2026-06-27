import { useState, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { CategoryIconPicker } from "@/components/admin/CategoryIconPicker";
import { CategoryIcon } from "@/components/CategoryIcon";
import { DEFAULT_CATEGORY_ICON_KEY } from "@/lib/lab-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlaskConical,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Images,
  ChevronRight,
  ChevronDown,
  FileText,
  Loader2,
  Beaker,
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type {
  LabCategory,
  LabSubcategory,
  LabWork,
  Simulation,
  SimulationParamConfig,
} from "@db/schema";
import { LAB_CATEGORY_ICON_KEYS } from "@contracts/constants";

type CategoryIconKey = (typeof LAB_CATEGORY_ICON_KEYS)[number];

type TreeNodeType = "category" | "subcategory" | "labWork";

type LabWorkListItem = Omit<
  LabWork,
  "createdAt" | "updatedAt" | "topicNodeId"
> & {
  categoryTitle?: string | null;
  subcategoryTitle?: string | null;
};

interface TreeNode {
  type: TreeNodeType;
  id: number;
  title: string;
  slug: string;
  order: number;
  children: TreeNode[];
  data: LabCategory | LabSubcategory | LabWorkListItem;
}

type CategoryForm = {
  order: number;
  title: string;
  slug: string;
  grade: string;
  description: string;
  shortDesc: string;
  color: string;
  iconType: CategoryIconKey;
};

const initialCategoryForm: CategoryForm = {
  order: 1,
  title: "",
  slug: "",
  grade: "",
  description: "",
  shortDesc: "",
  color: "#2eff8c",
  iconType: DEFAULT_CATEGORY_ICON_KEY,
};

const initialSubcategoryForm = {
  categoryId: 0,
  order: 1,
  title: "",
  slug: "",
  description: "",
};

const initialLabWorkForm = {
  categoryId: 0,
  subcategoryId: null as number | null,
  order: 1,
  title: "",
  slug: "",
  goal: "",
  theory: "",
  equipment: "",
  instruction: "",
  conclusionTemplate: "",
  simulationSlug: null as string | null,
  status: "draft" as "draft" | "published",
};

export default function LabManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [selected, setSelected] = useState<{
    type: TreeNodeType;
    id: number;
  } | null>(null);
  const [creating, setCreating] = useState<TreeNodeType | null>(null);
  const [categoryForm, setCategoryForm] = useState({ ...initialCategoryForm });
  const [subcategoryForm, setSubcategoryForm] = useState({
    ...initialSubcategoryForm,
  });
  const [labForm, setLabForm] = useState({ ...initialLabWorkForm });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading: categoriesLoading } =
    trpc.virtualLab.adminListCategories.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: subcategories, isLoading: subcategoriesLoading } =
    trpc.virtualLab.adminListSubcategories.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: labWorks, isLoading: labWorksLoading } =
    trpc.virtualLab.adminListLabWorks.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: simulations } = trpc.virtualLab.listSimulations.useQuery(
    undefined,
    {
      enabled: !!user && user.role === "admin",
    }
  );
  const { data: images } = trpc.admin.listImages.useQuery(undefined, {
    enabled: !!user && user.role === "admin" && galleryOpen,
    refetchOnWindowFocus: false,
  });

  const tree = useMemo(() => {
    if (!categories) return [];
    const catMap = new Map<number, TreeNode>();
    for (const cat of categories) {
      catMap.set(cat.id, {
        type: "category",
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
        order: cat.order,
        children: [],
        data: cat,
      });
    }
    const subMap = new Map<number, TreeNode>();
    for (const sub of subcategories ?? []) {
      const node: TreeNode = {
        type: "subcategory",
        id: sub.id,
        title: sub.title,
        slug: sub.slug,
        order: sub.order,
        children: [],
        data: sub,
      };
      subMap.set(sub.id, node);
      const parent = catMap.get(sub.categoryId);
      if (parent) parent.children.push(node);
    }
    for (const lab of labWorks ?? []) {
      const node: TreeNode = {
        type: "labWork",
        id: lab.id,
        title: lab.title,
        slug: lab.slug,
        order: lab.order,
        children: [],
        data: lab,
      };
      const parent =
        subMap.get(lab.subcategoryId ?? -1) ?? catMap.get(lab.categoryId);
      if (parent) parent.children.push(node);
    }
    return Array.from(catMap.values()).sort((a, b) => a.order - b.order);
  }, [categories, subcategories, labWorks]);

  const loadCategory = useCallback((cat: LabCategory) => {
    setCategoryForm({
      order: cat.order,
      title: cat.title,
      slug: cat.slug,
      grade: cat.grade ?? "",
      description: cat.description ?? "",
      shortDesc: cat.shortDesc ?? "",
      color: cat.color ?? "#2eff8c",
      iconType: (cat.iconType as CategoryIconKey) ?? DEFAULT_CATEGORY_ICON_KEY,
    });
  }, []);

  const loadSubcategory = useCallback((sub: LabSubcategory) => {
    setSubcategoryForm({
      categoryId: sub.categoryId,
      order: sub.order,
      title: sub.title,
      slug: sub.slug,
      description: sub.description ?? "",
    });
  }, []);

  const loadLabWork = useCallback((lab: LabWorkListItem) => {
    setLabForm({
      categoryId: lab.categoryId,
      subcategoryId: lab.subcategoryId ?? null,
      order: lab.order,
      title: lab.title,
      slug: lab.slug,
      goal: lab.goal ?? "",
      theory: lab.theory ?? "",
      equipment: lab.equipment ?? "",
      instruction: lab.instruction ?? "",
      conclusionTemplate: lab.conclusionTemplate ?? "",
      simulationSlug: lab.simulationSlug ?? null,
      status: (lab.status as "draft" | "published") ?? "draft",
    });
  }, []);

  const handleSelect = useCallback(
    (node: TreeNode) => {
      setSelected({ type: node.type, id: node.id });
      setCreating(null);
      if (node.type === "category") loadCategory(node.data as LabCategory);
      if (node.type === "subcategory")
        loadSubcategory(node.data as LabSubcategory);
      if (node.type === "labWork") loadLabWork(node.data as LabWorkListItem);
    },
    [loadCategory, loadSubcategory, loadLabWork]
  );

  const handleCreate = useCallback(
    (type: TreeNodeType) => {
      setCreating(type);
      setSelected(null);
      if (type === "category") {
        setCategoryForm({
          ...initialCategoryForm,
          order: (categories?.length ?? 0) + 1,
        });
      } else if (type === "subcategory") {
        const catId = categories?.[0]?.id ?? 0;
        const siblings =
          subcategories?.filter(s => s.categoryId === catId) ?? [];
        setSubcategoryForm({
          ...initialSubcategoryForm,
          categoryId: catId,
          order: siblings.length + 1,
        });
      } else if (type === "labWork") {
        const catId = categories?.[0]?.id ?? 0;
        const subId =
          subcategories?.find(s => s.categoryId === catId)?.id ?? null;
        setLabForm({
          ...initialLabWorkForm,
          categoryId: catId,
          subcategoryId: subId,
        });
      }
    },
    [categories, subcategories]
  );

  const handleImageUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      field:
        | "theory"
        | "instruction"
        | "goal"
        | "equipment"
        | "conclusionTemplate"
    ) => {
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
          toast.error(`Ошибка загрузки: ${data.error || res.statusText}`);
          return;
        }
        if (data.url) {
          const imageMarkdown = `\n![${file.name}](${data.url})\n`;
          setLabForm(f => ({
            ...f,
            [field]: (f[field] || "") + imageMarkdown,
          }));
          toast.success("Картинка загружена");
        }
      } catch (err) {
        toast.error(
          `Ошибка загрузки: ${err instanceof Error ? err.message : "неизвестная ошибка"}`
        );
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  // Mutations
  const createCategory = trpc.virtualLab.adminCreateCategory.useMutation({
    onSuccess: () => {
      toast.success("Раздел создан");
      utils.virtualLab.adminListCategories.invalidate();
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });
  const updateCategory = trpc.virtualLab.adminUpdateCategory.useMutation({
    onSuccess: () => {
      toast.success("Раздел обновлён");
      utils.virtualLab.adminListCategories.invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const deleteCategory = trpc.virtualLab.adminDeleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Раздел удалён");
      utils.virtualLab.adminListCategories.invalidate();
      setSelected(null);
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });

  const createSubcategory = trpc.virtualLab.adminCreateSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Тема создана");
      utils.virtualLab.adminListSubcategories.invalidate();
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });
  const updateSubcategory = trpc.virtualLab.adminUpdateSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Тема обновлена");
      utils.virtualLab.adminListSubcategories.invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const deleteSubcategory = trpc.virtualLab.adminDeleteSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Тема удалена");
      utils.virtualLab.adminListSubcategories.invalidate();
      setSelected(null);
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });

  const createLab = trpc.virtualLab.adminCreateLabWork.useMutation({
    onSuccess: () => {
      toast.success("Лабораторная работа создана");
      utils.virtualLab.adminListLabWorks.invalidate();
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });
  const updateLab = trpc.virtualLab.adminUpdateLabWork.useMutation({
    onSuccess: () => {
      toast.success("Лабораторная работа обновлена");
      utils.virtualLab.adminListLabWorks.invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const deleteLab = trpc.virtualLab.adminDeleteLabWork.useMutation({
    onSuccess: () => {
      toast.success("Лабораторная работа удалена");
      utils.virtualLab.adminListLabWorks.invalidate();
      setSelected(null);
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });

  const isLoading =
    categoriesLoading || subcategoriesLoading || labWorksLoading;

  const handleSave = useCallback(() => {
    if (creating === "category" || selected?.type === "category") {
      if (!categoryForm.title || !categoryForm.slug) {
        toast.error("Заполните название и slug");
        return;
      }
      if (creating === "category") {
        createCategory.mutate(categoryForm);
      } else if (selected?.type === "category") {
        updateCategory.mutate({ id: selected.id, ...categoryForm });
      }
    } else if (creating === "subcategory" || selected?.type === "subcategory") {
      if (!subcategoryForm.title || !subcategoryForm.slug) {
        toast.error("Заполните название и slug");
        return;
      }
      if (creating === "subcategory") {
        createSubcategory.mutate(subcategoryForm);
      } else if (selected?.type === "subcategory") {
        updateSubcategory.mutate({ id: selected.id, ...subcategoryForm });
      }
    } else if (creating === "labWork" || selected?.type === "labWork") {
      if (!labForm.title || !labForm.slug) {
        toast.error("Заполните название и slug");
        return;
      }
      const payload = {
        ...labForm,
        subcategoryId: labForm.subcategoryId ?? undefined,
        simulationSlug: labForm.simulationSlug ?? undefined,
      };
      if (creating === "labWork") {
        createLab.mutate(payload);
      } else if (selected?.type === "labWork") {
        updateLab.mutate({ id: selected.id, ...payload });
      }
    }
  }, [
    creating,
    selected,
    categoryForm,
    subcategoryForm,
    labForm,
    createCategory,
    updateCategory,
    createSubcategory,
    updateSubcategory,
    createLab,
    updateLab,
  ]);

  const handleDelete = useCallback(() => {
    if (!selected) return;
    if (selected.type === "category") {
      if (confirm("Удалить раздел и все его темы/работы?"))
        deleteCategory.mutate({ id: selected.id });
    } else if (selected.type === "subcategory") {
      if (confirm("Удалить тему?"))
        deleteSubcategory.mutate({ id: selected.id });
    } else if (selected.type === "labWork") {
      if (confirm("Удалить лабораторную работу?"))
        deleteLab.mutate({ id: selected.id });
    }
  }, [selected, deleteCategory, deleteSubcategory, deleteLab]);

  if (!user || user.role !== "admin") {
    return (
      <div className="pt-24 text-center text-[#798389]">
        Доступ запрещён. Требуется роль администратора.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#262e33]">
      {/* Header */}
      <div className="border-b border-[#37474f] bg-[#1e2529] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Beaker className="h-6 w-6 text-[#2eff8c]" />
          <div>
            <h1 className="text-xl font-bold text-white">Lab Management</h1>
            <p className="text-xs text-[#798389]">
              Создание лабораторных работ: теория, симуляции и параметры
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#37474f] hover:bg-[#2eff8c]/10 text-black"
            onClick={() => handleCreate("category")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Раздел
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-[#37474f] hover:bg-[#2eff8c]/10 text-black"
            onClick={() => handleCreate("subcategory")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Тема
          </Button>
          <Button
            size="sm"
            className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
            onClick={() => handleCreate("labWork")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Работа
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
              Нет разделов. Создайте первый.
            </div>
          ) : (
            <div className="space-y-0.5">
              {tree.map(node => (
                <TreeItem
                  key={`${node.type}-${node.id}`}
                  node={node}
                  selected={selected}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto bg-[#262e33] p-6">
          {selected?.type === "category" || creating === "category" ? (
            <CategoryEditor
              form={categoryForm}
              onChange={setCategoryForm}
              isNew={creating === "category"}
              onSave={handleSave}
              onDelete={handleDelete}
              isSaving={createCategory.isPending || updateCategory.isPending}
              isDeleting={deleteCategory.isPending}
            />
          ) : selected?.type === "subcategory" || creating === "subcategory" ? (
            <SubcategoryEditor
              form={subcategoryForm}
              onChange={setSubcategoryForm}
              categories={categories ?? []}
              isNew={creating === "subcategory"}
              onSave={handleSave}
              onDelete={handleDelete}
              isSaving={
                createSubcategory.isPending || updateSubcategory.isPending
              }
              isDeleting={deleteSubcategory.isPending}
            />
          ) : selected?.type === "labWork" || creating === "labWork" ? (
            <LabWorkEditor
              form={labForm}
              onChange={setLabForm}
              categories={categories ?? []}
              subcategories={subcategories ?? []}
              simulations={simulations ?? []}
              isNew={creating === "labWork"}
              onSave={handleSave}
              onDelete={handleDelete}
              isSaving={createLab.isPending || updateLab.isPending}
              isDeleting={deleteLab.isPending}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              setGalleryOpen={setGalleryOpen}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#798389]">
              <Beaker size={48} className="mb-4 opacity-30" />
              <p className="text-lg">Выберите элемент для редактирования</p>
              <p className="text-sm mt-2">
                или создайте новый раздел, тему или работу
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Dialog */}
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
                        toast.success("Ссылка скопирована");
                      }}
                    >
                      Копировать
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
    </div>
  );
}

function TreeItem({
  node,
  selected,
  onSelect,
  depth = 0,
}: {
  node: TreeNode;
  selected: { type: TreeNodeType; id: number } | null;
  onSelect: (node: TreeNode) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selected?.type === node.type && selected?.id === node.id;

  const icon =
    node.type === "category" ? (
      <CategoryIcon iconKey={(node.data as LabCategory).iconType} size={14} />
    ) : node.type === "subcategory" ? (
      <FileText size={14} className="shrink-0 text-[#01acff]" />
    ) : (
      <FlaskConical size={14} className="shrink-0 text-[#ff7043]" />
    );

  return (
    <div>
      <button
        onClick={() => onSelect(node)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
          isSelected
            ? "bg-[#2eff8c]/20 text-[#2eff8c]"
            : "text-[#c8cdd1] hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span
            onClick={e => {
              e.stopPropagation();
              setExpanded(v => !v);
            }}
            className="shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        {icon}
        <span className="truncate">{node.title}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children.map(child => (
            <TreeItem
              key={`${child.type}-${child.id}`}
              node={child}
              selected={selected}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryEditor({
  form,
  onChange,
  isNew,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: {
  form: CategoryForm;
  onChange: (f: CategoryForm) => void;
  isNew: boolean;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {isNew ? "Новый раздел физики" : "Редактирование раздела"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
          {!isNew && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={onDelete}
              disabled={isDeleting}
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
            onChange={e => onChange({ ...form, title: e.target.value })}
            className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
          />
        </div>
        <div>
          <Label className="text-xs text-[#798389]">Slug</Label>
          <Input
            value={form.slug}
            onChange={e =>
              onChange({
                ...form,
                slug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]+/g, "-")
                  .replace(/^-|-$/g, ""),
              })
            }
            className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-xs text-[#798389]">Порядок</Label>
          <Input
            type="number"
            value={form.order}
            onChange={e => onChange({ ...form, order: Number(e.target.value) })}
            className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
            min={1}
          />
        </div>
        <div>
          <Label className="text-xs text-[#798389]">Класс</Label>
          <Input
            value={form.grade}
            onChange={e => onChange({ ...form, grade: e.target.value })}
            className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
            placeholder="7 класс"
          />
        </div>
        <CategoryIconPicker
          value={form.iconType}
          onChange={v => onChange({ ...form, iconType: v as CategoryIconKey })}
        />
      </div>

      <div>
        <Label className="text-xs text-[#798389]">Краткое описание</Label>
        <Input
          value={form.shortDesc}
          onChange={e => onChange({ ...form, shortDesc: e.target.value })}
          className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
        />
      </div>

      <div>
        <Label className="text-xs text-[#798389]">Описание</Label>
        <textarea
          value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          rows={4}
          className="w-full mt-1 bg-[#1e2529] border border-[#37474f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#2eff8c]"
        />
      </div>

      <div>
        <Label className="text-xs text-[#798389]">Цвет</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={form.color}
            onChange={e => onChange({ ...form, color: e.target.value })}
            className="w-12 h-9 p-1 bg-[#1e2529] border-[#37474f]"
          />
          <Input
            value={form.color}
            onChange={e => onChange({ ...form, color: e.target.value })}
            className="flex-1 bg-[#1e2529] border-[#37474f] text-white"
          />
        </div>
      </div>
    </div>
  );
}

function SubcategoryEditor({
  form,
  onChange,
  categories,
  isNew,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: {
  form: typeof initialSubcategoryForm;
  onChange: (f: typeof initialSubcategoryForm) => void;
  categories: LabCategory[];
  isNew: boolean;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {isNew ? "Новая тема" : "Редактирование темы"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
          {!isNew && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs text-[#798389]">Раздел</Label>
        <Select
          value={String(form.categoryId)}
          onValueChange={v => onChange({ ...form, categoryId: Number(v) })}
        >
          <SelectTrigger className="bg-[#1e2529] border-[#37474f] mt-1 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f22] border-[#37474f]">
            {categories.map(c => (
              <SelectItem
                key={c.id}
                value={String(c.id)}
                className="text-white"
              >
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-[#798389]">Название</Label>
          <Input
            value={form.title}
            onChange={e => onChange({ ...form, title: e.target.value })}
            className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
          />
        </div>
        <div>
          <Label className="text-xs text-[#798389]">Slug</Label>
          <Input
            value={form.slug}
            onChange={e =>
              onChange({
                ...form,
                slug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]+/g, "-")
                  .replace(/^-|-$/g, ""),
              })
            }
            className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-[#798389]">Порядок</Label>
        <Input
          type="number"
          value={form.order}
          onChange={e => onChange({ ...form, order: Number(e.target.value) })}
          className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
          min={1}
        />
      </div>

      <div>
        <Label className="text-xs text-[#798389]">Описание</Label>
        <textarea
          value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          rows={4}
          className="w-full mt-1 bg-[#1e2529] border border-[#37474f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#2eff8c]"
        />
      </div>
    </div>
  );
}

function LabWorkEditor({
  form,
  onChange,
  categories,
  subcategories,
  simulations,
  isNew,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  onImageUpload,
  fileInputRef,
  setGalleryOpen,
}: {
  form: typeof initialLabWorkForm;
  onChange: (f: typeof initialLabWorkForm) => void;
  categories: LabCategory[];
  subcategories: LabSubcategory[];
  simulations: Simulation[];
  isNew: boolean;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field:
      | "theory"
      | "instruction"
      | "goal"
      | "equipment"
      | "conclusionTemplate"
  ) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setGalleryOpen: (v: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [activeTheoryField, setActiveTheoryField] = useState<
    "goal" | "theory" | "equipment" | "instruction" | "conclusionTemplate"
  >("theory");

  const selectedSimulation = useMemo(
    () => simulations.find(s => s.slug === form.simulationSlug),
    [simulations, form.simulationSlug]
  );

  const availableSubcategories = subcategories.filter(
    s => s.categoryId === form.categoryId
  );

  const mdPreviewOptions = useMemo(
    () => ({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    []
  );

  const insertImageForTheory = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onImageUpload(e, activeTheoryField),
    [activeTheoryField, onImageUpload]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {isNew
            ? "Новая лабораторная работа"
            : "Редактирование лабораторной работы"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
          {!isNew && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1a1f22] border border-[#37474f]">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]"
          >
            Общее
          </TabsTrigger>
          <TabsTrigger
            value="theory"
            className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]"
          >
            Теория
          </TabsTrigger>
          <TabsTrigger
            value="simulation"
            className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]"
          >
            Симуляция
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-[#798389]">Раздел</Label>
              <Select
                value={String(form.categoryId)}
                onValueChange={v => {
                  const catId = Number(v);
                  const subId =
                    subcategories.find(s => s.categoryId === catId)?.id ?? null;
                  onChange({
                    ...form,
                    categoryId: catId,
                    subcategoryId: subId,
                  });
                }}
              >
                <SelectTrigger className="bg-[#1e2529] border-[#37474f] mt-1 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f22] border-[#37474f]">
                  {categories.map(c => (
                    <SelectItem
                      key={c.id}
                      value={String(c.id)}
                      className="text-white"
                    >
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#798389]">Тема</Label>
              <Select
                value={form.subcategoryId ? String(form.subcategoryId) : "none"}
                onValueChange={v =>
                  onChange({
                    ...form,
                    subcategoryId: v === "none" ? null : Number(v),
                  })
                }
              >
                <SelectTrigger className="bg-[#1e2529] border-[#37474f] mt-1 text-white">
                  <SelectValue placeholder="Без темы" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f22] border-[#37474f]">
                  <SelectItem value="none" className="text-white">
                    Без темы
                  </SelectItem>
                  {availableSubcategories.map(s => (
                    <SelectItem
                      key={s.id}
                      value={String(s.id)}
                      className="text-white"
                    >
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#798389]">Порядок</Label>
              <Input
                type="number"
                value={form.order}
                onChange={e =>
                  onChange({ ...form, order: Number(e.target.value) })
                }
                className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-[#798389]">Название</Label>
              <Input
                value={form.title}
                onChange={e => onChange({ ...form, title: e.target.value })}
                className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-[#798389]">Slug</Label>
              <Input
                value={form.slug}
                onChange={e =>
                  onChange({
                    ...form,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  })
                }
                className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-[#798389]">Статус</Label>
            <Select
              value={form.status}
              onValueChange={v =>
                onChange({ ...form, status: v as typeof form.status })
              }
            >
              <SelectTrigger className="bg-[#1e2529] border-[#37474f] mt-1 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f22] border-[#37474f]">
                <SelectItem value="draft" className="text-white">
                  Черновик
                </SelectItem>
                <SelectItem value="published" className="text-white">
                  Опубликовано
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Theory */}
        <TabsContent value="theory" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-[#1a1f22] p-1 rounded-lg border border-[#37474f]">
              {[
                { key: "goal", label: "Цель" },
                { key: "theory", label: "Теория" },
                { key: "equipment", label: "Оборудование" },
                { key: "instruction", label: "Инструкция" },
                { key: "conclusionTemplate", label: "Вывод" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() =>
                    setActiveTheoryField(f.key as typeof activeTheoryField)
                  }
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activeTheoryField === f.key
                      ? "bg-[#2a3237] text-[#2eff8c]"
                      : "text-[#798389] hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-[#37474f] h-8 text-xs text-black"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Загрузить картинку
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#37474f] h-8 text-xs text-black"
                onClick={() => setGalleryOpen(true)}
              >
                <Images className="h-3 w-3 mr-1" />
                Галерея
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={insertImageForTheory}
              />
            </div>
          </div>

          <div data-color-mode="dark">
            <MDEditor
              value={form[activeTheoryField]}
              onChange={v =>
                onChange({ ...form, [activeTheoryField]: v || "" })
              }
              height={450}
              preview="live"
              previewOptions={mdPreviewOptions}
              textareaProps={{ placeholder: "Введите Markdown..." }}
            />
          </div>
        </TabsContent>

        {/* Simulation */}
        <TabsContent value="simulation" className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-[#798389]">Выберите симуляцию</Label>
            <Select
              value={form.simulationSlug ?? "none"}
              onValueChange={v =>
                onChange({ ...form, simulationSlug: v === "none" ? null : v })
              }
            >
              <SelectTrigger className="bg-[#1e2529] border-[#37474f] mt-1 text-white">
                <SelectValue placeholder="Без симуляции" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f22] border-[#37474f] max-h-80">
                <SelectItem value="none" className="text-white">
                  Без симуляции
                </SelectItem>
                {simulations.map(sim => (
                  <SelectItem
                    key={sim.id}
                    value={sim.slug}
                    className="text-white"
                  >
                    {sim.title} ({sim.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSimulation && (
            <>
              <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4 space-y-2">
                <p className="text-white font-medium">
                  {selectedSimulation.title}
                </p>
                <p className="text-sm text-[#798389]">
                  {selectedSimulation.description}
                </p>
                <p className="text-xs text-[#798389]">
                  Slug: {selectedSimulation.slug} · Компонент:{" "}
                  {selectedSimulation.componentRef}
                </p>
              </div>

              <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  Параметры симуляции
                </h3>
                {(selectedSimulation.config ?? []).length === 0 ? (
                  <p className="text-sm text-[#798389]">
                    У этой симуляции нет настраиваемых параметров.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(
                      selectedSimulation.config as
                        | SimulationParamConfig[]
                        | null
                        | undefined
                    )?.map((param, idx) => (
                      <div
                        key={`${param.key}-${idx}`}
                        className="bg-[#1e2529] rounded-lg p-3"
                      >
                        <p className="text-sm text-white font-medium">
                          {param.label}
                        </p>
                        <p className="text-xs text-[#798389]">
                          {param.key} · {param.paramType}
                          {param.min !== undefined && param.max !== undefined
                            ? ` · ${param.min}…${param.max}`
                            : ""}
                          {param.step ? ` · шаг ${param.step}` : ""}
                          {param.defaultValue
                            ? ` · по умолч. ${param.defaultValue}`
                            : ""}
                          {param.unit ? ` ${param.unit}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
