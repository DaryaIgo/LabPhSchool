import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import StudentProfile from "./StudentProfile";
import { useEffect } from "react";
import {
  Shield,
  Lock,
  LogOut,
  ArrowLeft,
  User,
  Activity,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isAdmin, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Redirect admins to the single Admin Dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  // Redirect students to dedicated student profile
  if (!isLoading && isAuthenticated && user?.role === "student") {
    return <StudentProfile />;
  }

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#262e33]">
        <div className="text-center max-w-md mx-auto px-6">
          <Loader2 size={48} className="text-[#2eff8c] mx-auto mb-6 animate-spin" />
          <h2 className="text-2xl font-bold mb-3">Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#262e33]">
        <Loader2 size={48} className="text-[#2eff8c] animate-spin" />
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
