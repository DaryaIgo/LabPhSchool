/**
 * Audit Log Viewer — Admin GUI for viewing security audit trail
 *
 * Features:
 * - Paginated audit log entries
 * - Filter by resource, action
 * - Shows actor, timestamp, success/failure status
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  login: "bg-blue-600",
  logout: "bg-gray-600",
  create: "bg-green-600",
  update: "bg-yellow-600",
  delete: "bg-red-600",
  suspend: "bg-orange-600",
  activate: "bg-green-500",
  enroll: "bg-purple-600",
  unenroll: "bg-pink-600",
};

export default function AuditLogViewer() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [page, setPage] = useState(1);
  const [resourceFilter, setResourceFilter] = useState<string | undefined>();
  const [actionFilter, setActionFilter] = useState<string | undefined>();

  const { data, isLoading } = trpc.audit.list.useQuery(
    {
      resource: resourceFilter,
      action: actionFilter,
      page,
      pageSize: 50,
    },
    { enabled: !!user && user.role === "admin" }
  );

  const { data: stats } = trpc.audit.stats.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-7 w-7 text-[#2eff8c]" />
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-gray-400">
            Security audit trail of all system actions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#1e2529] border-[#37474f]">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Total Entries</p>
            <p className="text-2xl font-bold">
              {stats?.totalEntries ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e2529] border-[#37474f]">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Logins</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats?.totalLogins ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e2529] border-[#37474f]">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-400">Failed Logins</p>
            <p className="text-2xl font-bold text-red-400">
              {stats?.failedLogins ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select
          value={resourceFilter ?? "all"}
          onValueChange={(v) => {
            setResourceFilter(v === "all" ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48 bg-[#1e2529] border-[#37474f]">
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2529] border-[#37474f]">
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="topic_nodes">Topic Nodes</SelectItem>
            <SelectItem value="virtual_labs">Virtual Labs</SelectItem>
            <SelectItem value="problems">Problems</SelectItem>
            <SelectItem value="enrollments">Enrollments</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={actionFilter ?? "all"}
          onValueChange={(v) => {
            setActionFilter(v === "all" ? undefined : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48 bg-[#1e2529] border-[#37474f]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e2529] border-[#37474f]">
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="suspend">Suspend</SelectItem>
            <SelectItem value="activate">Activate</SelectItem>
            <SelectItem value="enroll">Enroll</SelectItem>
            <SelectItem value="unenroll">Unenroll</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log Entries */}
      <Card className="bg-[#1e2529] border-[#37474f]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-[#37474f]" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#37474f]">
                      <th className="text-left p-3 text-gray-400 font-medium">
                        Time
                      </th>
                      <th className="text-left p-3 text-gray-400 font-medium">
                        Actor
                      </th>
                      <th className="text-left p-3 text-gray-400 font-medium">
                        Action
                      </th>
                      <th className="text-left p-3 text-gray-400 font-medium">
                        Resource
                      </th>
                      <th className="text-left p-3 text-gray-400 font-medium">
                        Details
                      </th>
                      <th className="text-center p-3 text-gray-400 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.entries.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-gray-500"
                        >
                          No audit entries found
                        </td>
                      </tr>
                    )}
                    {data?.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-[#37474f]/30 hover:bg-[#263238]/30"
                      >
                        <td className="p-3 text-gray-400 text-xs whitespace-nowrap">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                entry.actorType === "user"
                                  ? "border-blue-500 text-blue-400"
                                  : "border-green-500 text-green-400"
                              }`}
                            >
                              {entry.actorType === "user" ? "A" : "S"}
                            </Badge>
                            <span className="font-mono text-xs">
                              #{entry.actorId}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`${
                              ACTION_COLORS[entry.action] ?? "bg-gray-600"
                            } text-white text-xs`}
                          >
                            {entry.action}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-300">
                          {entry.resource}
                          {entry.resourceId && (
                            <span className="text-gray-500 text-xs ml-1">
                              #{entry.resourceId}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-400 text-xs max-w-[200px] truncate">
                          {entry.details
                            ? JSON.stringify(entry.details)
                            : "—"}
                        </td>
                        <td className="p-3 text-center">
                          {entry.success ? (
                            <span className="text-green-400 text-lg">
                              ✓
                            </span>
                          ) : (
                            <span className="text-red-400 text-lg" title={entry.errorMessage ?? ""}>
                              ✗
                            </span>
                          )}
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
    </div>
  );
}
