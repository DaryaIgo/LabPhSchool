import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Save,
  X,
  ExternalLink,
  Atom,
} from "lucide-react";
import type { Simulation, SimulationParamConfig } from "@db/schema";

type FormMode = "list" | "create" | "edit" | "view";

interface FormState {
  id?: number;
  kind?: "own" | "external";
  slug: string;
  title: string;
  description: string;
  category: string;
  source: string;
  url: string;
}

const initialForm: FormState = {
  slug: "",
  title: "",
  description: "",
  category: "",
  source: "",
  url: "",
};

const SLUG_REGEX = /^[a-z0-9-]+$/;

function getUrlFromSimulation(simulation: Simulation): string {
  const config = (simulation.config ?? []) as SimulationParamConfig[];
  const urlParam = config.find(p => p.key === "url");
  return urlParam?.defaultValue ?? "";
}

function validateForm(form: FormState, mode: "create" | "edit"): string | null {
  if (mode === "create" && !form.slug) return "Slug обязателен";
  if (mode === "create" && !SLUG_REGEX.test(form.slug)) {
    return "Slug может содержать только строчные латинские буквы, цифры и дефис";
  }
  if (!form.title.trim()) return "Название обязательно";
  if (!form.url.trim()) return "URL обязателен";
  try {
    new URL(form.url);
  } catch {
    return "Введите корректный URL";
  }
  return null;
}

