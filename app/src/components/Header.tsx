import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  Menu,
  X,
  FlaskConical,
  BookOpen,
  Library,
  User,
  LogOut,
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/course", label: "Курс", icon: BookOpen },
    { to: "/labs", label: "Лабораторные", icon: FlaskConical },
    { to: "/resources", label: "Ресурсы", icon: Library },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-mono-phys text-lg font-bold text-white tracking-tight">Квант</span>
              <span className="text-[10px] font-mono-phys text-[#2eff8c] uppercase tracking-widest">physics</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) ? "text-[#2eff8c] bg-[#2eff8c]/10" : "text-[#c8cdd1] hover:text-white hover:bg-white/5"
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive("/profile") || isActive("/student/profile") ? "text-[#2eff8c] bg-[#2eff8c]/10" : "text-[#c8cdd1] hover:text-white"
                  }`}>
                  {user.avatar ? (
                    <img src={`/avatars/${user.avatar}.svg`} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <User size={16} />
                  )}
                  <span className="max-w-[100px] truncate">{user.name || "Кабинет"}</span>
                </Link>
                <button onClick={logout} className="text-xs text-[#798389] hover:text-white transition-colors flex items-center gap-1">
                  <LogOut size={14} />
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-lime text-sm">Войти</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1a1f22] border-t border-white/5">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to) ? "text-[#2eff8c] bg-[#2eff8c]/10" : "text-[#c8cdd1] hover:text-white hover:bg-white/5"
                }`}>
                <link.icon size={18} />{link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/5">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#2eff8c] bg-[#2eff8c]/10">
                    {user.avatar ? (
                      <img src={`/avatars/${user.avatar}.svg`} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <User size={18} />
                    )}
                    {user.name || "Кабинет"}
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-[#798389] hover:text-white transition-colors flex items-center gap-3">
                    <LogOut size={18} />Выйти
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-lime block text-center">Войти</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
