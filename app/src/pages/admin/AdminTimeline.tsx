import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import {
  ArrowLeft,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Save,
  X,
  History,
} from "lucide-react";
import type { TimelineEntry } from "@contracts/types";

const DEFAULT_COLORS = [
  { label: "Голубой", value: "#87CEEB" },
  { label: "Зелёный", value: "#22c55e" },
  { label: "Фиолетовый", value: "#a855f7" },
  { label: "Оранжевый", value: "#f97316" },
  { label: "Персиковый", value: "#fdba74" },
  { label: "Жёлтый", value: "#fbbf24" },
  { label: "Красный", value: "#ef4444" },
  { label: "Синий", value: "#01acff" },
];

type FormState = {
  type: "physicist" | "discovery";
  name: string;
  yearStart: string;
  yearEnd: string;
  description: string;
  portraitUrl: string;
  color: string;
  sortOrder: string;
};

function emptyForm(): FormState {
  return {
    type: "physicist",
    name: "",
    yearStart: "",
    yearEnd: "",
    description: "",
    portraitUrl: "",
    color: "#87CEEB",
    sortOrder: "0",
  };
}

export default function AdminTimeline() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true });

  const utils = trpc.useUtils();
  const { data: entries, isLoading } = trpc.timeline.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const createMutation = trpc.timeline.create.useMutation({
    onSuccess: () => {
      utils.timeline.list.invalidate();
      toast.success("Запись добавлена");
      setFormOpen(false);
      setForm(emptyForm());
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.timeline.update.useMutation({
    onSuccess: () => {
      utils.timeline.list.invalidate();
      toast.success("Запись обновлена");
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.timeline.delete.useMutation({
    onSuccess: () => {
      utils.timeline.list.invalidate();
      toast.success("Запись удалена");
    },
    onError: (err) => toast.error(err.message),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);

  const isAdmin = user?.role === "admin";

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (entry: TimelineEntry) => {
    setForm({
      type: entry.type,
      name: entry.name,
      yearStart: String(entry.yearStart),
      yearEnd: entry.yearEnd ? String(entry.yearEnd) : "",
      description: entry.description,
      portraitUrl: entry.portraitUrl ?? "",
      color: entry.color,
      sortOrder: String(entry.sortOrder),
    });
    setEditingId(entry.id);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: form.type,
      name: form.name.trim(),
      yearStart: Number(form.yearStart),
      yearEnd: form.yearEnd ? Number(form.yearEnd) : undefined,
      description: form.description.trim(),
      portraitUrl: form.portraitUrl.trim() || undefined,
      color: form.color,
      sortOrder: Number(form.sortOrder) || 0,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-16 min-h-screen bg-[#262e33] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#2eff8c]/30 border-t-[#2eff8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#262e33]">
        <div className="text-center max-w-md mx-auto px-6">
          <Lock size={48} className="text-[#ff6b6b] mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Доступ ограничен</h2>
          <p className="text-[#c8cdd1] mb-6">
            Этот раздел доступен только администратору.
          </p>
          <Link to="/" className="text-sm text-[#798389] hover:text-white transition-colors">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      <section className="bg-[#1a1f22] py-8 border-b border-[#434e54]">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-[#798389] hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Назад в админ-панель
          </Link>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <History size={24} className="text-yellow-400" />
              </div>
              <div>
                <p className="formula-text text-xs mb-1">Раздел администратора</p>
                <h1 className="text-2xl lg:text-3xl font-bold">Стрела времени</h1>
              </div>
            </div>
            <Button
              onClick={() => navigate("/timeline")}
              variant="outline"
              className="border-[#434e54] bg-[#1e2529] text-white hover:bg-[#263238] hover:border-yellow-400"
            >
              Открыть таймлайн
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Записи таймлайна</h2>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreate}
                className="bg-[#2eff8c] text-black hover:bg-[#26d97a]"
              >
                <Plus size={18} className="mr-1" />
                Добавить запись
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1f22] border-[#434e54] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Редактировать запись" : "Новая запись"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Тип</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, type: v as "physicist" | "discovery" }))
                      }
                    >
                      <SelectTrigger className="bg-[#262e33] border-[#434e54] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262e33] border-[#434e54] text-white">
                        <SelectItem value="physicist">Physicist</SelectItem>
                        <SelectItem value="discovery">Discovery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Название / Имя</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Например, Альберт Эйнштейн"
                      className="bg-[#262e33] border-[#434e54] text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Год начала</Label>
                    <Input
                      type="number"
                      min={1500}
                      max={2100}
                      value={form.yearStart}
                      onChange={(e) => setForm((f) => ({ ...f, yearStart: e.target.value }))}
                      className="bg-[#262e33] border-[#434e54] text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Год окончания (только для учёных)</Label>
                    <Input
                      type="number"
                      min={1500}
                      max={2100}
                      value={form.yearEnd}
                      onChange={(e) => setForm((f) => ({ ...f, yearEnd: e.target.value }))}
                      placeholder="Не обязательно"
                      className="bg-[#262e33] border-[#434e54] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Порядок сортировки</Label>
                    <Input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                      className="bg-[#262e33] border-[#434e54] text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Цвет блока</Label>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                          title={c.label}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                            form.color === c.value ? "border-white scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL портрета / изображения</Label>
                  <Input
                    value={form.portraitUrl}
                    onChange={(e) => setForm((f) => ({ ...f, portraitUrl: e.target.value }))}
                    placeholder="https://..."
                    className="bg-[#262e33] border-[#434e54] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={5}
                    className="bg-[#262e33] border-[#434e54] text-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormOpen(false)}
                    className="border-[#434e54] bg-transparent text-white hover:bg-[#263238]"
                  >
                    <X size={16} className="mr-1" />
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-[#2eff8c] text-black hover:bg-[#26d97a]"
                  >
                    <Save size={16} className="mr-1" />
                    {editingId ? "Сохранить" : "Добавить"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border border-[#434e54] bg-[#1a1f22] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#434e54] hover:bg-transparent">
                <TableHead className="text-[#798389]">Тип</TableHead>
                <TableHead className="text-[#798389]">Название</TableHead>
                <TableHead className="text-[#798389]">Годы</TableHead>
                <TableHead className="text-[#798389]">Цвет</TableHead>
                <TableHead className="text-[#798389] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-[#798389]">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : entries && entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow key={entry.id} className="border-[#434e54] hover:bg-[#262e33]/50">
                    <TableCell>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold text-white"
                        style={{ backgroundColor: entry.color }}
                      >
                        {entry.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-white">{entry.name}</TableCell>
                    <TableCell className="text-[#c8cdd1]">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} className="text-[#798389]" />
                        {entry.yearStart}
                        {entry.yearEnd ? ` — ${entry.yearEnd}` : ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-white/10"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-[#798389]">{entry.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(entry)}
                          className="text-[#01acff] hover:text-white hover:bg-[#01acff]/10"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Удалить запись?")) {
                              deleteMutation.mutate({ id: entry.id });
                            }
                          }}
                          className="text-[#ff6b6b] hover:text-white hover:bg-[#ff6b6b]/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-[#798389]">
                    Нет записей. Добавьте первую запись таймлайна.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
