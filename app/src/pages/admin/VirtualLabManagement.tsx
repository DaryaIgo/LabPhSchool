import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  BarChart3,
} from "lucide-react";

export default function VirtualLabManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("categories");
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createSubcategoryOpen, setCreateSubcategoryOpen] = useState(false);
  const [createLabOpen, setCreateLabOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editCategory, setEditCategory] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editSubcategory, setEditSubcategory] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editLab, setEditLab] = useState<any>(null);

  const { data: categories } =
    trpc.virtualLab.adminListCategories.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: subcategories } =
    trpc.virtualLab.adminListSubcategories.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: labWorks } =
    trpc.virtualLab.adminListLabWorks.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });

  const createCategory = trpc.virtualLab.adminCreateCategory.useMutation({
    onSuccess: () => {
      toast.success("Категория создана");
      utils.virtualLab.adminListCategories.invalidate();
      setCreateCategoryOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCategory = trpc.virtualLab.adminUpdateCategory.useMutation({
    onSuccess: () => {
      toast.success("Категория обновлена");
      utils.virtualLab.adminListCategories.invalidate();
      setEditCategory(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCategory = trpc.virtualLab.adminDeleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Категория удалена");
      utils.virtualLab.adminListCategories.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createSubcategory = trpc.virtualLab.adminCreateSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Подкатегория создана");
      utils.virtualLab.adminListSubcategories.invalidate();
      setCreateSubcategoryOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateSubcategory = trpc.virtualLab.adminUpdateSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Подкатегория обновлена");
      utils.virtualLab.adminListSubcategories.invalidate();
      setEditSubcategory(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteSubcategory = trpc.virtualLab.adminDeleteSubcategory.useMutation({
    onSuccess: () => {
      toast.success("Подкатегория удалена");
      utils.virtualLab.adminListSubcategories.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createLab = trpc.virtualLab.adminCreateLabWork.useMutation({
    onSuccess: () => {
      toast.success("Лабораторная работа создана");
      utils.virtualLab.adminListLabWorks.invalidate();
      setCreateLabOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateLab = trpc.virtualLab.adminUpdateLabWork.useMutation({
    onSuccess: () => {
      toast.success("Лабораторная работа обновлена");
      utils.virtualLab.adminListLabWorks.invalidate();
      setEditLab(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteLab = trpc.virtualLab.adminDeleteLabWork.useMutation({
    onSuccess: () => {
      toast.success("Лабораторная работа удалена");
      utils.virtualLab.adminListLabWorks.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="pt-24 text-center text-[#798389]">
        Доступ запрещён. Требуется роль администратора.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#262e33] pt-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FlaskConical size={28} className="text-[#2eff8c]" />
            Управление виртуальными лабораторными работами
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#1a1f22] border border-[#37474f] p-1 mb-6">
            <TabsTrigger value="categories" className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <BookOpen size={14} className="mr-1.5" />
              Разделы
            </TabsTrigger>
            <TabsTrigger value="subcategories" className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <BookOpen size={14} className="mr-1.5" />
              Темы
            </TabsTrigger>
            <TabsTrigger value="labs" className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <FlaskConical size={14} className="mr-1.5" />
              Лабораторные работы
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#2a3237] data-[state=active]:text-[#2eff8c]">
              <BarChart3 size={14} className="mr-1.5" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]">
                    <Plus size={16} className="mr-1" />
                    Новый раздел
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1f22] border-[#37474f] text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Создать раздел физики</DialogTitle>
                  </DialogHeader>
                  <CategoryForm
                    onSubmit={(data) => createCategory.mutate(data)}
                    categories={categories || []}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5 hover:border-[#2eff8c]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{cat.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditCategory(cat)}
                        className="p-1.5 text-[#798389] hover:text-[#2eff8c] transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Удалить раздел?")) {
                            deleteCategory.mutate({ id: cat.id });
                          }
                        }}
                        className="p-1.5 text-[#798389] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#798389] mb-2">{cat.grade}</p>
                  <p className="text-sm text-[#c8cdd1] line-clamp-2">{cat.description}</p>
                  <div
                    className="mt-3 h-1 rounded-full"
                    style={{ backgroundColor: cat.color || "#2eff8c" }}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={createSubcategoryOpen} onOpenChange={setCreateSubcategoryOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]">
                    <Plus size={16} className="mr-1" />
                    Новая тема
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1f22] border-[#37474f] text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Создать тему</DialogTitle>
                  </DialogHeader>
                  <SubcategoryForm
                    onSubmit={(data) => createSubcategory.mutate(data)}
                    categories={categories || []}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {categories?.map((cat) => {
                const catSubs = subcategories?.filter((s) => s.categoryId === cat.id) ?? [];
                if (catSubs.length === 0) return null;
                return (
                  <div key={cat.id} className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
                    <h3 className="font-semibold text-white mb-3" style={{ color: cat.color || "#fff" }}>
                      {cat.title}
                    </h3>
                    <div className="space-y-2">
                      {catSubs.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 bg-[#1a1f22] rounded-lg"
                        >
                          <div>
                            <p className="text-sm text-white">{sub.title}</p>
                            <p className="text-xs text-[#798389]">{sub.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditSubcategory(sub)}
                              className="p-1.5 text-[#798389] hover:text-[#2eff8c] transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Удалить тему?")) {
                                  deleteSubcategory.mutate({ id: sub.id });
                                }
                              }}
                              className="p-1.5 text-[#798389] hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={createLabOpen} onOpenChange={setCreateLabOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]">
                    <Plus size={16} className="mr-1" />
                    Новая лабораторная работа
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1f22] border-[#37474f] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Создать лабораторную работу</DialogTitle>
                  </DialogHeader>
                  <LabWorkForm
                    onSubmit={(data) => createLab.mutate(data)}
                    categories={categories || []}
                    subcategories={subcategories || []}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {labWorks?.map((lab) => (
                <div
                  key={lab.id}
                  className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5 flex items-center justify-between hover:border-[#2eff8c]/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{lab.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          lab.status === "published"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {lab.status === "published" ? "Опубликовано" : "Черновик"}
                      </span>
                    </div>
                    <p className="text-sm text-[#798389]">
                      {lab.categoryTitle} · {lab.law} ·
                      <span
                        className={`ml-1 ${
                          lab.difficulty === "easy"
                            ? "text-green-400"
                            : lab.difficulty === "hard"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {lab.difficulty === "easy"
                          ? "Лёгкая"
                          : lab.difficulty === "hard"
                            ? "Сложная"
                            : "Средняя"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditLab(lab)}
                      className="p-2 text-[#798389] hover:text-[#2eff8c] transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Удалить лабораторную работу?")) {
                          deleteLab.mutate({ id: lab.id });
                        }
                      }}
                      className="p-2 text-[#798389] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-8 text-center text-[#798389]">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-white mb-2">Аналитика по лабораторным работам</p>
              <p>
                Выберите лабораторную работу для просмотра статистики: количество запусков,
                среднее время выполнения, процент завершения и типичные ошибки учащихся.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Category Dialog */}
      {editCategory && (
        <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
          <DialogContent className="bg-[#1a1f22] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать раздел</DialogTitle>
            </DialogHeader>
            <CategoryForm
              initial={editCategory}
              onSubmit={(data) =>
                updateCategory.mutate({ id: editCategory.id, ...data })
              }
              categories={categories || []}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Subcategory Dialog */}
      {editSubcategory && (
        <Dialog open={!!editSubcategory} onOpenChange={() => setEditSubcategory(null)}>
          <DialogContent className="bg-[#1a1f22] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать тему</DialogTitle>
            </DialogHeader>
            <SubcategoryForm
              initial={editSubcategory}
              onSubmit={(data) =>
                updateSubcategory.mutate({ id: editSubcategory.id, ...data })
              }
              categories={categories || []}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Lab Dialog */}
      {editLab && (
        <Dialog open={!!editLab} onOpenChange={() => setEditLab(null)}>
          <DialogContent className="bg-[#1a1f22] border-[#37474f] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать лабораторную работу</DialogTitle>
            </DialogHeader>
            <LabWorkForm
              initial={editLab}
              onSubmit={(data) => updateLab.mutate({ id: editLab.id, ...data })}
              categories={categories || []}
              subcategories={subcategories || []}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CategoryForm({
  initial,
  onSubmit,
  categories,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}) {
  const [form, setForm] = useState({
    order: initial?.order ?? categories.length + 1,
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    grade: initial?.grade ?? "",
    description: initial?.description ?? "",
    shortDesc: initial?.shortDesc ?? "",
    color: initial?.color ?? "#2eff8c",
    iconType: initial?.iconType ?? "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#c8cdd1]">Порядок</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Название</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-[#262e33] border-[#37474f] text-white"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Класс</Label>
        <Input
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          className="bg-[#262e33] border-[#37474f] text-white"
          placeholder="7 класс, 8–9 класс"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Краткое описание</Label>
        <Input
          value={form.shortDesc}
          onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
          className="bg-[#262e33] border-[#37474f] text-white"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Описание</Label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-[#262e33] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#c8cdd1]">Цвет</Label>
          <Input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="bg-[#262e33] border-[#37474f] text-white h-10"
          />
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Иконка</Label>
          <Input
            value={form.iconType}
            onChange={(e) => setForm({ ...form, iconType: e.target.value })}
            className="bg-[#262e33] border-[#37474f] text-white"
            placeholder="mechanics, optics..."
          />
        </div>
      </div>
      <Button type="submit" className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70] w-full">
        {initial ? "Сохранить" : "Создать"}
      </Button>
    </form>
  );
}

function SubcategoryForm({
  initial,
  onSubmit,
  categories,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}) {
  const [form, setForm] = useState({
    categoryId: initial?.categoryId ?? (categories[0]?.id || 1),
    order: initial?.order ?? 1,
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          categoryId: Number(form.categoryId),
          order: Number(form.order),
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label className="text-[#c8cdd1]">Раздел</Label>
        <Select
          value={String(form.categoryId)}
          onValueChange={(v) => setForm({ ...form, categoryId: Number(v) })}
        >
          <SelectTrigger className="bg-[#262e33] border-[#37474f] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f22] border-[#37474f]">
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} className="text-white">
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#c8cdd1]">Порядок</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Название</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-[#262e33] border-[#37474f] text-white"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Описание</Label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-[#262e33] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c]"
        />
      </div>
      <Button type="submit" className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70] w-full">
        {initial ? "Сохранить" : "Создать"}
      </Button>
    </form>
  );
}

function LabWorkForm({
  initial,
  onSubmit,
  categories,
  subcategories = [],
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subcategories?: any[];
}) {
  const [form, setForm] = useState({
    categoryId: initial?.categoryId ?? (categories[0]?.id || 1),
    subcategoryId: initial?.subcategoryId ?? "",
    order: initial?.order ?? 1,
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    law: initial?.law ?? "",
    skills: initial?.skills ?? "",
    difficulty: initial?.difficulty ?? "medium",
    duration: initial?.duration ?? 30,
    goal: initial?.goal ?? "",
    theory: initial?.theory ?? "",
    equipment: initial?.equipment ?? "",
    instruction: initial?.instruction ?? "",
    conclusionTemplate: initial?.conclusionTemplate ?? "",
    status: initial?.status ?? "draft",
  });

  const availableSubcategories = subcategories.filter(
    (s) => s.categoryId === Number(form.categoryId)
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          categoryId: Number(form.categoryId),
          duration: Number(form.duration),
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-[#c8cdd1]">Раздел</Label>
          <Select
            value={String(form.categoryId)}
            onValueChange={(v) => setForm({ ...form, categoryId: Number(v), subcategoryId: "" })}
          >
            <SelectTrigger className="bg-[#262e33] border-[#37474f] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f22] border-[#37474f]">
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} className="text-white">
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Тема</Label>
          <Select
            value={form.subcategoryId ? String(form.subcategoryId) : "none"}
            onValueChange={(v) => setForm({ ...form, subcategoryId: v === "none" ? "" : v })}
          >
            <SelectTrigger className="bg-[#262e33] border-[#37474f] text-white">
              <SelectValue placeholder="Без темы" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f22] border-[#37474f]">
              <SelectItem value="none" className="text-white">Без темы</SelectItem>
              {availableSubcategories.map((s) => (
                <SelectItem key={s.id} value={String(s.id)} className="text-white">
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Порядок</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#c8cdd1]">Название</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-[#c8cdd1]">Изучаемый закон</Label>
          <Input
            value={form.law}
            onChange={(e) => setForm({ ...form, law: e.target.value })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Сложность</Label>
          <Select
            value={form.difficulty}
            onValueChange={(v: string) => setForm({ ...form, difficulty: v as "easy" | "medium" | "hard" })}
          >
            <SelectTrigger className="bg-[#262e33] border-[#37474f] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f22] border-[#37474f]">
              <SelectItem value="easy" className="text-white">Лёгкая</SelectItem>
              <SelectItem value="medium" className="text-white">Средняя</SelectItem>
              <SelectItem value="hard" className="text-white">Сложная</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#c8cdd1]">Время (мин)</Label>
          <Input
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
            className="bg-[#262e33] border-[#37474f] text-white"
          />
        </div>
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Приобретаемые навыки</Label>
        <Input
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          className="bg-[#262e33] border-[#37474f] text-white"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Цель работы</Label>
        <textarea
          value={form.goal}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
          rows={2}
          className="w-full bg-[#262e33] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c]"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Теория</Label>
        <textarea
          value={form.theory}
          onChange={(e) => setForm({ ...form, theory: e.target.value })}
          rows={4}
          className="w-full bg-[#262e33] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c]"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Оборудование (JSON массив)</Label>
        <Input
          value={form.equipment}
          onChange={(e) => setForm({ ...form, equipment: e.target.value })}
          className="bg-[#262e33] border-[#37474f] text-white"
          placeholder='["Весы", "Мензурка"]'
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Инструкция</Label>
        <textarea
          value={form.instruction}
          onChange={(e) => setForm({ ...form, instruction: e.target.value })}
          rows={4}
          className="w-full bg-[#262e33] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c]"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Шаблон вывода</Label>
        <textarea
          value={form.conclusionTemplate}
          onChange={(e) => setForm({ ...form, conclusionTemplate: e.target.value })}
          rows={2}
          className="w-full bg-[#262e33] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c]"
        />
      </div>
      <div>
        <Label className="text-[#c8cdd1]">Статус</Label>
        <Select
          value={form.status}
          onValueChange={(v: string) => setForm({ ...form, status: v as "draft" | "published" })}
        >
          <SelectTrigger className="bg-[#262e33] border-[#37474f] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f22] border-[#37474f]">
            <SelectItem value="draft" className="text-white">Черновик</SelectItem>
            <SelectItem value="published" className="text-white">Опубликовано</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70] w-full">
        {initial ? "Сохранить" : "Создать"}
      </Button>
    </form>
  );
}
