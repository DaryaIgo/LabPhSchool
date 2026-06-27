import { useState, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
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
  Folder,
  FolderOpen,
  FileText,
  FileQuestion,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Images,
  ChevronRight,
  ChevronDown,
  Loader2,
  GraduationCap,
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ProblemCategory, ProblemSubcategory, Problem } from "@db/schema";

function transliterateSlug(input: string): string {
  const ru: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
    щ: "shch", ы: "y", э: "e", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ru[ch] != null ? ru[ch] : /[a-z0-9-]/.test(ch) ? ch : "-"))
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type TreeNodeType = "category" | "subcategory" | "problem";

type ProblemListItem = Omit<Problem, "createdAt" | "updatedAt"> & {
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
  data: ProblemCategory | ProblemSubcategory | ProblemListItem;
}

const initialCategoryForm = {
  order: 1,
  title: "",
  slug: "",
  description: "",
  color: "#ffcb3d",
};

const initialSubcategoryForm = {
  categoryId: 0,
  order: 1,
  title: "",
  slug: "",
  description: "",
};

const initialProblemForm = {
  categoryId: 0,
  subcategoryId: null as number | null,
  order: 1,
  title: "",
  slug: "",
  difficulty: "medium" as "easy" | "medium" | "hard",
  source: "",
  condition: "",
  solution: "",
  answer: "",
  status: "draft" as "draft" | "published",
};

