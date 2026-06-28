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
  Beaker,
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
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function CompactCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-[#1e2529] border-[#37474f] text-white">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="shrink-0">
          <Icon className="h-5 w-5 text-[#2eff8c]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 mb-1">{title}</p>
          <div className="flex items-center gap-3">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompactStat({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-[10px] text-gray-500 leading-none">{label}</span>
    </div>
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
      className="h-auto py-2 px-2 flex flex-col items-center justify-center gap-1 bg-[#1e2529] border-[#37474f] hover:border-[#2eff8c] hover:bg-[#263238] text-white min-h-[72px]"
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-[#2eff8c]" />
      <span className="text-[11px] leading-tight text-center whitespace-normal">
        {label}
      </span>
    </Button>
  );
}

function QuickActionsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const { data: stats } = trpc.admin.dashboardStats.useQuery(undefined, {
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

      {/* System Overview */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-[#2eff8c]" />
        System Overview
      </h2>

      {/* Students */}
      <h3 className="text-base font-semibold mb-3 text-gray-300 flex items-center gap-2">
        <Users className="h-4 w-4 text-[#2eff8c]" />
        Ученики
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Работы"
          value={stats?.content.submissions ?? "—"}
          subtitle="На проверке"
          icon={FileCheck}
          onClick={() => navigate("/admin/submissions")}
        />
        <StatCard
          title="Всего учеников"
          value={stats?.students.total ?? "—"}
          subtitle={`${stats?.students.active ?? 0} активных`}
          icon={GraduationCap}
          onClick={() => navigate("/admin/students")}
        />
        <StatCard
          title="Приостановлены"
          value={stats?.students.suspended ?? "—"}
          subtitle="Требуют внимания"
          icon={Users}
          onClick={() => navigate("/admin/students")}
        />
      </div>

      {/* Learning Materials */}
      <h3 className="text-base font-semibold mb-3 text-gray-300 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-[#ffcb3d]" />
        Статистика учебных материалов
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <CompactCard title="Курс" icon={BookOpen}>
          <CompactStat value={stats?.content.topics ?? "—"} label="тем" />
          <CompactStat
            value={stats?.content.subtopics ?? "—"}
            label="разделов"
          />
        </CompactCard>
        <CompactCard title="Лабораторные" icon={FlaskConical}>
          <CompactStat
            value={stats?.content.simulations ?? "—"}
            label="симуляций"
          />
          <CompactStat value={stats?.content.labWorks ?? "—"} label="работ" />
        </CompactCard>
        <CompactCard title="Задачи" icon={ClipboardList}>
          <CompactStat value={stats?.content.problems ?? "—"} label="задач" />
        </CompactCard>
        <CompactCard title="Jupyter" icon={NotebookPen}>
          <CompactStat
            value={stats?.content.notebooks ?? "—"}
            label="ноутбуков"
          />
        </CompactCard>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>

      <QuickActionsGroup title="Ученики">
        <QuickAction
          label="Ученики"
          icon={GraduationCap}
          onClick={() => navigate("/admin/students")}
        />
        <QuickAction
          label="Назначения"
          icon={ClipboardList}
          onClick={() => navigate("/admin/enrollments")}
        />
        <QuickAction
          label="Проверка"
          icon={FileCheck}
          onClick={() => navigate("/admin/submissions")}
        />
      </QuickActionsGroup>

      <QuickActionsGroup title="Управление контентом">
        <QuickAction
          label="Темы"
          icon={BookOpen}
          onClick={() => navigate("/admin/topics")}
        />
        <QuickAction
          label="Лабораторные"
          icon={Beaker}
          onClick={() => navigate("/admin/lab-management")}
        />
        <QuickAction
          label="Задачи"
          icon={ShieldCheck}
          onClick={() => navigate("/admin/problems")}
        />
        <QuickAction
          label="Ноутбуки"
          icon={NotebookPen}
          onClick={() => navigate("/admin/jupyter-notebooks")}
        />
        <QuickAction
          label="Ресурсы"
          icon={Library}
          onClick={() => navigate("/admin/resources")}
        />
      </QuickActionsGroup>

      <QuickActionsGroup title="Система">
        <QuickAction
          label="Аудит"
          icon={Activity}
          onClick={() => navigate("/admin/audit")}
        />
        <QuickAction
          label="Timeline"
          icon={History}
          onClick={() => navigate("/admin/timeline")}
        />
      </QuickActionsGroup>

      {/* Recent Activity Preview */}
      {/* Security section hidden per request */}
    </div>
  );
}
