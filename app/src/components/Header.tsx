import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { trpc } from "@/providers/trpc";
import NebulaLogo from "@/components/NebulaLogo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Menu,
  X,
  FlaskConical,
  BookOpen,
  Library,
  User,
  LogOut,
  Bell,
  NotebookPen,
  Check,
  History,
} from "lucide-react";

function StudentNotifications() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: notifications } = trpc.student.getNotifications.useQuery(
    undefined,
    { enabled: open }
  );
  const { data: unreadCount } =
    trpc.student.getUnreadNotificationCount.useQuery();

  const markRead = trpc.student.markNotificationRead.useMutation({
    onSuccess: () => {
      utils.student.getNotifications.invalidate();
      utils.student.getUnreadNotificationCount.invalidate();
    },
  });

  const markAllRead = trpc.student.markAllNotificationsRead.useMutation({
    onSuccess: () => {
      utils.student.getNotifications.invalidate();
      utils.student.getUnreadNotificationCount.invalidate();
    },
  });

  const unread = notifications?.filter(n => !n.read) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full text-[#c8cdd1] hover:text-white hover:bg-white/5 transition-colors">
          <Bell size={18} />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-[#ff6b6b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-[#1e2529] border-[#37474f] text-white w-80 p-0"
        align="end"
      >
        <div className="flex items-center justify-between p-3 border-b border-[#37474f]">
          <span className="text-sm font-medium">Уведомления</span>
          {unread.length > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-[#2eff8c] hover:underline"
            >
              Прочитать всё
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 border-b border-[#37474f]/50 flex items-start gap-2 ${
                  n.read ? "opacity-60" : ""
                }`}
              >
                <div className="mt-0.5">
                  {n.type === "jupyter_notebook" ? (
                    <NotebookPen size={14} className="text-[#2eff8c]" />
                  ) : (
                    <Bell size={14} className="text-[#01acff]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.message && (
                    <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                  )}
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead.mutate({ id: n.id })}
                    className="text-[#2eff8c] hover:bg-[#2eff8c]/10 p-1 rounded"
                    title="Отметить прочитанным"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">
              Нет уведомлений
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/course", label: "Курс", icon: BookOpen },
    { to: "/labs", label: "Лабораторные", icon: FlaskConical },
    { to: "/resources", label: "Ресурсы", icon: Library },
    { to: "/timeline", label: "Стрела времени", icon: History },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-2">
              <NebulaLogo />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? "text-[#2eff8c] bg-[#2eff8c]/10"
                      : "text-[#c8cdd1] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.role === "student" && <StudentNotifications />}
                <Link
                  to={user.role === "admin" ? "/admin" : "/profile"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive("/profile") ||
                    isActive("/student/profile") ||
                    isActive("/admin")
                      ? "text-[#2eff8c] bg-[#2eff8c]/10"
                      : "text-[#c8cdd1] hover:text-white"
                  }`}
                >
                  {user.avatar ? (
                    <img
                      src={`/avatars/${user.avatar}.svg`}
                      alt=""
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <User size={16} />
                  )}
                  <span className="max-w-[100px] truncate">
                    {user.name || "Кабинет"}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-[#798389] hover:text-white transition-colors flex items-center gap-1"
                >
                  <LogOut size={14} />
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-lime text-sm">
                Войти
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1a1f22] border-t border-white/5">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? "text-[#2eff8c] bg-[#2eff8c]/10"
                    : "text-[#c8cdd1] hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/5">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <Link
                    to={user.role === "admin" ? "/admin" : "/profile"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#2eff8c] bg-[#2eff8c]/10"
                  >
                    {user.avatar ? (
                      <img
                        src={`/avatars/${user.avatar}.svg`}
                        alt=""
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <User size={18} />
                    )}
                    {user.name || "Кабинет"}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-[#798389] hover:text-white transition-colors flex items-center gap-3"
                  >
                    <LogOut size={18} />
                    Выйти
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-lime block text-center"
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