export default function ProblemManagement() {
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
  const [problemForm, setProblemForm] = useState({ ...initialProblemForm });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading: categoriesLoading } =
    trpc.problems.adminListCategories.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: subcategories, isLoading: subcategoriesLoading } =
    trpc.problems.adminListSubcategories.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: problems, isLoading: problemsLoading } =
    trpc.problems.adminListProblems.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
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
    for (const problem of problems ?? []) {
      const node: TreeNode = {
        type: "problem",
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        order: problem.order,
        children: [],
        data: problem,
      };
      const parent =
        subMap.get(problem.subcategoryId ?? -1) ??
        catMap.get(problem.categoryId);
      if (parent) parent.children.push(node);
    }
    return Array.from(catMap.values()).sort((a, b) => a.order - b.order);
  }, [categories, subcategories, problems]);

  const loadCategory = useCallback((cat: ProblemCategory) => {
    setCategoryForm({
      order: cat.order,
      title: cat.title,
      slug: cat.slug,
      description: cat.description ?? "",
      color: cat.color ?? "#ffcb3d",
    });
  }, []);

  const loadSubcategory = useCallback((sub: ProblemSubcategory) => {
    setSubcategoryForm({
      categoryId: sub.categoryId,
      order: sub.order,
      title: sub.title,
      slug: sub.slug,
      description: sub.description ?? "",
    });
  }, []);

  const loadProblem = useCallback((problem: ProblemListItem) => {
    setProblemForm({
      categoryId: problem.categoryId,
      subcategoryId: problem.subcategoryId ?? null,
      order: problem.order,
      title: problem.title,
      slug: problem.slug,
      difficulty:
        (problem.difficulty as "easy" | "medium" | "hard") ?? "medium",
      source: problem.source ?? "",
      condition: problem.condition ?? "",
      solution: problem.solution ?? "",
      answer: problem.answer ?? "",
      status: (problem.status as "draft" | "published") ?? "draft",
    });
  }, []);

  const handleSelect = useCallback(
    (node: TreeNode) => {
      setSelected({ type: node.type, id: node.id });
      setCreating(null);
      if (node.type === "category") loadCategory(node.data as ProblemCategory);
      if (node.type === "subcategory")
        loadSubcategory(node.data as ProblemSubcategory);
      if (node.type === "problem") loadProblem(node.data as ProblemListItem);
    },
    [loadCategory, loadSubcategory, loadProblem]
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
      } else if (type === "problem") {
        const catId = categories?.[0]?.id ?? 0;
        const subId =
          subcategories?.find(s => s.categoryId === catId)?.id ?? null;
        setProblemForm({
          ...initialProblemForm,
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
      field: "condition" | "solution" | "answer"
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
          setProblemForm(f => ({
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
  const createCategory = trpc.problems.adminCreateCategory.useMutation({
    onSuccess: () => {
      toast.success("Раздел создан");
      utils.problems.adminListCategories.invalidate();
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });
  const updateCategory = trpc.problems.adminUpdateCategory.useMutation({
    onSuccess: () => {
      toast.success("Раздел обновлён");
      utils.problems.adminListCategories.invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const deleteCategory = trpc.problems.adminDeleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Раздел удалён");
      utils.problems.adminListCategories.invalidate();
      setSelected(null);
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });

  const createSubcategory = trpc.problems.adminCreateSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Тема создана");
      utils.problems.adminListSubcategories.invalidate();
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });
  const updateSubcategory = trpc.problems.adminUpdateSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Тема обновлена");
      utils.problems.adminListSubcategories.invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const deleteSubcategory = trpc.problems.adminDeleteSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Тема удалена");
      utils.problems.adminListSubcategories.invalidate();
      setSelected(null);
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });

  const createProblem = trpc.problems.adminCreateProblem.useMutation({
    onSuccess: () => {
      toast.success("Задача создана");
      utils.problems.adminListProblems.invalidate();
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });
  const updateProblem = trpc.problems.adminUpdateProblem.useMutation({
    onSuccess: () => {
      toast.success("Задача обновлена");
      utils.problems.adminListProblems.invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const deleteProblem = trpc.problems.adminDeleteProblem.useMutation({
    onSuccess: () => {
      toast.success("Задача удалена");
      utils.problems.adminListProblems.invalidate();
      setSelected(null);
      setCreating(null);
    },
    onError: err => toast.error(err.message),
  });

  const isLoading =
    categoriesLoading || subcategoriesLoading || problemsLoading;

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
    } else if (creating === "problem" || selected?.type === "problem") {
      if (
        !problemForm.title ||
        !problemForm.slug ||
        !problemForm.condition ||
        !problemForm.solution ||
        !problemForm.answer
      ) {
        toast.error("Заполните название, slug, условие, решение и ответ");
        return;
      }
      const payload = {
        ...problemForm,
        subcategoryId: problemForm.subcategoryId ?? undefined,
      };
      if (creating === "problem") {
        createProblem.mutate(payload);
      } else if (selected?.type === "problem") {
        updateProblem.mutate({ id: selected.id, ...payload });
      }
    }
  }, [
    creating,
    selected,
    categoryForm,
    subcategoryForm,
    problemForm,
    createCategory,
    updateCategory,
    createSubcategory,
    updateSubcategory,
    createProblem,
    updateProblem,
  ]);

  const handleDelete = useCallback(() => {
    if (!selected) return;
    if (selected.type === "category") {
      if (confirm("Удалить раздел и все его темы/задачи?"))
        deleteCategory.mutate({ id: selected.id });
    } else if (selected.type === "subcategory") {
      if (confirm("Удалить тему?"))
        deleteSubcategory.mutate({ id: selected.id });
    } else if (selected.type === "problem") {
      if (confirm("Удалить задачу?")) deleteProblem.mutate({ id: selected.id });
    }
  }, [selected, deleteCategory, deleteSubcategory, deleteProblem]);

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
          <GraduationCap className="h-6 w-6 text-[#ffcb3d]" />
          <div>
            <h1 className="text-xl font-bold text-white">Problem Management</h1>
            <p className="text-xs text-[#798389]">
              Создание и управление базой задач (доступно только администратору)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#37474f] hover:bg-[#ffcb3d]/10 text-black"
            onClick={() => handleCreate("category")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Раздел
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-[#37474f] hover:bg-[#ffcb3d]/10 text-black"
            onClick={() => handleCreate("subcategory")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Тема
          </Button>
          <Button
            size="sm"
            className="bg-[#ffcb3d] text-[#0d1117] hover:bg-[#e6b734]"
            onClick={() => handleCreate("problem")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Задача
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Tree */}
        <div className="w-80 border-r border-[#37474f] bg-[#1a1f22] overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-[#ffcb3d]" size={20} />
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
          ) : selected?.type === "problem" || creating === "problem" ? (
            <ProblemEditor
              form={problemForm}
              onChange={setProblemForm}
              categories={categories ?? []}
              subcategories={subcategories ?? []}
              isNew={creating === "problem"}
              onSave={handleSave}
              onDelete={handleDelete}
              isSaving={createProblem.isPending || updateProblem.isPending}
              isDeleting={deleteProblem.isPending}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              setGalleryOpen={setGalleryOpen}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#798389]">
              <GraduationCap size={48} className="mb-4 opacity-30" />
              <p className="text-lg">Выберите элемент для редактирования</p>
              <p className="text-sm mt-2">
                или создайте новый раздел, тему или задачу
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
      expanded ? (
        <FolderOpen size={14} className="shrink-0 text-[#ffcb3d]" />
      ) : (
        <Folder size={14} className="shrink-0 text-[#ffcb3d]" />
      )
    ) : node.type === "subcategory" ? (
      <FileText size={14} className="shrink-0 text-[#01acff]" />
    ) : (
      <FileQuestion size={14} className="shrink-0 text-[#2eff8c]" />
    );

  return (
    <div>
      <button
        onClick={() => onSelect(node)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
          isSelected
            ? "bg-[#ffcb3d]/20 text-[#ffcb3d]"
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
  form: typeof initialCategoryForm;
  onChange: (f: typeof initialCategoryForm) => void;
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
          {isNew ? "Новый раздел задач" : "Редактирование раздела"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-[#ffcb3d] text-[#0d1117] hover:bg-[#e6b734]"
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
                slug: transliterateSlug(e.target.value),
              })
            }
            className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div>
        <Label className="text-xs text-[#798389]">Описание</Label>
        <textarea
          value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          rows={4}
          className="w-full mt-1 bg-[#1e2529] border border-[#37474f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffcb3d]"
        />
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
  categories: ProblemCategory[];
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
            className="bg-[#ffcb3d] text-[#0d1117] hover:bg-[#e6b734]"
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
                slug: transliterateSlug(e.target.value),
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
          className="w-full mt-1 bg-[#1e2529] border border-[#37474f] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffcb3d]"
        />
      </div>
    </div>
  );
}

function ProblemEditor({
  form,
  onChange,
  categories,
  subcategories,
  isNew,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  onImageUpload,
  fileInputRef,
  setGalleryOpen,
}: {
  form: typeof initialProblemForm;
  onChange: (f: typeof initialProblemForm) => void;
  categories: ProblemCategory[];
  subcategories: ProblemSubcategory[];
  isNew: boolean;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "condition" | "solution" | "answer"
  ) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setGalleryOpen: (v: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [activeContentField, setActiveContentField] = useState<
    "condition" | "solution" | "answer"
  >("condition");

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

  const insertImageForContent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onImageUpload(e, activeContentField),
    [activeContentField, onImageUpload]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {isNew ? "Новая задача" : "Редактирование задачи"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-[#ffcb3d] text-[#0d1117] hover:bg-[#e6b734]"
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
            className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#ffcb3d]"
          >
            Общее
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#ffcb3d]"
          >
            Условие / Решение / Ответ
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-[#798389]">Сложность</Label>
              <Select
                value={form.difficulty}
                onValueChange={v =>
                  onChange({ ...form, difficulty: v as typeof form.difficulty })
                }
              >
                <SelectTrigger className="bg-[#1e2529] border-[#37474f] mt-1 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f22] border-[#37474f]">
                  <SelectItem value="easy" className="text-white">
                    Лёгкая
                  </SelectItem>
                  <SelectItem value="medium" className="text-white">
                    Средняя
                  </SelectItem>
                  <SelectItem value="hard" className="text-white">
                    Сложная
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#798389]">Источник</Label>
              <Input
                value={form.source}
                onChange={e => onChange({ ...form, source: e.target.value })}
                className="bg-[#1e2529] border-[#37474f] mt-1 text-white"
                placeholder="Рымкевич №8"
              />
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
          </div>
        </TabsContent>

        {/* Content */}
        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-[#1a1f22] p-1 rounded-lg border border-[#37474f]">
              {[
                { key: "condition", label: "Условие" },
                { key: "solution", label: "Решение" },
                { key: "answer", label: "Ответ" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() =>
                    setActiveContentField(f.key as typeof activeContentField)
                  }
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activeContentField === f.key
                      ? "bg-[#2a3237] text-[#ffcb3d]"
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
                onChange={insertImageForContent}
              />
            </div>
          </div>

          <div data-color-mode="dark">
            <MDEditor
              value={form[activeContentField]}
              onChange={v =>
                onChange({ ...form, [activeContentField]: v || "" })
              }
              height={450}
              preview="live"
              previewOptions={mdPreviewOptions}
              textareaProps={{ placeholder: "Введите Markdown..." }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
