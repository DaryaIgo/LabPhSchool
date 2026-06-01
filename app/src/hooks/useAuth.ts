import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

export type AuthUser = {
  id: number;
  name: string;
  role: string;
  type: "user" | "student";
  email?: string | null;
  avatar?: string | null;
  login?: string;
  status?: string;
  permissions: string[];
};

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.unifiedAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.unifiedAuth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate(redirectPath);
    },
  });

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  const user: AuthUser | null = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      name: data.name ?? "",
      role: data.role,
      type: data.type,
      email: "email" in data ? (data.email as string | null | undefined) : undefined,
      avatar: "avatar" in data ? (data.avatar as string | null | undefined) : undefined,
      login: "login" in data ? (data.login as string | undefined) : undefined,
      status: "status" in data ? (data.status as string | undefined) : undefined,
      permissions: (data.permissions ?? []).map((p: unknown) =>
        typeof p === "string" ? p : (p as { name: string }).name
      ),
    };
  }, [data]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      isAdmin: user?.role === "admin",
      error,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, refetch]
  );
}
