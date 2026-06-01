import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  Shield,
  Users,
  BookOpen,
  FlaskConical,
  ClipboardList,
  Lock,
  LogOut,
  ArrowLeft,
  User,
  Activity,
  Library,
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const { data: stats, isLoading: statsLoading } = trpc.admin.dashboardStats.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#262e33]">
        <div className="text-center max-w-md mx-auto px-6">
          <Lock size={48} className="text-[#ff6b6b] mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Требуется авторизация</h2>
          <p className="text-[#c8cdd1] mb-6">Войдите в систему, чтобы получить доступ к кабинету.</p>
          <Link to="/login" className="btn-lime inline-flex items-center gap-2">Войти</Link>
        </div>
      </div>
    );
  }

  // ── ADMIN VIEW ──
  if (isAdmin) {
    return (
      <div className="pt-16 min-h-screen bg-[#262e33]">
        {/* Header */}
        <section className="bg-[#1a1f22] py-6 border-b border-[#434e54]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#ffcb3d]/20 flex items-center justify-center">
                <Shield size={20} className="text-[#ffcb3d]" />
              </div>
              <div>
                <p className="formula-text text-xs mb-0.5">Администрирование</p>
                <h1 className="text-xl font-bold">Кабинет администратора — {user.name}</h1>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Users size={20} className="text-[#2eff8c]" />
                <span className="text-sm text-[#798389]">Учеников</span>
              </div>
              <div className="text-3xl font-bold text-[#2eff8c]">
                {statsLoading ? "—" : stats?.students.total ?? 0}
              </div>
            </div>
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen size={20} className="text-[#ffcb3d]" />
                <span className="text-sm text-[#798389]">Тем курса</span>
              </div>
              <div className="text-3xl font-bold text-[#ffcb3d]">
                {statsLoading ? "—" : stats?.content?.topics ?? 0}
              </div>
            </div>
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FlaskConical size={20} className="text-[#01acff]" />
                <span className="text-sm text-[#798389]">Вирт. лабораторных</span>
              </div>
              <div className="text-3xl font-bold text-[#01acff]">
                {statsLoading ? "—" : stats?.content?.labWorks ?? 0}
              </div>
            </div>
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Library size={20} className="text-[#ff6b6b]" />
                <span className="text-sm text-[#798389]">Ресурсов</span>
              </div>
              <div className="text-3xl font-bold text-[#ff6b6b]">
                {statsLoading ? "—" : stats?.content?.resources ?? 0}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#2eff8c]" />
            Быстрые действия
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/admin" className="flex items-center gap-3 p-4 bg-[#2a3237] border border-[#434e54] rounded-xl hover:bg-[#2eff8c]/10 transition-colors">
              <Shield size={20} className="text-[#2eff8c]" />
              <div>
                <div className="font-medium text-sm">Панель управления</div>
                <div className="text-xs text-[#798389]">Обзор и статистика</div>
              </div>
            </Link>
            <Link to="/admin/students" className="flex items-center gap-3 p-4 bg-[#2a3237] border border-[#434e54] rounded-xl hover:bg-[#01acff]/10 transition-colors">
              <Users size={20} className="text-[#01acff]" />
              <div>
                <div className="font-medium text-sm">Ученики</div>
                <div className="text-xs text-[#798389]">Управление учениками</div>
              </div>
            </Link>
            <Link to="/admin/topics" className="flex items-center gap-3 p-4 bg-[#2a3237] border border-[#434e54] rounded-xl hover:bg-[#ffcb3d]/10 transition-colors">
              <BookOpen size={20} className="text-[#ffcb3d]" />
              <div>
                <div className="font-medium text-sm">Темы курса</div>
                <div className="text-xs text-[#798389]">Редактирование курса</div>
              </div>
            </Link>
            <Link to="/admin/virtual-labs" className="flex items-center gap-3 p-4 bg-[#2a3237] border border-[#434e54] rounded-xl hover:bg-[#a78bfa]/10 transition-colors">
              <FlaskConical size={20} className="text-[#a78bfa]" />
              <div>
                <div className="font-medium text-sm">Вирт. лабораторные</div>
                <div className="text-xs text-[#798389]">Управление лабораторными</div>
              </div>
            </Link>
            <Link to="/admin/resources" className="flex items-center gap-3 p-4 bg-[#2a3237] border border-[#434e54] rounded-xl hover:bg-[#ff6b6b]/10 transition-colors">
              <Library size={20} className="text-[#ff6b6b]" />
              <div>
                <div className="font-medium text-sm">Ресурсы</div>
                <div className="text-xs text-[#798389]">Управление материалами</div>
              </div>
            </Link>
            <Link to="/admin/audit" className="flex items-center gap-3 p-4 bg-[#2a3237] border border-[#434e54] rounded-xl hover:bg-[#c8cdd1]/10 transition-colors">
              <ClipboardList size={20} className="text-[#c8cdd1]" />
              <div>
                <div className="font-medium text-sm">Журнал аудита</div>
                <div className="text-xs text-[#798389]">История действий</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── REGULAR USER VIEW ──
  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      <section className="bg-[#262e33] border-b border-white/5 py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#798389] hover:text-[#2eff8c] transition-colors mb-6">
            <ArrowLeft size={16} />На главную
          </Link>

          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2eff8c]/20 to-[#01acff]/20 flex items-center justify-center shrink-0">
                <User size={36} className="text-[#2eff8c]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#798389]">
                  {user.login && (
                    <span className="flex items-center gap-1.5">
                      <User size={14} />{user.login}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Activity size={14} />
                    <span className="text-[#2eff8c]">Активен</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield size={14} />
                    <span className="capitalize">{user.role}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#01acff]/10 flex items-center justify-center">
                <Lock size={20} className="text-[#01acff]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Безопасность</h2>
                <p className="text-sm text-[#798389]">Управление сессией</p>
              </div>
            </div>
            <button onClick={logout} className="btn-lime text-sm flex items-center gap-2">
              <LogOut size={14} />Выйти из аккаунта
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
