import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Layers,
  Star,
  StarHalf,
  AlertCircle,
} from "lucide-react";

const levelConfig = {
  basic: { label: "Базовый", color: "#2eff8c", icon: Star },
  intermediate: { label: "Средний", color: "#ffcb3d", icon: StarHalf },
  advanced: { label: "Продвинутый", color: "#ff6b6b", icon: AlertCircle },
};

const kinematicsSubtopics = [
  { id: 1, title: "Равномерное прямолинейное движение", types: [1, 2] },
  { id: 2, title: "Равноускоренное движение", types: [3, 4] },
  { id: 3, title: "Движение по окружности", types: [5, 6] },
  { id: 4, title: "Относительность движения", types: [7, 8] },
];

export default function AdminProblems() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null);
  const [openSubtopic, setOpenSubtopic] = useState<number | null>(1);

  const isAdmin = user?.role === "admin";
  const isLoggedIn = !!user;

  const { data: types, isLoading: typesLoading } = trpc.problems.listTypes.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  useEffect(() => {
    if (types && types.length > 0 && !selectedType) {
      queueMicrotask(() => setSelectedType(types[0].id));
    }
  }, [types, selectedType]);

  const { data: problemList, isLoading: problemsLoading } = trpc.problems.listByType.useQuery(
    { typeId: selectedType ?? 1 },
    { enabled: !!selectedType && isAdmin }
  );

  const filteredProblems = problemList
    ? selectedLevel
      ? problemList.filter((p) => p.level === selectedLevel)
      : problemList
    : [];

  const grouped = {
    basic: filteredProblems.filter((p) => p.level === "basic"),
    intermediate: filteredProblems.filter((p) => p.level === "intermediate"),
    advanced: filteredProblems.filter((p) => p.level === "advanced"),
  };

  // ---------- RENDER: Access Denied ----------
  if (!isAdmin) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#262e33]">
        <div className="text-center max-w-md mx-auto px-6">
          <Lock size={48} className="text-[#ff6b6b] mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">
            {!isLoggedIn ? "Требуется авторизация" : "Доступ ограничен"}
          </h2>
          <p className="text-[#c8cdd1] mb-2">
            {!isLoggedIn
              ? "Войдите в систему, чтобы получить доступ к задачам."
              : "Этот раздел доступен только преподавателю."}
          </p>
          {isLoggedIn && user && (
            <p className="text-xs text-[#798389] mb-6">
              Ваша текущая роль: <span className="text-[#ffcb3d] font-mono">{user.role}</span>
            </p>
          )}
          <div className="flex flex-col gap-3">
            {!isLoggedIn ? (
              <Link to="/login" className="btn-lime inline-flex items-center justify-center gap-2">
                Войти
              </Link>
            ) : (
              <Link to="/" className="text-sm text-[#798389] hover:text-white transition-colors">
                На главную
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- RENDER: Admin Content ----------
  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      {/* Header */}
      <section className="bg-[#1a1f22] py-8 border-b border-[#434e54]">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/course"
            className="inline-flex items-center gap-2 text-[#798389] hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Назад к курсу
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ffcb3d]/20 flex items-center justify-center">
              <GraduationCap size={24} className="text-[#ffcb3d]" />
            </div>
            <div>
              <p className="formula-text text-xs mb-1">Раздел преподавателя</p>
              <h1 className="text-2xl lg:text-3xl font-bold">
                Задачи по кинематике
              </h1>
            </div>
            <span className="ml-auto text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-3 py-1.5 rounded-full border border-[#2eff8c]/20">
              Администратор
            </span>
          </div>
          <p className="text-[#798389] mt-2 max-w-xl">
            Банк задач с полными решениями. Доступен только преподавателю.
            Источники: Рымкевич, Кирик и др.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-[#798389] flex items-center gap-2">
              <Layers size={16} />
              Темы кинематики
            </h3>

            {typesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-[#2a3237] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {kinematicsSubtopics.map((sub) => (
                  <div key={sub.id}>
                    <button
                      onClick={() =>
                        setOpenSubtopic(openSubtopic === sub.id ? null : sub.id)
                      }
                      className="w-full flex items-center gap-2 p-3 rounded-lg bg-[#2a3237] border border-[#434e54] hover:border-[#2eff8c]/30 transition-colors text-left"
                    >
                      {openSubtopic === sub.id ? (
                        <ChevronDown size={14} className="text-[#2eff8c] shrink-0" />
                      ) : (
                        <ChevronRight size={14} className="text-[#798389] shrink-0" />
                      )}
                      <span className="text-sm font-medium">{sub.title}</span>
                    </button>

                    {openSubtopic === sub.id && (
                      <div className="mt-1 ml-4 space-y-1">
                        {types
                          ?.filter((t) => sub.types.includes(t.id))
                          .map((type) => (
                            <button
                              key={type.id}
                              onClick={() => {
                                setSelectedType(type.id);
                                setSelectedLevel(null);
                                setExpandedProblem(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                selectedType === type.id
                                  ? "bg-[#2eff8c]/10 text-[#2eff8c] border border-[#2eff8c]/30"
                                  : "text-[#c8cdd1] hover:bg-white/5"
                              }`}
                            >
                              <div className="font-medium">{type.title}</div>
                              {type.description && (
                                <div className="text-xs text-[#798389] mt-0.5">
                                  {type.description}
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {types && (
              <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-4 mt-6">
                <h4 className="text-xs uppercase tracking-wider text-[#798389] mb-3">
                  Статистика
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#798389]">Всего типов:</span>
                    <span className="font-mono-phys text-[#2eff8c]">{types.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#798389]">Всего задач:</span>
                    <span className="font-mono-phys text-[#2eff8c]">
                      {problemList?.length ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#798389]">Базовых:</span>
                    <span className="font-mono-phys text-[#2eff8c]">
                      {grouped.basic.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#798389]">Средних:</span>
                    <span className="font-mono-phys text-[#ffcb3d]">
                      {grouped.intermediate.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#798389]">Сложных:</span>
                    <span className="font-mono-phys text-[#ff6b6b]">
                      {grouped.advanced.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right content */}
          <div className="lg:col-span-3">
            {problemsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-[#2a3237] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div>
                {/* Type header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold">
                    {types?.find((t) => t.id === selectedType)?.title}
                  </h2>
                  <p className="text-sm text-[#798389] mt-1">
                    {types?.find((t) => t.id === selectedType)?.description}
                  </p>
                </div>

                {/* Level filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {[
                    { key: null, label: "Все уровни" },
                    { key: "basic", label: "Базовый" },
                    { key: "intermediate", label: "Средний" },
                    { key: "advanced", label: "Сложный" },
                  ].map((lvl) => (
                    <button
                      key={lvl.label}
                      onClick={() => setSelectedLevel(lvl.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedLevel === lvl.key
                          ? "bg-[#2eff8c] text-black"
                          : "bg-[#2a3237] border border-[#434e54] text-[#c8cdd1] hover:border-[#2eff8c]/50"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                {/* Problems grouped by level */}
                <div className="space-y-6">
                  {(["basic", "intermediate", "advanced"] as const).map(
                    (level) => {
                      const levelProblems = grouped[level];
                      if (levelProblems.length === 0) return null;

                      const config = levelConfig[level];
                      const Icon = config.icon;

                      return (
                        <div key={level}>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon size={16} style={{ color: config.color }} />
                            <h3 className="font-semibold" style={{ color: config.color }}>
                              {config.label} уровень ({levelProblems.length})
                            </h3>
                          </div>

                          <div className="space-y-3">
                            {levelProblems.map((problem) => {
                              const isOpen = expandedProblem === problem.id;
                              return (
                                <div
                                  key={problem.id}
                                  className="bg-[#2a3237] border border-[#434e54] rounded-xl overflow-hidden transition-all hover:border-[#434e54]"
                                >
                                  {/* Problem header */}
                                  <button
                                    onClick={() =>
                                      setExpandedProblem(
                                        isOpen ? null : problem.id
                                      )
                                    }
                                    className="w-full flex items-start gap-4 p-5 text-left"
                                  >
                                    <span
                                      className="font-mono-phys text-sm font-bold shrink-0 mt-0.5"
                                      style={{ color: config.color }}
                                    >
                                      {problem.order}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        {problem.source && (
                                          <span className="text-xs bg-[#262e33] text-[#798389] px-2 py-0.5 rounded-full">
                                            {problem.source}
                                          </span>
                                        )}
                                        <span
                                          className="text-xs px-2 py-0.5 rounded-full"
                                          style={{
                                            backgroundColor: `${config.color}15`,
                                            color: config.color,
                                          }}
                                        >
                                          {config.label}
                                        </span>
                                      </div>
                                      <p className="text-[#c8cdd1]">
                                        {problem.condition}
                                      </p>
                                    </div>
                                    {isOpen ? (
                                      <ChevronDown
                                        size={18}
                                        className="text-[#2eff8c] shrink-0 mt-1"
                                      />
                                    ) : (
                                      <ChevronRight
                                        size={18}
                                        className="text-[#798389] shrink-0 mt-1"
                                      />
                                    )}
                                  </button>

                                  {/* Expanded solution */}
                                  {isOpen && (
                                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                                      {/* Given / Find */}
                                      <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                        {problem.given && (
                                          <div className="bg-[#262e33] rounded-lg p-3">
                                            <p className="text-xs text-[#798389] uppercase tracking-wider mb-1">
                                              Дано
                                            </p>
                                            <p className="text-sm font-mono-phys text-[#c8cdd1]">
                                              {problem.given}
                                            </p>
                                          </div>
                                        )}
                                        {problem.find && (
                                          <div className="bg-[#262e33] rounded-lg p-3">
                                            <p className="text-xs text-[#798389] uppercase tracking-wider mb-1">
                                              Найти
                                            </p>
                                            <p className="text-sm font-mono-phys text-[#2eff8c]">
                                              {problem.find}
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Solution */}
                                      <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Lightbulb
                                            size={14}
                                            className="text-[#ffcb3d]"
                                          />
                                          <span className="text-xs uppercase tracking-wider text-[#798389]">
                                            Решение
                                          </span>
                                        </div>
                                        <div className="bg-[#1a1f22] rounded-lg p-4 whitespace-pre-line text-sm text-[#c8cdd1] leading-relaxed font-mono-phys">
                                          {problem.solution}
                                        </div>
                                      </div>

                                      {/* Answer */}
                                      <div className="bg-[#2eff8c]/5 border border-[#2eff8c]/20 rounded-lg p-3">
                                        <span className="text-xs text-[#2eff8c] uppercase tracking-wider">
                                          Ответ:{" "}
                                        </span>
                                        <span className="text-sm font-mono-phys text-[#2eff8c] font-bold">
                                          {problem.answer}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {filteredProblems.length === 0 && !problemsLoading && (
                  <div className="text-center py-16 text-[#798389]">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Нет задач выбранного уровня</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