export default function SimulationManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();

  const [mode, setMode] = useState<FormMode>("list");
  const [form, setForm] = useState<FormState>(initialForm);

  const { data: simulations, isLoading: simulationsLoading } =
    trpc.virtualLab.adminListSimulations.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });
  const { data: categories, isLoading: categoriesLoading } =
    trpc.virtualLab.adminListCategories.useQuery(undefined, {
      enabled: !!user && user.role === "admin",
    });

  const createMutation = trpc.virtualLab.adminCreateExternalSimulation.useMutation({
    onSuccess: () => {
      toast.success("Встраиваемая лаборатория создана");
      utils.virtualLab.adminListSimulations.invalidate();
      setMode("list");
      setForm(initialForm);
    },
    onError: err => {
      toast.error(err.message || "Не удалось создать");
    },
  });

  const updateMutation = trpc.virtualLab.adminUpdateExternalSimulation.useMutation({
    onSuccess: () => {
      toast.success("Изменения сохранены");
      utils.virtualLab.adminListSimulations.invalidate();
      setMode("list");
      setForm(initialForm);
    },
    onError: err => {
      toast.error(err.message || "Не удалось сохранить");
    },
  });

  const deleteMutation = trpc.virtualLab.adminDeleteSimulation.useMutation({
    onSuccess: () => {
      toast.success("Лаборатория удалена");
      utils.virtualLab.adminListSimulations.invalidate();
      if (mode === "edit" || mode === "view") {
        setMode("list");
        setForm(initialForm);
      }
    },
    onError: err => {
      toast.error(err.message || "Не удалось удалить");
    },
  });

  const isLoading =
    simulationsLoading ||
    categoriesLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const simulationsByKind = useMemo(() => {
    const own: Simulation[] = [];
    const external: Simulation[] = [];
    for (const sim of simulations ?? []) {
      if (sim.kind === "own") own.push(sim);
      else external.push(sim);
    }
    return { own, external, all: simulations ?? [] };
  }, [simulations]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories ?? []) {
      map.set(cat.slug, cat.title);
    }
    return map;
  }, [categories]);

  const handleCreate = () => {
    setForm(initialForm);
    setMode("create");
  };

  const handleEdit = (simulation: Simulation) => {
    setForm({
      id: simulation.id,
      kind: simulation.kind,
      slug: simulation.slug,
      title: simulation.title,
      description: simulation.description ?? "",
      category: simulation.category ?? "",
      source: simulation.source ?? "",
      url: getUrlFromSimulation(simulation),
    });
    setMode("edit");
  };

  const handleView = (simulation: Simulation) => {
    setForm({
      id: simulation.id,
      kind: simulation.kind,
      slug: simulation.slug,
      title: simulation.title,
      description: simulation.description ?? "",
      category: simulation.category ?? "",
      source: simulation.source ?? "",
      url: getUrlFromSimulation(simulation),
    });
    setMode("view");
  };

  const handleDelete = (simulation: Simulation) => {
    if (
      confirm(
        `Удалить встраиваемую лабораторию "${simulation.title}"? Это действие нельзя отменить.`
      )
    ) {
      deleteMutation.mutate({ id: simulation.id });
    }
  };

  const handleSubmit = () => {
    const error = validateForm(form, mode === "create" ? "create" : "edit");
    if (error) {
      toast.error(error);
      return;
    }

    if (mode === "create") {
      createMutation.mutate({
        slug: form.slug,
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        source: form.source || undefined,
        url: form.url,
      });
    } else if (mode === "edit" && form.id) {
      updateMutation.mutate({
        id: form.id,
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        source: form.source || undefined,
        url: form.url,
      });
    }
  };

  const handleCancel = () => {
    setMode("list");
    setForm(initialForm);
  };

  const isFormOpen = mode === "create" || mode === "edit" || mode === "view";
  const isViewOwn = mode === "view";

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Atom className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Реестр симуляций</h1>
            <p className="text-sm text-[#798389]">
              Управление встраиваемыми лабораториями. Внутренние (own)
              симуляции редактируются только в коде.
            </p>
          </div>
        </div>
        {mode === "list" && (
          <Button
            onClick={handleCreate}
            className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1e2529] border border-[#37474f] rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#37474f] hover:bg-transparent">
                  <TableHead className="text-[#798389]">Название</TableHead>
                  <TableHead className="text-[#798389]">Slug</TableHead>
                  <TableHead className="text-[#798389]">Тип</TableHead>
                  <TableHead className="text-[#798389]">Источник</TableHead>
                  <TableHead className="text-[#798389]">Категория</TableHead>
                  <TableHead className="text-[#798389] text-right">
                    Действия
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulationsByKind.all.length === 0 && !simulationsLoading && (
                  <TableRow className="border-[#37474f]">
                    <TableCell
                      colSpan={6}
                      className="text-center text-[#798389] py-8"
                    >
                      Симуляций пока нет
                    </TableCell>
                  </TableRow>
                )}
                {simulationsByKind.all.map(sim => {
                  const isOwn = sim.kind === "own";
                  return (
                    <TableRow
                      key={sim.id}
                      className="border-[#37474f] hover:bg-[#263238]"
                    >
                      <TableCell className="font-medium text-white">
                        {sim.title}
                      </TableCell>
                      <TableCell className="text-[#96a3ab]">
                        {sim.slug}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            isOwn
                              ? "bg-[#01acff]/20 text-[#01acff] border-transparent"
                              : "bg-[#ffcb3d]/20 text-[#ffcb3d] border-transparent"
                          }
                        >
                          {isOwn ? "own" : "external"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#96a3ab]">
                        {sim.source ?? (isOwn ? "own" : "—")}
                      </TableCell>
                      <TableCell className="text-[#96a3ab]">
                        {categoryMap.get(sim.category ?? "") ??
                          sim.category ??
                          "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isOwn ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(sim)}
                              className="text-[#798389] hover:text-white hover:bg-white/5"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(sim)}
                                className="text-[#798389] hover:text-white hover:bg-white/5"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(sim)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1e2529] border border-[#37474f] rounded-xl p-3">
              <p className="text-xs text-[#798389]">Всего симуляций</p>
              <p className="text-xl font-bold text-white">
                {simulationsByKind.all.length}
              </p>
            </div>
            <div className="bg-[#1e2529] border border-[#37474f] rounded-xl p-3">
              <p className="text-xs text-[#798389]">Внутренние (own)</p>
              <p className="text-xl font-bold text-[#01acff]">
                {simulationsByKind.own.length}
              </p>
            </div>
            <div className="bg-[#1e2529] border border-[#37474f] rounded-xl p-3">
              <p className="text-xs text-[#798389]">Встраиваемые</p>
              <p className="text-xl font-bold text-[#ffcb3d]">
                {simulationsByKind.external.length}
              </p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        {isFormOpen && (
          <div className="bg-[#1e2529] border border-[#37474f] rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {mode === "create"
                  ? "Новая встраиваемая лаборатория"
                  : isViewOwn
                    ? "Просмотр симуляции"
                    : "Редактирование"}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="text-[#798389] hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isViewOwn && (
              <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4 text-sm text-[#96a3ab]">
                Это внутренняя (own) симуляция. Её компонент и манифест
                находятся в коде проекта и не редактируются здесь.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-[#798389]">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  disabled={mode !== "create" || isViewOwn}
                  placeholder="masses-and-springs"
                  className="bg-[#1a1f22] border-[#37474f] mt-1 text-white disabled:opacity-60"
                />
                {mode === "create" && (
                  <p className="text-[10px] text-[#798389] mt-1">
                    Только строчные латинские буквы, цифры и дефис
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs text-[#798389]">Название</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  disabled={isViewOwn}
                  placeholder="Массы и пружины"
                  className="bg-[#1a1f22] border-[#37474f] mt-1 text-white disabled:opacity-60"
                />
              </div>

              <div>
                <Label className="text-xs text-[#798389]">Описание</Label>
                <Textarea
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                  disabled={isViewOwn}
                  placeholder="Краткое описание лаборатории"
                  className="bg-[#1a1f22] border-[#37474f] mt-1 text-white disabled:opacity-60 min-h-[80px]"
                />
              </div>

              <div>
                <Label className="text-xs text-[#798389]">
                  Категория физики
                </Label>
                <Select
                  value={form.category || "none"}
                  onValueChange={v =>
                    setForm({ ...form, category: v === "none" ? "" : v })
                  }
                  disabled={isViewOwn}
                >
                  <SelectTrigger className="bg-[#1a1f22] border-[#37474f] mt-1 text-white disabled:opacity-60">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f22] border-[#37474f]">
                    <SelectItem value="none" className="text-white">
                      Без категории
                    </SelectItem>
                    {categories?.map(cat => (
                      <SelectItem
                        key={cat.id}
                        value={cat.slug}
                        className="text-white"
                      >
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.kind !== "own" && (
                <>
                  <div>
                    <Label className="text-xs text-[#798389]">Источник</Label>
                    <Input
                      value={form.source}
                      onChange={e =>
                        setForm({ ...form, source: e.target.value })
                      }
                      disabled={isViewOwn}
                      placeholder="PhET"
                      className="bg-[#1a1f22] border-[#37474f] mt-1 text-white disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-[#798389]">URL</Label>
                    <Input
                      value={form.url}
                      onChange={e =>
                        setForm({ ...form, url: e.target.value })
                      }
                      disabled={isViewOwn}
                      placeholder="https://phet.colorado.edu/..."
                      className="bg-[#1a1f22] border-[#37474f] mt-1 text-white disabled:opacity-60"
                    />
                    {form.url && !isViewOwn && (
                      <a
                        href={form.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#2eff8c] hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Открыть ссылку
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            {!isViewOwn && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createMutation.isPending || updateMutation.isPending
                    ? "Сохранение..."
                    : "Сохранить"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-[#37474f] bg-transparent text-white hover:bg-[#263238]"
                >
                  Отмена
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
