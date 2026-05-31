/**
 * Enrollment Management — Admin GUI for managing student course access
 *
 * Features:
 * - View all students and their enrollments
 * - Enroll students in topics
 * - Suspend/activate enrollments
 * - Unenroll students
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

import {
  ClipboardList,
  Plus,
  Trash2,
  PauseCircle,
  PlayCircle,
  ChevronDown,
} from "lucide-react";

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-600 text-white",
  completed: "bg-blue-600 text-white",
  suspended: "bg-red-600 text-white",
};

export default function EnrollmentManagement() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  const utils = trpc.useUtils();

  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const { data: students, isLoading: studentsLoading } =
    trpc.student.list.useQuery(
      { page: 1, pageSize: 100 },
      { enabled: !!user && user.role === "admin" }
    );

  const { data: topics } = trpc.admin.listTopics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const enrollMutation = trpc.enrollment.enroll.useMutation({
    onSuccess: () => {
      toast("Student enrolled");
      utils.enrollment.listForStudent.invalidate();
      setEnrollOpen(false);
      setSelectedTopicId(null);
    },
    onError: (err) => toast(err.message),
  });

  const unenrollMutation = trpc.enrollment.unenroll.useMutation({
    onSuccess: () => {
      toast("Enrollment removed");
      utils.enrollment.listForStudent.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  const updateStatusMutation = trpc.enrollment.updateStatus.useMutation({
    onSuccess: () => {
      toast("Enrollment updated");
      utils.enrollment.listForStudent.invalidate();
    },
    onError: (err) => toast(err.message),
  });

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-[#2eff8c]" />
          <div>
            <h1 className="text-2xl font-bold">Enrollment Management</h1>
            <p className="text-sm text-gray-400">
              Control student access to course topics
            </p>
          </div>
        </div>
      </div>

      {studentsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 bg-[#37474f]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {students?.users.map((student) => (
            <Card
              key={student.id}
              className="bg-[#1e2529] border-[#37474f]"
            >
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedStudent(
                      expandedStudent === student.id ? null : student.id
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedStudent === student.id ? "rotate-180" : ""
                      }`}
                    />
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-gray-400">
                        {student.login} ·
                        <Badge
                          className="ml-2 text-xs"
                          variant={
                            student.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {student.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <Dialog
                    open={enrollOpen && selectedStudentId === student.id}
                    onOpenChange={(open) => {
                      setEnrollOpen(open);
                      if (open) setSelectedStudentId(student.id);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentId(student.id);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Enroll
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1e2529] border-[#37474f] text-white">
                      <DialogHeader>
                        <DialogTitle>
                          Enroll {student.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <Select
                          value={selectedTopicId?.toString() ?? ""}
                          onValueChange={(v) =>
                            setSelectedTopicId(Number(v))
                          }
                        >
                          <SelectTrigger className="bg-[#263238] border-[#37474f]">
                            <SelectValue placeholder="Select topic..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1e2529] border-[#37474f]">
                            {topics?.map((t) => (
                              <SelectItem
                                key={t.id}
                                value={t.id.toString()}
                              >
                                {t.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className="w-full bg-[#2eff8c] text-[#0d1117] hover:bg-[#26d97a]"
                          disabled={!selectedTopicId || enrollMutation.isPending}
                          onClick={() => {
                            if (selectedTopicId && selectedStudentId) {
                              enrollMutation.mutate({
                                studentId: selectedStudentId,
                                topicId: selectedTopicId,
                              });
                            }
                          }}
                        >
                          {enrollMutation.isPending
                            ? "Enrolling..."
                            : "Confirm Enrollment"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Expanded enrollments */}
                {expandedStudent === student.id && (
                  <StudentEnrollments
                    studentId={student.id}
                    onUnenroll={(id) => unenrollMutation.mutate({ enrollmentId: id })}
                    onUpdateStatus={(id, status) =>
                      updateStatusMutation.mutate({ enrollmentId: id, status })
                    }
                    isPending={
                      unenrollMutation.isPending || updateStatusMutation.isPending
                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentEnrollments({
  studentId,
  onUnenroll,
  onUpdateStatus,
  isPending,
}: {
  studentId: number;
  onUnenroll: (id: number) => void;
  onUpdateStatus: (id: number, status: "active" | "completed" | "suspended") => void;
  isPending: boolean;
}) {
  const { data: enrollments, isLoading } =
    trpc.enrollment.listForStudent.useQuery({ studentId });

  if (isLoading) {
    return (
      <div className="mt-4 pl-8">
        <Skeleton className="h-8 bg-[#37474f]" />
      </div>
    );
  }

  if (!enrollments?.length) {
    return (
      <p className="mt-4 pl-8 text-sm text-gray-500">
        No enrollments yet
      </p>
    );
  }

  return (
    <div className="mt-4 pl-8 space-y-2">
      {enrollments.map((e) => (
        <div
          key={e.id}
          className="flex items-center justify-between py-2 px-3 bg-[#263238] rounded"
        >
          <div className="flex items-center gap-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: e.topicColor ?? "#2eff8c" }}
            />
            <span className="text-sm">{e.topicTitle}</span>
            <Badge
              className={
                ENROLLMENT_STATUS_COLORS[e.status] ?? "bg-gray-600"
              }
            >
              {e.status}
            </Badge>
          </div>
          <div className="flex gap-1">
            {e.status === "active" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStatus(e.id, "suspended")}
                disabled={isPending}
              >
                <PauseCircle className="h-4 w-4 text-yellow-400" />
              </Button>
            ) : e.status === "suspended" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStatus(e.id, "active")}
                disabled={isPending}
              >
                <PlayCircle className="h-4 w-4 text-green-400" />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Remove this enrollment?")) {
                  onUnenroll(e.id);
                }
              }}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
