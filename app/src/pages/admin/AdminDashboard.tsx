/**
 * Admin Dashboard — Overview Page
 *
 * Shows system statistics, quick actions, and navigation
 * to all admin management sections.
 */

import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import {
  Users,
  BookOpen,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  ClipboardList,
  Activity,
  Library,
  FileCheck,
  NotebookPen,
  History,
} from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`bg-[#1e2529] border-[#37474f] text-white ${
        onClick ? "cursor-pointer hover:border-[#2eff8c] transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-[#2eff8c]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAction({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-auto py-4 px-4 flex flex-col items-center gap-2 bg-[#1e2529] border-[#37474f] hover:border-[#2eff8c] hover:bg-[#263238] text-white"
      onClick={onClick}
    >
      <Icon className="h-6 w-6 text-[#2eff8c]" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const { data: stats } =
    trpc.admin.dashboardStats.useQuery(undefined, {
      enabled: !!user,
      retry: false,
    });

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8 bg-[#37474f]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-[#37474f]" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="h-8 w-8 text-[#2eff8c]" />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-400">
            Manage students, content, and monitor system activity
          </p>
        </div>
      </div>

      {/* Statistics */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-[#2eff8c]" />
        System Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={stats?.students.total ?? "—"}
          subtitle={`${stats?.students.active ?? 0} active`}
          icon={GraduationCap}
          onClick={() => navigate("/admin/students")}
        />
        <StatCard
          title="Suspended"
          value={stats?.students.suspended ?? "—"}
          subtitle="Require attention"
          icon={Users}
          onClick={() => navigate("/admin/students")}
        />
        <StatCard
          title="Topics"
          value={stats?.content.topics ?? "—"}
          subtitle="Course topics"
          icon={BookOpen}
          onClick={() => navigate("/admin/topics")}
        />
        <StatCard
          title="Virtual Labs"
          value={stats?.content.labWorks ?? "—"}
          subtitle="Interactive simulations"
          icon={FlaskConical}
          onClick={() => navigate("/admin/virtual-labs")}
        />
        <StatCard
          title="Ресурсы"
          value={stats?.content.resources ?? "—"}
          subtitle="Дополнительные материалы"
          icon={Library}
          onClick={() => navigate("/admin/resources")}
        />
        <StatCard
          title="Работы"
          value={stats?.content.labSubmissions ?? "—"}
          subtitle="На проверке"
          icon={FileCheck}
          onClick={() => navigate("/admin/lab-submissions")}
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        <QuickAction
          label="Students"
          icon={GraduationCap}
          onClick={() => navigate("/admin/students")}
        />
        <QuickAction
          label="Topics"
          icon={BookOpen}
          onClick={() => navigate("/admin/topics")}
        />
        <QuickAction
          label="Virtual Labs"
          icon={FlaskConical}
          onClick={() => navigate("/admin/virtual-labs")}
        />
        <QuickAction
          label="Enrollments"
          icon={ClipboardList}
          onClick={() => navigate("/admin/enrollments")}
        />
        <QuickAction
          label="Problems"
          icon={ShieldCheck}
          onClick={() => navigate("/admin/problems")}
        />
        <QuickAction
          label="Audit Log"
          icon={Activity}
          onClick={() => navigate("/admin/audit")}
        />
        <QuickAction
          label="Ресурсы"
          icon={Library}
          onClick={() => navigate("/admin/resources")}
        />
        <QuickAction
          label="Проверка работ"
          icon={FileCheck}
          onClick={() => navigate("/admin/lab-submissions")}
        />
        <QuickAction
          label="Jupyter-ссылки"
          icon={NotebookPen}
          onClick={() => navigate("/admin/subtopics")}
        />
        <QuickAction
          label="Jupyter-ноутбуки"
          icon={NotebookPen}
          onClick={() => navigate("/admin/jupyter-notebooks")}
        />
        <QuickAction
          label="Стрела времени"
          icon={History}
          onClick={() => navigate("/admin/timeline")}
        />
      </div>

      {/* Recent Activity Preview */}
      {/* Security section hidden per request */}
    </div>
  );
}
