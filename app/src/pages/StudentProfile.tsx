import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StudentLabsSection from "@/components/StudentLabsSection";
import StudentProblemsSection from "@/components/StudentProblemsSection";
import StudentNotebooksSection from "@/components/StudentNotebooksSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Beaker,
  FileText,
  NotebookPen,
  Home,
  BookOpen,
  Award,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  ExternalLink,
  Trophy,
  Loader2,
  MessageSquare,
} from "lucide-react";

const AVATARS = [
  { id: "avatar-1", src: "/avatars/avatar-1.svg", name: "Атом" },
  { id: "avatar-2", src: "/avatars/avatar-2.svg", name: "Волна" },
  { id: "avatar-3", src: "/avatars/avatar-3.svg", name: "Призма" },
  { id: "avatar-4", src: "/avatars/avatar-4.svg", name: "Орбита" },
  { id: "avatar-5", src: "/avatars/avatar-5.svg", name: "Магнит" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  not_started: {
    label: "Не начато",
    color: "bg-[#434e54] text-[#c8cdd1]",
    icon: <Circle size={14} />,
  },
  in_progress: {
    label: "Изучается",
    color: "bg-[#01acff]/20 text-[#01acff]",
    icon: <Clock size={14} />,
  },
  completed: {
    label: "Завершено",
    color: "bg-[#2eff8c]/20 text-[#2eff8c]",
    icon: <CheckCircle2 size={14} />,
  },
};

type TabDef = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badgeType: "lab" | "problem" | "jupyter_notebook" | null;
};

const TABS: TabDef[] = [
  { id: "main", label: "Главная", icon: Home, badgeType: null },
  { id: "tasks", label: "Мои Задачи", icon: FileText, badgeType: "problem" },
  { id: "labs", label: "Мои Лабораторные", icon: Beaker, badgeType: "lab" },
  {
    id: "notebooks",
    label: "Мои Тетради",
    icon: NotebookPen,
    badgeType: "jupyter_notebook",
  },
];

const GRADE_CONFIG: Record<
  number,
  {
    label: string;
    textColor: string;
    trophyColor: string;
  }
> = {
  5: {
    label: "Отлично",
    textColor: "text-emerald-400",
    trophyColor: "#ffd700",
  },
  4: {
    label: "Хорошо",
    textColor: "text-sky-400",
    trophyColor: "#c0c0c0",
  },
  3: {
    label: "Удовлетворительно",
    textColor: "text-amber-400",
    trophyColor: "#cd7f32",
  },
  2: {
    label: "Неудовлетворительно",
    textColor: "text-rose-400",
    trophyColor: "#94a3b8",
  },
  1: {
    label: "Плохо",
    textColor: "text-red-400",
    trophyColor: "#64748b",
  },
};

