/**
 * Visit Analytics — Admin dashboard for self-hosted visit statistics.
 */

import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Activity,
  Eye,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-[#1e2529] border-[#37474f] text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-[#2eff8c]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function VisitAnalytics() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/");
  }, [user, navigate]);

  const isAdmin = !!user && user.role === "admin";

  const { data: stats, isLoading: statsLoading } = trpc.analytics.stats.useQuery(
    undefined,
    { enabled: isAdmin }
  );
  const { data: visitsByDay, isLoading: chartLoading } =
    trpc.analytics.visitsByDay.useQuery({ days: 30 }, { enabled: isAdmin });
  const { data: topPages, isLoading: topPagesLoading } =
    trpc.analytics.topPages.useQuery({ limit: 10 }, { enabled: isAdmin });
  const { data: recentVisits, isLoading: recentLoading } =
    trpc.analytics.recentVisits.useQuery({ limit: 20 }, { enabled: isAdmin });

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8 bg-[#37474f]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-[#37474f]" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const chartData =
    visitsByDay?.map(row => ({
      date: format(parseISO(row.date), "dd.MM"),
      visits: row.visits,
      uniqueVisitors: row.uniqueVisitors,
    })) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="bg-[#1e2529] border-[#37474f] text-white hover:border-[#2eff8c]"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Аналитика посещений</h1>
          <p className="text-sm text-gray-400">
            Собственная статистика просмотров сайта
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Всего визитов"
          value={statsLoading ? "—" : stats?.totalVisits ?? 0}
          icon={Activity}
        />
        <StatCard
          title="Сегодня"
          value={statsLoading ? "—" : stats?.todayVisits ?? 0}
          icon={Calendar}
        />
        <StatCard
          title="Вчера"
          value={statsLoading ? "—" : stats?.yesterdayVisits ?? 0}
          icon={Calendar}
        />
        <StatCard
          title="Уникальные посетители"
          value={statsLoading ? "—" : stats?.uniqueVisitors ?? 0}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-[#1e2529] border-[#37474f] text-white">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#2eff8c]" />
              Посещения за 30 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-64 bg-[#37474f]" />
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e2529",
                      borderColor: "#37474f",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#2eff8c"
                    strokeWidth={2}
                    dot={false}
                    name="Визиты"
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueVisitors"
                    stroke="#ffcb3d"
                    strokeWidth={2}
                    dot={false}
                    name="Уникальные"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1e2529] border-[#37474f] text-white">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#2eff8c]" />
              Топ страниц
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPagesLoading ? (
              <Skeleton className="h-64 bg-[#37474f]" />
            ) : (
              <div className="space-y-2">
                {topPages?.length ? (
                  topPages.map((page, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span
                        className="truncate max-w-[180px] text-gray-300"
                        title={page.path}
                      >
                        {page.path}
                      </span>
                      <span className="font-mono text-[#2eff8c]">
                        {page.visits}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Нет данных</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1e2529] border-[#37474f] text-white">
        <CardHeader>
          <CardTitle className="text-base font-medium">Последние визиты</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <Skeleton className="h-48 bg-[#37474f]" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-[#37474f]">
                    <th className="pb-2 font-medium">Время</th>
                    <th className="pb-2 font-medium">Страница</th>
                    <th className="pb-2 font-medium">IP</th>
                    <th className="pb-2 font-medium">User-Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits?.length ? (
                    recentVisits.map(visit => (
                      <tr
                        key={visit.id}
                        className="border-b border-[#37474f]/50"
                      >
                        <td className="py-2 text-gray-300 whitespace-nowrap">
                          {format(new Date(visit.visitedAt), "dd.MM HH:mm")}
                        </td>
                        <td
                          className="py-2 truncate max-w-[200px]"
                          title={visit.path}
                        >
                          {visit.path}
                        </td>
                        <td className="py-2 text-gray-400 whitespace-nowrap">
                          {visit.ipAddress || "—"}
                        </td>
                        <td
                          className="py-2 truncate max-w-[200px] text-gray-400"
                          title={visit.userAgent ?? undefined}
                        >
                          {visit.userAgent || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-gray-500">
                        Нет данных
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
