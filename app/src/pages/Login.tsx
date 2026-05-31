import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginMutation = trpc.unifiedAuth.login.useMutation({
    onSuccess: () => {
      navigate("/profile");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!login.trim() || !password.trim()) {
      setError("Введите логин и пароль");
      return;
    }
    loginMutation.mutate({ login: login.trim(), password, type: "student" });
  }

  return (
    <div className="min-h-screen bg-[#262e33] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#798389] hover:text-[#2eff8c] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          На главную
        </Link>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#ffcb3d]/10 flex items-center justify-center">
              <Shield size={24} className="text-[#ffcb3d]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Вход в систему</h1>
              <p className="text-sm text-[#798389]">
                Введите логин и пароль
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#798389] mb-1.5">Логин</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full bg-[#262e33] border border-[#434e54] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#2eff8c] outline-none"
                placeholder="your_login"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#798389] mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#262e33] border border-[#434e54] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#2eff8c] outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-lime flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Shield size={18} />
              )}
              {loginMutation.isPending ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