export default function StudentProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } =
    trpc.student.getProfile.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "student",
    });

  const { data: learningPath, isLoading: pathLoading } =
    trpc.student.getLearningPath.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "student",
    });

  const { data: currentTopics, isLoading: currentLoading } =
    trpc.student.getCurrentTopics.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "student",
    });

  const { data: recentCompleted, isLoading: recentLoading } =
    trpc.student.getRecentCompletedAssignments.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "student",
    });

  const { data: badgeCounts, isLoading: badgesLoading } =
    trpc.student.getUnreadNotificationCounts.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "student",
    });

  const utils = trpc.useUtils();

  const updateAvatar = trpc.student.updateAvatar.useMutation({
    onSuccess: () => {
      utils.student.getProfile.invalidate();
      utils.unifiedAuth.me.invalidate();
    },
  });

  const markReadByType = trpc.student.markNotificationsReadByType.useMutation({
    onSuccess: () => {
      utils.student.getUnreadNotificationCounts.invalidate();
      utils.student.getNotifications.invalidate();
      utils.student.getUnreadNotificationCount.invalidate();
    },
  });

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("main");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const tab = TABS.find(t => t.id === tabId);
    if (tab?.badgeType) {
      markReadByType.mutate({ type: tab.badgeType });
    }
  };

  const getBadgeCount = (badgeType: (typeof TABS)[number]["badgeType"]) => {
    if (!badgeType) return 0;
    if (badgesLoading || !badgeCounts) return 0;
    if (badgeType === "lab") return badgeCounts.lab;
    if (badgeType === "problem") return badgeCounts.problem;
    if (badgeType === "jupyter_notebook") return badgeCounts.notebook;
    return 0;
  };

  if (authLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#262e33]">
        <Loader2 size={48} className="text-[#2eff8c] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "student") {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-[#262e33]">
        <Loader2 size={48} className="text-[#2eff8c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Header / Student Info */}
        <section className="mb-8">
          <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 lg:p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <Dialog
                open={avatarDialogOpen}
                onOpenChange={setAvatarDialogOpen}
              >
                <DialogTrigger asChild>
                  <button className="relative group shrink-0">
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-2 border-[#434e54] group-hover:border-[#2eff8c] transition-colors bg-[#1a1f22]">
                      {user.avatar ? (
                        <img
                          src={`/avatars/${user.avatar}.svg`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={40} className="text-[#798389]" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      <span className="text-xs text-white font-medium">
                        Изменить
                      </span>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#1e2529] border-[#37474f] text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle>Выберите аватар</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar.id}
                        onClick={() => {
                          updateAvatar.mutate({ avatar: avatar.id });
                          setAvatarDialogOpen(false);
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          user.avatar === avatar.id
                            ? "border-[#2eff8c] bg-[#2eff8c]/10"
                            : "border-[#37474f] hover:border-[#2eff8c]/50"
                        }`}
                      >
                        <img
                          src={avatar.src}
                          alt={avatar.name}
                          className="w-14 h-14 rounded-full"
                        />
                        <span className="text-xs text-[#c8cdd1]">
                          {avatar.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">
                      {user.name}
                    </h1>
                    <p className="text-sm text-[#798389] mt-1">
                      Ученик · Логин: {user.login}
                    </p>
                  </div>
                </div>

                {profileLoading ? (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-[#37474f]" />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#1e2529] rounded-xl p-3 border border-[#37474f]">
                      <div className="text-xs text-[#798389] mb-1">
                        Общий прогресс
                      </div>
                      <div className="text-xl font-bold text-[#2eff8c]">
                        {profile?.overallProgress ?? 0}%
                      </div>
                    </div>
                    <div className="bg-[#1e2529] rounded-xl p-3 border border-[#37474f]">
                      <div className="text-xs text-[#798389] mb-1">
                        Завершено тем
                      </div>
                      <div className="text-xl font-bold text-[#01acff]">
                        {profile?.completedSubtopics ?? 0}
                      </div>
                    </div>
                    <div className="bg-[#1e2529] rounded-xl p-3 border border-[#37474f]">
                      <div className="text-xs text-[#798389] mb-1">
                        В процессе
                      </div>
                      <div className="text-xl font-bold text-[#ffcb3d]">
                        {profile?.inProgressSubtopics ?? 0}
                      </div>
                    </div>
                    <div className="bg-[#1e2529] rounded-xl p-3 border border-[#37474f]">
                      <div className="text-xs text-[#798389] mb-1">
                        Дата начала
                      </div>
                      <div className="text-sm font-bold text-[#c8cdd1]">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              "ru-RU"
                            )
                          : "—"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar tabs */}
          <aside className="lg:w-64 shrink-0">
            <nav className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-2">
              <div className="flex lg:flex-col gap-1">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const count = getBadgeCount(tab.badgeType);
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`relative flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-[#1e2529] text-[#2eff8c] border border-[#37474f]"
                          : "text-[#c8cdd1] hover:bg-[#1e2529]/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </div>
                      {count > 0 && (
                        <span className="shrink-0 h-5 min-w-[1.25rem] px-1.5 bg-[#ff6b6b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Tab content */}
          <main className="flex-1 min-w-0">
            {activeTab === "main" && (
              <div className="space-y-8">
                {/* Current Topics */}
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-[#01acff]" />
                    Сейчас изучаем
                  </h2>
                  {currentLoading ? (
                    <Skeleton className="h-48 bg-[#37474f]" />
                  ) : currentTopics && currentTopics.length > 0 ? (
                    <div className="space-y-4">
                      {currentTopics.map((currentTopic, index) => (
                        <Card
                          key={
                            currentTopic.subtopic?.id ??
                            `current-topic-${index}`
                          }
                          className="bg-[#2a3237] border-[#434e54] overflow-hidden"
                        >
                          <CardContent className="p-0">
                            <div className="p-6">
                              <div className="flex flex-col md:flex-row md:items-start gap-4">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                  style={{
                                    backgroundColor: `${currentTopic.topic?.color ?? "#2eff8c"}20`,
                                  }}
                                >
                                  <GraduationCap
                                    size={24}
                                    style={{
                                      color:
                                        currentTopic.topic?.color ?? "#2eff8c",
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className="bg-[#01acff]/20 text-[#01acff]">
                                      {currentTopic.topic?.title}
                                    </Badge>
                                    {currentTopic.enrollmentComment && (
                                      <span className="text-xs text-[#798389]">
                                        {currentTopic.enrollmentComment}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-xl font-bold mt-2 text-white">
                                    {currentTopic.subtopic?.title}
                                  </h3>
                                  <p className="text-sm text-[#798389] mt-1">
                                    {currentTopic.subtopic?.content ??
                                      "Нет описания"}
                                  </p>

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {currentTopic.labs &&
                                      currentTopic.labs.length > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e2529] rounded-lg border border-[#37474f]">
                                          <Beaker
                                            size={14}
                                            className="text-[#2eff8c]"
                                          />
                                          <span className="text-xs text-[#c8cdd1]">
                                            {currentTopic.labs.length} лаб.
                                          </span>
                                        </div>
                                      )}
                                    <Link
                                      to={`/course?topic=${encodeURIComponent(currentTopic.topic?.title ?? "")}&node=${encodeURIComponent(currentTopic.subtopic?.title ?? "")}`}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2eff8c]/10 text-[#2eff8c] rounded-lg border border-[#2eff8c]/30 text-xs hover:bg-[#2eff8c]/20 transition-colors"
                                    >
                                      <BookOpen size={14} />
                                      Перейти к теории
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-8 text-center">
                      <BookOpen
                        size={32}
                        className="text-[#798389] mx-auto mb-3"
                      />
                      <p className="text-[#c8cdd1]">
                        У вас пока нет активной темы. Обратитесь к
                        преподавателю.
                      </p>
                    </div>
                  )}
                </section>

                {/* Learning Path */}
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award size={18} className="text-[#ffcb3d]" />
                    Мой учебный путь
                  </h2>
                  {pathLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 bg-[#37474f]" />
                      ))}
                    </div>
                  ) : learningPath?.topics && learningPath.topics.length > 0 ? (
                    <div className="space-y-3">
                      {learningPath.topics.map(topic => (
                        <Card
                          key={topic.topicNodeId}
                          className="bg-[#2a3237] border-[#434e54] overflow-hidden"
                        >
                          <CardContent className="p-0">
                            <button
                              className="w-full p-4 flex items-center justify-between text-left"
                              onClick={() =>
                                setExpandedTopic(
                                  expandedTopic === topic.topicNodeId
                                    ? null
                                    : topic.topicNodeId
                                )
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      topic.topicColor ?? "#2eff8c",
                                  }}
                                />
                                <div>
                                  <h3 className="font-semibold text-sm sm:text-base text-white">
                                    {topic.topicTitle}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-[#798389]">
                                    <span>
                                      {
                                        topic.subtopics.filter(
                                          s => s.status === "completed"
                                        ).length
                                      }{" "}
                                      / {topic.subtopics.length} завершено
                                    </span>
                                    {topic.comment && (
                                      <span className="truncate max-w-[200px]">
                                        {topic.comment}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="hidden sm:block w-24">
                                  <div className="h-2 bg-[#37474f] rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${
                                          topic.subtopics.length > 0
                                            ? Math.round(
                                                (topic.subtopics.filter(
                                                  s => s.status === "completed"
                                                ).length /
                                                  topic.subtopics.length) *
                                                  100
                                              )
                                            : 0
                                        }%`,
                                        backgroundColor:
                                          topic.topicColor ?? "#2eff8c",
                                      }}
                                    />
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    STATUS_CONFIG[topic.enrollmentStatus]?.color
                                  }
                                >
                                  {STATUS_CONFIG[topic.enrollmentStatus]
                                    ?.label ?? topic.enrollmentStatus}
                                </Badge>
                                {expandedTopic === topic.topicNodeId ? (
                                  <ChevronUp
                                    size={16}
                                    className="text-[#798389]"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={16}
                                    className="text-[#798389]"
                                  />
                                )}
                              </div>
                            </button>

                            {expandedTopic === topic.topicNodeId && (
                              <div className="px-4 pb-4">
                                <div className="border-t border-[#37474f] pt-3 space-y-2">
                                  {topic.subtopics.map((sub, idx) => {
                                    const status = STATUS_CONFIG[sub.status];
                                    return (
                                      <div
                                        key={sub.id}
                                        className="flex items-center gap-3 py-2 px-3 bg-[#1e2529] rounded-lg"
                                      >
                                        <div className="text-xs text-[#798389] w-6 shrink-0">
                                          {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium truncate text-[#c8cdd1]">
                                              {sub.title}
                                            </span>
                                            {sub.isCurrent && (
                                              <Badge className="bg-[#01acff]/20 text-[#01acff] text-[10px] px-1.5 py-0">
                                                Текущая
                                              </Badge>
                                            )}
                                            <Badge
                                              className={`${status.color} text-[10px] px-1.5 py-0`}
                                            >
                                              {status.icon}
                                              <span className="ml-1">
                                                {status.label}
                                              </span>
                                            </Badge>
                                          </div>
                                          {sub.comment && (
                                            <SubtopicComment
                                              text={sub.comment}
                                            />
                                          )}
                                          {sub.jupyterUrl && (
                                            <a
                                              href={sub.jupyterUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 mt-1.5 text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-2 py-1 rounded-md hover:bg-[#2eff8c]/20 transition-colors"
                                            >
                                              <ExternalLink size={12} />
                                              Jupyter- {sub.title}
                                            </a>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          {sub.theoryCompleted && (
                                            <BookOpen
                                              size={12}
                                              className="text-[#2eff8c]"
                                            />
                                          )}
                                          {sub.practiceCompleted && (
                                            <FileText
                                              size={12}
                                              className="text-[#01acff]"
                                            />
                                          )}
                                          {sub.labCompleted && (
                                            <Beaker
                                              size={12}
                                              className="text-[#ffcb3d]"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Labs for this topic */}
                                  {topic.labs && topic.labs.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      <p className="text-xs text-[#798389] px-1 mb-1">
                                        Лабораторные работы
                                      </p>
                                      {topic.labs.map(lab => (
                                        <div
                                          key={lab.id}
                                          className="flex items-center gap-3 py-2 px-3 bg-[#1e2529] rounded-lg border border-[#37474f]/50"
                                        >
                                          <Beaker
                                            size={14}
                                            className="text-[#2eff8c] shrink-0"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <span className="text-sm truncate text-[#c8cdd1]">
                                              {lab.title}
                                            </span>
                                            <p className="text-xs text-[#798389]">
                                              {lab.shortDesc}
                                            </p>
                                          </div>
                                          <Link
                                            to={`/labs/${lab.slug}`}
                                            className="text-xs text-[#01acff] hover:underline shrink-0"
                                          >
                                            Перейти
                                          </Link>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-8 text-center">
                      <Award
                        size={32}
                        className="text-[#798389] mx-auto mb-3"
                      />
                      <p className="text-[#c8cdd1]">
                        У вас пока нет открытых тем. Обратитесь к преподавателю.
                      </p>
                    </div>
                  )}
                </section>

                {/* Recent Completed Assignments */}
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <CheckCircle2 size={18} className="text-[#2eff8c]" />
                    Последние выполненные задания
                  </h2>
                  {recentLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 bg-[#37474f]" />
                      ))}
                    </div>
                  ) : recentCompleted && recentCompleted.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recentCompleted.map((item, idx) => (
                        <RecentAssignmentCard
                          key={`${item.type}-${item.id}`}
                          item={item}
                          number={idx + 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-8 text-center">
                      <Clock
                        size={32}
                        className="text-[#798389] mx-auto mb-3"
                      />
                      <p className="text-[#c8cdd1]">
                        Пока нет выполненных заданий.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "labs" && <StudentLabsSection />}

            {activeTab === "tasks" && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <FileText size={18} className="text-[#01acff]" />
                  Мои задачи
                </h2>
                <StudentProblemsSection />
              </section>
            )}

            {activeTab === "notebooks" && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <NotebookPen size={18} className="text-[#2eff8c]" />
                  Мои тетради
                </h2>
                <StudentNotebooksSection />
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function RecentAssignmentCard({
  item,
  number,
}: {
  item: {
    id: number;
    type: "lab" | "problem";
    title: string;
    slug: string;
    completedAt: Date;
    grade: number | null;
  };
  number: number;
}) {
  const grade = item.grade ?? undefined;
  const gradeConfig = grade ? GRADE_CONFIG[grade] : null;
  const glowColor = gradeConfig?.trophyColor ?? "#2eff8c";

  return (
    <div
      className="relative flex items-center gap-2 px-3 py-2 bg-[#232b2f] rounded-lg border border-[#37474f] lab-glow transition-colors"
      style={{ "--glow-color": glowColor } as React.CSSProperties}
    >
      <style>{`
        @keyframes labGlow {
          0%, 100% {
            box-shadow: 0 0 3px var(--glow-color), 0 0 6px var(--glow-color);
          }
          50% {
            box-shadow: 0 0 8px var(--glow-color), 0 0 14px var(--glow-color);
          }
        }
        .lab-glow {
          animation: labGlow 2.2s ease-in-out infinite;
        }
      `}</style>
      <span className="text-[10px] font-medium text-[#798389] w-4 shrink-0">
        {number}.
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-[#c8cdd1] hover:text-white truncate block">
          {item.title}
        </span>
        {item.completedAt && (
          <p className="text-[10px] text-[#798389]">
            {new Date(item.completedAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </div>
      {gradeConfig && (
        <div className="shrink-0 flex flex-col items-center">
          <Trophy
            size={16}
            style={{ color: gradeConfig.trophyColor }}
            fill={gradeConfig.trophyColor}
            fillOpacity={0.15}
          />
          <span className={`text-[10px] font-bold ${gradeConfig.textColor}`}>
            {grade}
          </span>
        </div>
      )}
    </div>
  );
}

function SubtopicComment({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 100;
  const isLong = text.length > limit;
  const preview =
    isLong && !expanded ? text.slice(0, limit).trimEnd() + "…" : text;

  return (
    <div className="mt-2 bg-[#2eff8c]/10 border border-[#2eff8c]/30 rounded-lg px-3 py-2">
      <div className="flex items-start gap-2">
        <MessageSquare size={14} className="text-[#2eff8c] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#c8cdd1] leading-relaxed">{preview}</p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[#2eff8c] hover:underline mt-1"
            >
              {expanded ? "Свернуть" : "Развернуть"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
