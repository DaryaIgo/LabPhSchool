import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Award,
  Activity,
  Loader2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Beaker,
  FileText,
  ExternalLink,
  NotebookPen,
  Download,
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

  const { data: activity, isLoading: activityLoading } =
    trpc.student.getActivity.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "student",
    });

  const { data: myNotebooks, isLoading: notebooksLoading } =
    trpc.student.getMyJupyterNotebooks.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "student",
    });

  const utils = trpc.useUtils();

  const updateAvatar = trpc.student.updateAvatar.useMutation({
    onSuccess: () => {
      utils.student.getProfile.invalidate();
      utils.unifiedAuth.me.invalidate();
    },
  });

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

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

  const isLoading =
    profileLoading || pathLoading || currentLoading || activityLoading;

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

                {isLoading ? (
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

        {/* Current Topics */}
        <section className="mb-8">
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
                  key={currentTopic.subtopic?.id ?? `current-topic-${index}`}
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
                              color: currentTopic.topic?.color ?? "#2eff8c",
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
                            {currentTopic.subtopic?.content ?? "Нет описания"}
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
                            {currentTopic.problemTypes &&
                              currentTopic.problemTypes.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e2529] rounded-lg border border-[#37474f]">
                                  <FileText
                                    size={14}
                                    className="text-[#ffcb3d]"
                                  />
                                  <span className="text-xs text-[#c8cdd1]">
                                    {currentTopic.problemTypes.length} задач
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
              <BookOpen size={32} className="text-[#798389] mx-auto mb-3" />
              <p className="text-[#c8cdd1]">
                У вас пока нет активной темы. Обратитесь к преподавателю.
              </p>
            </div>
          )}
        </section>

        {/* Learning Path */}
        <section className="mb-8">
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
                            backgroundColor: topic.topicColor ?? "#2eff8c",
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
                                backgroundColor: topic.topicColor ?? "#2eff8c",
                              }}
                            />
                          </div>
                        </div>
                        <Badge
                          className={
                            STATUS_CONFIG[topic.enrollmentStatus]?.color
                          }
                        >
                          {STATUS_CONFIG[topic.enrollmentStatus]?.label ??
                            topic.enrollmentStatus}
                        </Badge>
                        {expandedTopic === topic.topicNodeId ? (
                          <ChevronUp size={16} className="text-[#798389]" />
                        ) : (
                          <ChevronDown size={16} className="text-[#798389]" />
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
                                    <SubtopicComment text={sub.comment} />
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
              <Award size={32} className="text-[#798389] mx-auto mb-3" />
              <p className="text-[#c8cdd1]">
                У вас пока нет открытых тем. Обратитесь к преподавателю.
              </p>
            </div>
          )}
        </section>

        {/* Jupyter Notebooks */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <NotebookPen size={18} className="text-[#2eff8c]" />
            Мои Jupyter-ноутбуки
          </h2>
          {notebooksLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 bg-[#37474f]" />
              ))}
            </div>
          ) : myNotebooks && myNotebooks.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myNotebooks.map(nb => (
                <Card
                  key={nb.id}
                  className="bg-[#2a3237] border-[#434e54] hover:border-[#2eff8c]/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <NotebookPen
                        size={20}
                        className="text-[#2eff8c] shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[#c8cdd1] truncate">
                          {nb.title}
                        </h3>
                        <p className="text-xs text-[#798389] mt-1">
                          {nb.subtopicTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <a
                            href={`/api/jupyter/download/${nb.id}`}
                            className="inline-flex items-center gap-1 text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-3 py-1.5 rounded-md hover:bg-[#2eff8c]/20 transition-colors"
                          >
                            <Download size={12} />
                            Скачать
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 text-center">
              <NotebookPen size={28} className="text-[#798389] mx-auto mb-2" />
              <p className="text-sm text-[#c8cdd1]">
                У вас пока нет доступных Jupyter-ноутбуков.
              </p>
              <p className="text-xs text-[#798389] mt-1">
                Преподаватель откроет доступ к новым материалам.
              </p>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#ff6b6b]" />
            Последняя активность
          </h2>
          {activityLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 bg-[#37474f]" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ActivityCard
                icon={<BookOpen size={18} className="text-[#2eff8c]" />}
                label="Последняя открытая тема"
                value={
                  activity?.lastEnrollment
                    ? `Тема #${activity.lastEnrollment.topicNodeId}`
                    : "Нет данных"
                }
                date={activity?.lastEnrollment?.enrolledAt}
              />
              <ActivityCard
                icon={<CheckCircle2 size={18} className="text-[#01acff]" />}
                label="Последняя завершённая тема"
                value={
                  activity?.lastCompletedTopic
                    ? `Тема #${activity.lastCompletedTopic.topicNodeId}`
                    : "Нет данных"
                }
                date={activity?.lastCompletedTopic?.completedAt}
              />
              <ActivityCard
                icon={<FlaskConical size={18} className="text-[#ffcb3d]" />}
                label="Последняя лабораторная"
                value={
                  activity?.lastCompletedLab
                    ? `Лаб. #${activity.lastCompletedLab.labWorkId}`
                    : "Нет данных"
                }
                date={activity?.lastCompletedLab?.completedAt}
              />
              <ActivityCard
                icon={<Calendar size={18} className="text-[#ff6b6b]" />}
                label="Последний визит"
                value={
                  activity?.lastLoginAt
                    ? new Date(activity.lastLoginAt).toLocaleDateString("ru-RU")
                    : "Нет данных"
                }
                date={activity?.lastLoginAt}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ActivityCard({
  icon,
  label,
  value,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  date?: Date | string | null;
}) {
  return (
    <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs text-[#798389]">{label}</span>
      </div>
      <div className="text-sm font-semibold text-[#c8cdd1]">{value}</div>
      {date && (
        <div className="text-xs text-[#798389] mt-1">
          {new Date(date).toLocaleDateString("ru-RU")}
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
