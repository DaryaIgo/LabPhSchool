/**
 * Lab Management — Admin CMS for lab simulations
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

import { FlaskConical, Plus, Pencil, Trash2 } from "lucide-react";

export default function LabManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const utils = trpc.useUtils();

  const [createOpen, setCreateOpen] = useState(false);
  const [editLab, setEditLab] = useState<{
    id: number;
    title: string;
    order: number;
    slug: string;
    description?: string | null;
    shortDesc?: string | null;
    theory?: string | null;
    iconType?: string | null;
  } | null>(null);

  const [form, setForm] = useState({
    order: 1,
    title: "",
    slug: "",
    description: "",
    shortDesc: "",
    theory: "",
    iconType: "",
    topicId: "",
  });

  const { data: labs, isLoading } = trpc.admin.listLabs.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  const { data: topics } = trpc.admin.listTopics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const createMutation = trpc.admin.createLab.useMutation({
    onSuccess: () => {
      toast("Lab created");
      utils.admin.listLabs.invalidate();
      setCreateOpen(false);
      resetForm();
    },
    onError: (err) => toast(err.message),
  });

  const updateMutation = trpc.admin.updateLab.useMutation({
    onSuccess: () => {
      toast("Lab updated");
      utils.admin.listLabs.invalidate();
      setEditLab(null);
    },
    onError: (err) => toast(err.message),
  });

  const deleteMutation = trpc.admin.deleteLab.useMutation({
    onSuccess: () => {
      toast("Lab deleted");
      utils.admin.listLabs.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  function resetForm() {
    setForm({
      order: (labs?.length ?? 0) + 1,
      title: "",
      slug: "",
      description: "",
      shortDesc: "",
      theory: "",
      iconType: "",
      topicId: "",
    });
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Lab Management</h1>
            <p className="text-sm text-gray-400">
              Manage interactive lab simulations
            </p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]">
              <Plus className="h-4 w-4 mr-2" />
              Add Lab
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Lab</DialogTitle>
            </DialogHeader>
            <LabForm
              form={form}
              setForm={setForm}
              topics={topics ?? []}
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  order: form.order,
                  title: form.title,
                  slug: form.slug,
                  description: form.description || undefined,
                  shortDesc: form.shortDesc || undefined,
                  theory: form.theory || undefined,
                  iconType: form.iconType || undefined,
                  topicId: form.topicId ? Number(form.topicId) : undefined,
                });
              }}
              isPending={createMutation.isPending}
              submitLabel="Create Lab"
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 bg-[#37474f]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {labs?.map((lab) => (
            <Card key={lab.id} className="bg-[#1e2529] border-[#37474f]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    #{lab.order} {lab.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lab.slug} · {lab.iconType || "no icon"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditLab(lab);
                      setForm({
                        order: lab.order,
                        title: lab.title,
                        slug: lab.slug,
                        description: lab.description ?? "",
                        shortDesc: lab.shortDesc ?? "",
                        theory: lab.theory ?? "",
                        iconType: lab.iconType ?? "",
                        topicId: lab.topicId?.toString() ?? "",
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4 text-[#2eff8c]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete lab "${lab.title}"?`)) {
                        deleteMutation.mutate({ id: lab.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editLab && (
        <Dialog open={!!editLab} onOpenChange={() => setEditLab(null)}>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lab</DialogTitle>
            </DialogHeader>
            <LabForm
              form={form}
              setForm={setForm}
              topics={topics ?? []}
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editLab.id,
                  title: form.title || undefined,
                  description: form.description || undefined,
                  shortDesc: form.shortDesc || undefined,
                  theory: form.theory || undefined,
                  iconType: form.iconType || undefined,
                });
              }}
              isPending={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function LabForm({
  form,
  setForm,
  topics,
  onSubmit,
  isPending,
  submitLabel,
}: {
  form: typeof initialForm;
  setForm: React.Dispatch<React.SetStateAction<typeof initialForm>>;
  topics: { id: number; title: string }[];
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Order</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) =>
              setForm((f) => ({ ...f, order: Number(e.target.value) }))
            }
            className="bg-[#263238] border-[#37474f] mt-1"
            required
            min={1}
          />
        </div>
        <div>
          <Label>Topic (optional)</Label>
          <Select
            value={form.topicId}
            onValueChange={(v) => setForm((f) => ({ ...f, topicId: v }))}
          >
            <SelectTrigger className="bg-[#263238] border-[#37474f] mt-1">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2529] border-[#37474f]">
              <SelectItem value="">None</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="bg-[#263238] border-[#37474f] mt-1"
          required
        />
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="bg-[#263238] border-[#37474f] mt-1"
          required
          pattern="[a-z0-9-]+"
          placeholder="lab-slug"
        />
      </div>
      <div>
        <Label>Short Description</Label>
        <Input
          value={form.shortDesc}
          onChange={(e) =>
            setForm((f) => ({ ...f, shortDesc: e.target.value }))
          }
          className="bg-[#263238] border-[#37474f] mt-1"
        />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="w-full mt-1 p-2 bg-[#263238] border border-[#37474f] rounded-md text-white text-sm min-h-[60px]"
        />
      </div>
      <div>
        <Label>Theory</Label>
        <textarea
          value={form.theory}
          onChange={(e) =>
            setForm((f) => ({ ...f, theory: e.target.value }))
          }
          className="w-full mt-1 p-2 bg-[#263238] border border-[#37474f] rounded-md text-white text-sm min-h-[100px]"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
        disabled={isPending}
      >
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

const initialForm = {
  order: 1,
  title: "",
  slug: "",
  description: "",
  shortDesc: "",
  theory: "",
  iconType: "",
  topicId: "",
};
