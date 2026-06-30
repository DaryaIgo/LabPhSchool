import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronDown } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

function hasUnread(
  updatedAt: Date | string | null | undefined,
  readAt: Date | string | null | undefined
) {
  if (!updatedAt) return false;
  if (!readAt) return true;
  return new Date(updatedAt).getTime() > new Date(readAt).getTime();
}

export default function StudentMoon() {
  const { data } = trpc.student.getMoonComment.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: comments = [] } = trpc.student.getHomeworkComments.useQuery(
    undefined,
    {
      refetchInterval: 15000,
    }
  );
  const utils = trpc.useUtils();

  const [isOpen, setIsOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [attention, setAttention] = useState(false);

  const unreadMoon = hasUnread(
    data?.moonCommentUpdatedAt,
    data?.moonCommentReadAt
  );
  const unreadCommentsCount = comments.filter(c =>
    hasUnread(c.completedAt, data?.homeworkCommentsReadAt)
  ).length;
  const unread = unreadMoon || unreadCommentsCount > 0;

  const hasComment = Boolean(data?.moonComment?.trim());
  const isFirstLogin = !data?.moonCommentFirstOpenedAt;

  const markFirstOpened = trpc.student.markMoonCommentFirstOpened.useMutation({
    onSuccess: () => {
      utils.student.getMoonComment.invalidate();
    },
  });

  const markRead = trpc.student.markMoonCommentRead.useMutation({
    onSuccess: () => {
      utils.student.getMoonComment.invalidate();
    },
  });

  const markCommentsRead = trpc.student.markHomeworkCommentsRead.useMutation({
    onSuccess: () => {
      utils.student.getMoonComment.invalidate();
      utils.student.getHomeworkComments.invalidate();
    },
  });

  useEffect(() => {
    if (!data) return;

    // Auto-open only on the very first login (welcome letter).
    if (hasComment && isFirstLogin) {
      const openTimer = window.setTimeout(() => {
        setIsOpen(true);
        markFirstOpened.mutate();
      }, 0);
      const attentionTimer = window.setTimeout(() => setAttention(true), 0);
      const stopTimer = window.setTimeout(() => setAttention(false), 4000);
      return () => {
        window.clearTimeout(openTimer);
        window.clearTimeout(attentionTimer);
        window.clearTimeout(stopTimer);
      };
    }

    // On subsequent updates just attract attention without opening.
    if (unread) {
      const attentionTimer = window.setTimeout(() => setAttention(true), 0);
      const stopTimer = window.setTimeout(() => setAttention(false), 4000);
      return () => {
        window.clearTimeout(attentionTimer);
        window.clearTimeout(stopTimer);
      };
    }
  }, [data, hasComment, isFirstLogin, markFirstOpened, unread]);

  const closeMoon = () => {
    if (hasComment) {
      markRead.mutate();
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (isOpen) {
      closeMoon();
    } else {
      setIsOpen(true);
      setAttention(false);
      if (isFirstLogin && !markFirstOpened.isPending) {
        markFirstOpened.mutate();
      }
    }
  };

  const handleCommentsOpen = (open: boolean) => {
    setCommentsOpen(open);
    if (open && unreadCommentsCount > 0 && !markCommentsRead.isPending) {
      markCommentsRead.mutate();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeMoon}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="fixed right-0 top-20 sm:top-24 lg:top-28 z-50 pointer-events-none">
        <div className="relative flex items-start">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="pointer-events-auto absolute right-4 top-full mt-3 sm:right-full sm:top-1/2 sm:-translate-y-1/2 sm:mr-4 w-[min(22rem,calc(100vw-2rem))] sm:w-[26rem] max-h-[70vh] flex flex-col"
              >
                <div className="bg-slate-50 border-2 border-white rounded-[2rem] rounded-tr-md shadow-[0_0_40px_rgba(255,255,255,0.25)] overflow-hidden">
                  <div className="overflow-y-auto p-5 max-h-[70vh]">
                    {hasComment ? (
                      <MarkdownRenderer
                        content={data!.moonComment}
                        compact
                        light
                      />
                    ) : (
                      <p className="text-sm text-slate-500">
                        Учитель пока не оставил сообщений.
                      </p>
                    )}

                    {/* Homework comments aggregator */}
                    <div className="mt-5 pt-4 border-t border-slate-200/60">
                      <Collapsible
                        open={commentsOpen}
                        onOpenChange={handleCommentsOpen}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center justify-between w-full text-left group"
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                              <MessageSquare size={16} />
                              Комментарии к ДЗ
                            </span>
                            <span className="flex items-center gap-2">
                              {unreadCommentsCount > 0 && (
                                <Badge className="bg-red-500 text-white hover:bg-red-500 border-transparent">
                                  {unreadCommentsCount}
                                </Badge>
                              )}
                              <ChevronDown
                                size={16}
                                className={`text-slate-400 transition-transform duration-200 ${
                                  commentsOpen ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                          </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <ScrollArea className="h-[300px] mt-3 pr-2">
                            {comments.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                Пока нет комментариев
                              </p>
                            ) : (
                              <div className="space-y-0">
                                {comments.map((item, index) => (
                                  <div
                                    key={`${item.type}-${item.id}`}
                                    className={`py-3 ${
                                      index !== comments.length - 1
                                        ? "border-b border-slate-200/60"
                                        : ""
                                    }`}
                                  >
                                    <a
                                      href={
                                        item.type === "problem"
                                          ? `/#/student/problem/${item.id}`
                                          : `/#/labs/work/${item.slug}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                      {item.title}
                                    </a>
                                    <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
                                      {item.teacherComment}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={handleToggle}
            aria-label={isOpen ? "Скрыть Луну" : "Показать сообщение учителя"}
            className="pointer-events-auto relative focus:outline-none"
            animate={{
              x: isOpen ? "0%" : "55%",
              scale: attention ? [1, 1.08, 1, 1.04, 1] : 1,
              rotate: attention ? [0, -5, 5, -3, 0] : 0,
            }}
            transition={{
              x: { type: "spring", stiffness: 180, damping: 22 },
              scale: { duration: 0.6, repeat: attention ? 3 : 0 },
              rotate: { duration: 0.6, repeat: attention ? 3 : 0 },
            }}
            style={{
              filter: isOpen
                ? "brightness(1) grayscale(0) drop-shadow(0 0 22px rgba(255,255,255,0.45))"
                : "brightness(0.55) grayscale(0.35) drop-shadow(0 0 6px rgba(255,255,255,0.15))",
              transition: "filter 0.5s ease",
            }}
          >
            <img
              src="/images/moon.svg"
              alt="Луна"
              className="w-32 h-32 sm:w-44 sm:h-44"
            />
          </motion.button>
        </div>
      </div>
    </>
  );
}
