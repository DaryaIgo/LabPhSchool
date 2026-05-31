/**
 * Subtopic Management — Admin CMS for course subtopics
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

import { Layers, Plus, Pencil, Trash2 } from "lucide-react";

export default function SubtopicManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const utils = trpc.useUtils();

  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSubtopic, setEditSubtopic] = useState<{
    id: number;
    title: string;
    order: number;
    description?: string | null;
    content?: string | null;
  } | null>(null);

  const [form, setForm] = useState({
    topicId: 0,
    order: 1,
    title: "",
    description: "",
    content: "",
  });

  const { data: topics } = trpc.admin.listTopics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: subtopics, isLoading } = trpc.admin.listSubtopics.useQuery(
    { topicId: selectedTopicId ?? 0 },
    { enabled: !!selectedTopicId }
  );

  const createMutation = trpc.admin.createSubtopic.useMutation({
    onSuccess: () => {
      toast("Subtopic created");
      utils.admin.listSubtopics.invalidate();
      setCreateOpen(false);
      setForm({ topicId: 0, order: 1, title: "", description: "", content: "" });
    },
    onError: (err) => toast(err.message),
  });

  const updateMutation = trpc.admin.updateSubtopic.useMutation({
    onSuccess: () => {
      toast("Subtopic updated");
      utils.admin.listSubtopics.invalidate();
      setEditSubtopic(null);
    },
    onError: (err) => toast(err.message),
  });

  const deleteMutation = trpc.admin.deleteSubtopic.useMutation({
    onSuccess: () => {
      toast("Subtopic deleted");
      utils.admin.listSubtopics.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  if (!user || user.role !== "admin") return null;

  const selectedTopic = topics?.find((t) => t.id === selectedTopicId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="h-7 w-7 text-[#2eff8c]" />
        <div>
          <h1 className="text-2xl font-bold">Subtopic Management</h1>
          <p className="text-sm text-gray-400">
            Manage subtopics within course topics
          </p>
        </div>
      </div>

      {/* Topic Selector */}
      <div className="mb-6">
        <Label>Select Topic</Label>
        <Select
          value={selectedTopicId?.toString() ?? ""}
          onValueChange={(v) => setSelectedTopicId(Number(v))}
        >
          <SelectTrigger className="w-full max-w-md bg-[#1e2529] border-[#37474f] mt-1">
            <SelectValue placeholder="Choose a topic..." />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2529] border-[#37474f]">
            {topics?.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                #{t.order} {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTopicId ? (
        <div className="text-center py-12 text-gray-500">
          Select a topic to view and manage its subtopics
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedTopic?.title} — Subtopics
            </h2>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Subtopic</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createMutation.mutate({
                      topicId: selectedTopicId,
                      order: form.order,
                      title: form.title,
                      description: form.description || undefined,
                      content: form.content || undefined,
                    });
                  }}
                  className="space-y-4 mt-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={form.order}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            order: Number(e.target.value),
                          }))
                        }
                        className="bg-[#263238] border-[#37474f] mt-1"
                        required
                        min={1}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="bg-[#263238] border-[#37474f] mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      className="bg-[#263238] border-[#37474f] mt-1"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <textarea
                      value={form.content}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, content: e.target.value }))
                      }
                      className="w-full mt-1 p-2 bg-[#263238] border border-[#37474f] rounded-md text-white text-sm min-h-[120px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 bg-[#37474f]" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {subtopics?.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No subtopics yet
                </p>
              )}
              {subtopics?.map((st) => (
                <Card
                  key={st.id}
                  className="bg-[#1e2529] border-[#37474f]"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        #{st.order} {st.title}
                      </p>
                      {st.description && (
                        <p className="text-xs text-gray-400 mt-1">
                          {st.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditSubtopic(st);
                          setForm({
                            topicId: st.topicId,
                            order: st.order,
                            title: st.title,
                            description: st.description ?? "",
                            content: st.content ?? "",
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4 text-[#2eff8c]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete "${st.title}"?`)) {
                            deleteMutation.mutate({ id: st.id });
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
        </>
      )}

      {/* Edit Dialog */}
      {editSubtopic && (
        <Dialog open={!!editSubtopic} onOpenChange={() => setEditSubtopic(null)}>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Subtopic</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editSubtopic.id,
                  title: form.title || undefined,
                  description: form.description || undefined,
                  content: form.content || undefined,
                });
              }}
              className="space-y-4 mt-4"
            >
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="bg-[#263238] border-[#37474f] mt-1"
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="bg-[#263238] border-[#37474f] mt-1"
                />
              </div>
              <div>
                <Label>Content</Label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  className="w-full mt-1 p-2 bg-[#263238] border border-[#37474f] rounded-md text-white text-sm min-h-[120px]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
