/**
 * Topic Management — Admin CMS for course topics
 *
 * CRUD operations on topics with form validation.
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";

export default function TopicManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const utils = trpc.useUtils();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<{
    id: number;
    title: string;
    slug: string;
    order: number;
    formula?: string | null;
    description?: string | null;
    shortDesc?: string | null;
    color?: string | null;
  } | null>(null);

  // Form fields
  const [form, setForm] = useState({
    order: 1,
    title: "",
    slug: "",
    formula: "",
    description: "",
    shortDesc: "",
    color: "#2eff8c",
  });

  const { data: topics, isLoading } = trpc.admin.listTopics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const createMutation = trpc.admin.createTopic.useMutation({
    onSuccess: () => {
      toast("Topic created");
      utils.admin.listTopics.invalidate();
      setCreateOpen(false);
      resetForm();
    },
    onError: (err) => toast(err.message),
  });

  const updateMutation = trpc.admin.updateTopic.useMutation({
    onSuccess: () => {
      toast("Topic updated");
      utils.admin.listTopics.invalidate();
      setEditTopic(null);
    },
    onError: (err) => toast(err.message),
  });

  const deleteMutation = trpc.admin.deleteTopic.useMutation({
    onSuccess: () => {
      toast("Topic deleted");
      utils.admin.listTopics.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  function resetForm() {
    setForm({
      order: (topics?.length ?? 0) + 1,
      title: "",
      slug: "",
      formula: "",
      description: "",
      shortDesc: "",
      color: "#2eff8c",
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      order: form.order,
      title: form.title,
      slug: form.slug,
      formula: form.formula || undefined,
      description: form.description || undefined,
      shortDesc: form.shortDesc || undefined,
      color: form.color,
    });
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editTopic) return;
    updateMutation.mutate({
      id: editTopic.id,
      title: form.title || undefined,
      formula: form.formula || undefined,
      description: form.description || undefined,
      shortDesc: form.shortDesc || undefined,
      color: form.color || undefined,
    });
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Topic Management</h1>
            <p className="text-sm text-gray-400">
              Create and edit course topics
            </p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]">
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Topic</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new course topic.
              </DialogDescription>
            </DialogHeader>
            <TopicForm
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              isPending={createMutation.isPending}
              submitLabel="Create Topic"
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
          {topics?.map((topic) => (
            <Card
              key={topic.id}
              className="bg-[#1e2529] border-[#37474f] hover:border-[#455a64] transition-colors"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: topic.color ?? "#2eff8c" }}
                  />
                  <div>
                    <p className="font-medium">{topic.title}</p>
                    <p className="text-xs text-gray-400">
                      #{topic.order} · {topic.slug}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditTopic(topic);
                      setForm({
                        order: topic.order,
                        title: topic.title,
                        slug: topic.slug,
                        formula: topic.formula ?? "",
                        description: topic.description ?? "",
                        shortDesc: topic.shortDesc ?? "",
                        color: topic.color ?? "#2eff8c",
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4 text-[#2eff8c]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete topic "${topic.title}"?`)) {
                        deleteMutation.mutate({ id: topic.id });
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

      {/* Edit Dialog */}
      {editTopic && (
        <Dialog open={!!editTopic} onOpenChange={() => setEditTopic(null)}>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
            </DialogHeader>
            <TopicForm
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function TopicForm({
  form,
  setForm,
  onSubmit,
  isPending,
  submitLabel,
}: {
  form: typeof initialForm;
  setForm: React.Dispatch<React.SetStateAction<typeof initialForm>>;
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
          <Label>Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={form.color}
              onChange={(e) =>
                setForm((f) => ({ ...f, color: e.target.value }))
              }
              className="w-12 h-9 p-1 bg-[#263238] border-[#37474f]"
            />
            <Input
              value={form.color}
              onChange={(e) =>
                setForm((f) => ({ ...f, color: e.target.value }))
              }
              className="flex-1 bg-[#263238] border-[#37474f]"
            />
          </div>
        </div>
      </div>
      <div>
        <Label>Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="bg-[#263238] border-[#37474f] mt-1"
          required
          maxLength={255}
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
          placeholder="topic-slug"
        />
      </div>
      <div>
        <Label>Formula (optional)</Label>
        <Input
          value={form.formula}
          onChange={(e) => setForm((f) => ({ ...f, formula: e.target.value }))}
          className="bg-[#263238] border-[#37474f] mt-1"
          maxLength={500}
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
          maxLength={500}
        />
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="w-full mt-1 p-2 bg-[#263238] border border-[#37474f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2eff8c] min-h-[80px]"
          maxLength={5000}
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
  formula: "",
  description: "",
  shortDesc: "",
  color: "#2eff8c",
};
