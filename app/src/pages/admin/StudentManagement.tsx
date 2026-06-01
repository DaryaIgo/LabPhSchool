/**
 * Student Management — Admin GUI for CRUD on student accounts
 *
 * Features:
 * - Paginated student list with search
 * - Create student with validated form
 * - Edit student (name, status, password)
 * - Suspend/activate accounts
 * - Delete with confirmation
 * - View student progress
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
  GraduationCap,
  Search,
  Plus,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-600 text-white",
  inactive: "bg-gray-600 text-white",
  suspended: "bg-red-600 text-white",
};

export default function StudentManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "suspended" | undefined
  >(undefined);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<{
    id: number;
    name: string;
    status: string;
  } | null>(null);


  // Form states
  const [formLogin, setFormLogin] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editPassword, setEditPassword] = useState("");

  const { data, isLoading } = trpc.student.list.useQuery(
    { search: search || undefined, status: statusFilter, page, pageSize: 20 },
    { enabled: !!user && user.role === "admin" }
  );

  const createMutation = trpc.student.create.useMutation({
    onSuccess: () => {
      toast("Student created successfully");
      utils.student.list.invalidate();
      setCreateOpen(false);
      resetCreateForm();
    },
    onError: (err) => toast(err.message),
  });

  const updateMutation = trpc.student.update.useMutation({
    onSuccess: () => {
      toast("Student updated");
      utils.student.list.invalidate();
      setEditStudent(null);
    },
    onError: (err) => toast(err.message),
  });

  const suspendMutation = trpc.student.suspend.useMutation({
    onSuccess: () => {
      toast("Student suspended");
      utils.student.list.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  const activateMutation = trpc.student.activate.useMutation({
    onSuccess: () => {
      toast("Student activated");
      utils.student.list.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  const deleteMutation = trpc.student.delete.useMutation({
    onSuccess: () => {
      toast("Student deleted");
      utils.student.list.invalidate();
    },
    onError: (err) => toast(err.message),
  });


  function resetCreateForm() {
    setFormLogin("");
    setFormPassword("");
    setFormName("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      login: formLogin,
      password: formPassword,
      name: formName,
    });
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editStudent) return;
    const data: { name?: string; status?: "active" | "inactive" | "suspended"; password?: string } = {};
    if (editName !== editStudent.name) data.name = editName;
    if (editStatus !== editStudent.status) data.status = editStatus as "active" | "inactive" | "suspended";
    if (editPassword) data.password = editPassword;
    if (Object.keys(data).length === 0) {
      setEditStudent(null);
      return;
    }
    updateMutation.mutate({ id: editStudent.id, ...data });
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-sm text-gray-400">
              Create, update, and manage student accounts
            </p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Student</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a student account with a secure password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="login">Username</Label>
                <Input
                  id="login"
                  value={formLogin}
                  onChange={(e) => setFormLogin(e.target.value)}
                  placeholder="student_login"
                  className="bg-[#263238] border-[#37474f] mt-1"
                  required
                  minLength={3}
                  maxLength={100}
                  pattern="[a-zA-Z0-9_]+"
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ivan Petrov"
                  className="bg-[#263238] border-[#37474f] mt-1"
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, lowercase, digit"
                  className="bg-[#263238] border-[#37474f] mt-1"
                  required
                  minLength={8}
                  maxLength={128}
                />
                <p className="text-xs text-gray-500 mt-1">
                  8+ characters with uppercase, lowercase, and digit
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-[#1e2529] border-[#37474f]"
          />
        </div>
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(v) => {
            setStatusFilter(
              v === "all" ? undefined : (v as "active" | "inactive" | "suspended")
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40 bg-[#1e2529] border-[#37474f]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2529] border-[#37474f]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-[#1e2529] border-[#37474f]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-[#37474f]" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#37474f]">
                      <th className="text-left p-4 text-gray-400 font-medium">
                        ID
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Login
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Name
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Status
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Created
                      </th>
                      <th className="text-right p-4 text-gray-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.users.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-gray-500"
                        >
                          No students found
                        </td>
                      </tr>
                    )}
                    {data?.users.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-[#37474f]/50 hover:bg-[#263238]/50"
                      >
                        <td className="p-4 font-mono text-xs text-gray-400">
                          {s.id}
                        </td>
                        <td className="p-4 font-medium">{s.login}</td>
                        <td className="p-4">{s.name}</td>
                        <td className="p-4">
                          <Badge
                            className={
                              STATUS_COLORS[s.status] ?? "bg-gray-600"
                            }
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-400">
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditStudent({
                                  id: s.id,
                                  name: s.name,
                                  status: s.status,
                                });
                                setEditName(s.name);
                                setEditStatus(s.status);
                                setEditPassword("");
                              }}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4 text-[#2eff8c]" />
                            </Button>
                            {s.status === "active" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  suspendMutation.mutate({ id: s.id })
                                }
                                disabled={suspendMutation.isPending}
                                title="Suspend"
                              >
                                <PauseCircle className="h-4 w-4 text-yellow-400" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  activateMutation.mutate({ id: s.id })
                                }
                                disabled={activateMutation.isPending}
                                title="Activate"
                              >
                                <PlayCircle className="h-4 w-4 text-green-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete student "${s.name}"? This cannot be undone.`
                                  )
                                ) {
                                  deleteMutation.mutate({ id: s.id });
                                }
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-[#37474f]">
                  <p className="text-sm text-gray-400">
                    Page {data.page} of {data.totalPages} ({data.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="border-[#37474f]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(data.totalPages, p + 1))
                      }
                      disabled={page >= data.totalPages}
                      className="border-[#37474f]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editStudent && (
        <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
          <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update student details. Leave password blank to keep current.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[#263238] border-[#37474f] mt-1"
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(v) =>
                    setEditStatus(v as "active" | "inactive" | "suspended")
                  }
                >
                  <SelectTrigger className="bg-[#263238] border-[#37474f] mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2529] border-[#37474f]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>New Password (leave blank to keep)</Label>
                <Input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="bg-[#263238] border-[#37474f] mt-1"
                  minLength={8}
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
