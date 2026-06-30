import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlatformLinkButton } from "@/components/PlatformLinkButton";
import { getPlatformDisplayTitle } from "@/lib/platformLinks";
import {
  Link,
  Pencil,
  Trash2,
  X,
  Check,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface StudentLinksDialogProps {
  studentId: number;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentLinksDialog({
  studentId,
  studentName,
  open,
  onOpenChange,
}: StudentLinksDialogProps) {
  const utils = trpc.useUtils();

  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const { data: links, isLoading } = trpc.student.listLinks.useQuery(
    { localUserId: studentId },
    { enabled: open }
  );

  const createMutation = trpc.student.createLink.useMutation({
    onSuccess: () => {
      toast("Ссылка добавлена");
      utils.student.listLinks.invalidate({ localUserId: studentId });
      setNewUrl("");
      setNewTitle("");
    },
    onError: err => toast(err.message),
  });

  const updateMutation = trpc.student.updateLink.useMutation({
    onSuccess: () => {
      toast("Ссылка обновлена");
      utils.student.listLinks.invalidate({ localUserId: studentId });
      setEditingId(null);
    },
    onError: err => toast(err.message),
  });

  const deleteMutation = trpc.student.deleteLink.useMutation({
    onSuccess: () => {
      toast("Ссылка удалена");
      utils.student.listLinks.invalidate({ localUserId: studentId });
    },
    onError: err => toast(err.message),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim()) return;
    createMutation.mutate({
      localUserId: studentId,
      url: newUrl.trim(),
      title: newTitle.trim() || undefined,
    });
  }

  function startEdit(link: {
    id: number;
    url: string;
    title: string | null;
  }) {
    setEditingId(link.id);
    setEditUrl(link.url);
    setEditTitle(link.title ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditUrl("");
    setEditTitle("");
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editUrl.trim()) return;

    const trimmedUrl = editUrl.trim();
    const trimmedTitle = editTitle.trim();

    updateMutation.mutate({
      id: editingId,
      url: trimmedUrl,
      title: trimmedTitle || null,
    });
  }

  function handleMove(id: number, direction: "up" | "down") {
    if (!links) return;
    const index = links.findIndex(l => l.id === id);
    if (index === -1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const targetOrder = links[newIndex].displayOrder;
    updateMutation.mutate({ id, displayOrder: targetOrder });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-[#2eff8c]" />
            Ссылки: {studentName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://zoom.us/j/123456789"
              className="bg-[#263238] border-[#37474f] mt-1"
              required
              type="url"
            />
          </div>
          <div>
            <Label htmlFor="link-title">
              Название <span className="text-gray-500">(необязательно)</span>
            </Label>
            <Input
              id="link-title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Например, «Основная конференция»"
              className="bg-[#263238] border-[#37474f] mt-1"
              maxLength={255}
            />
          </div>

          {newUrl && (
            <div className="flex items-center gap-3 p-3 bg-[#263238] rounded-lg border border-[#37474f]">
              <span className="text-sm text-gray-400">Предпросмотр:</span>
              <PlatformLinkButton
                url={newUrl}
                title={newTitle}
                size="sm"
                showExternalIcon={false}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
            disabled={createMutation.isPending || !newUrl.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            {createMutation.isPending ? "Добавление..." : "Добавить ссылку"}
          </Button>
        </form>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            Сохранённые ссылки
          </h4>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-[#263238] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : links?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              У ученика пока нет персональных ссылок.
            </p>
          ) : (
            <ul className="space-y-2">
              {links?.map((link, index) => (
                <li
                  key={link.id}
                  className="bg-[#263238] border border-[#37474f] rounded-lg p-2.5"
                >
                  {editingId === link.id ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <Input
                        value={editUrl}
                        onChange={e => setEditUrl(e.target.value)}
                        placeholder="URL"
                        className="bg-[#1e2529] border-[#37474f]"
                        required
                        type="url"
                      />
                      <Input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Название (необязательно)"
                        className="bg-[#1e2529] border-[#37474f]"
                        maxLength={255}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                          disabled={updateMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Сохранить
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <PlatformLinkButton
                          url={link.url}
                          title={link.title}
                          size="sm"
                          showExternalIcon={false}
                        />
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMove(link.id, "up")}
                          disabled={index === 0 || updateMutation.isPending}
                          title="Вверх"
                          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMove(link.id, "down")}
                          disabled={
                            index === (links?.length ?? 0) - 1 ||
                            updateMutation.isPending
                          }
                          title="Вниз"
                          className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(link)}
                          title="Редактировать"
                          className="h-8 w-8 text-[#2eff8c] hover:text-[#26d97a]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                `Удалить ссылку «${getPlatformDisplayTitle(
                                  link.url,
                                  link.title
                                )}»?`
                              )
                            ) {
                              deleteMutation.mutate({ id: link.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Удалить"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
