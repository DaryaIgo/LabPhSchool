import { useState } from "react";
import { COURSE_TOPICS } from "@/data/courseTopics";
import { ChevronDown, ChevronRight, BookOpen, FlaskConical, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

function TopicAccordion({
  topic,
  isOpen,
  onToggle,
  openSubId,
  onToggleSub,
}: {
  topic: {
    id: number;
    order: number;
    title: string;
    formula: string | null;
    description: string | null;
    color: string;
    slug: string;
    subtopics: { id: number; title: string; description: string | null; content: string }[];
  };
  isOpen: boolean;
  onToggle: () => void;
  openSubId: number | null;
  onToggleSub: (subId: number) => void;
}) {
  const activeSub = topic.subtopics.find((s) => s.id === openSubId);

  return (
    <div className="border border-[#434e54] rounded-xl overflow-hidden bg-[#2a3237] transition-all hover:border-[#2eff8c]/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/5"
      >
        <span
          className="font-mono-phys text-2xl font-bold shrink-0"
          style={{ color: topic.color || "#2eff8c" }}
        >
          {String(topic.order).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold">{topic.title}</h3>
          {topic.formula && (
            <p className="formula-text text-xs mt-1">{topic.formula}</p>
          )}
        </div>
        {isOpen ? (
          <ChevronDown size={20} className="text-[#2eff8c] shrink-0" />
        ) : (
          <ChevronRight size={20} className="text-[#798389] shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          {topic.description && (
            <p className="text-[#c8cdd1] text-sm mb-4 leading-relaxed">
              {topic.description}
            </p>
          )}

          {/* Subtopic Theory View */}
          {activeSub ? (
            <div className="bg-[#1a1f22] border border-[#2eff8c]/20 rounded-xl p-5 mb-4">
              <button
                onClick={() => onToggleSub(activeSub.id)}
                className="inline-flex items-center gap-1.5 text-xs text-[#798389] hover:text-[#2eff8c] transition-colors mb-3"
              >
                <ArrowLeft size={12} /> Назад к подтемам
              </button>
              <h4 className="text-base font-semibold text-[#2eff8c] mb-1">{activeSub.title}</h4>
              {activeSub.description && (
                <p className="text-xs text-[#798389] mb-3">{activeSub.description}</p>
              )}
              <div className="border-t border-white/5 pt-3">
                <p className="text-sm text-[#c8cdd1] leading-relaxed whitespace-pre-wrap">
                  {activeSub.content}
                </p>
              </div>
            </div>
          ) : (
            /* Subtopic List */
            <div className="space-y-2">
              <h4 className="text-xs font-mono-phys text-[#2eff8c] uppercase tracking-wider mb-3">
                Подтемы:
              </h4>
              {topic.subtopics.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onToggleSub(sub.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg bg-[#262e33] hover:bg-[#2eff8c]/10 transition-colors group text-left"
                >
                  <FileText size={16} className="text-[#2eff8c] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-sm font-medium group-hover:text-[#2eff8c] transition-colors">{sub.title}</p>
                    {sub.description && (
                      <p className="text-xs text-[#798389] mt-1">{sub.description}</p>
                    )}
                  </div>
                  <BookOpen size={14} className="text-[#798389] group-hover:text-[#2eff8c] transition-colors shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}

          {!activeSub && (
            <div className="mt-4 flex gap-3">
              <Link
                to={`/labs`}
                className="inline-flex items-center gap-2 text-xs text-[#2eff8c] hover:underline"
              >
                <FlaskConical size={14} />
                Перейти к лабораториям
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Course() {
  const [openTopic, setOpenTopic] = useState<number | null>(1);
  const [openSubtopic, setOpenSubtopic] = useState<{ topicId: number; subId: number } | null>(null);
  const topics = COURSE_TOPICS;

  const handleToggleSub = (topicId: number, subId: number) => {
    setOpenSubtopic((prev) =>
      prev && prev.topicId === topicId && prev.subId === subId
        ? null
        : { topicId, subId }
    );
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-[#262e33] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#2eff8c"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="formula-text text-sm mb-4">E = mc² | полный курс</p>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6">
            Курс физики: полная программа
          </h1>
          <p className="text-[#c8cdd1] max-w-2xl mx-auto">
            От кинематики до квантовой физики — структурированный материал с
            алгоритмами, формулами и примерами
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="section-light py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-8 text-center">
            12 тем — от основ до квантовой физики
          </h2>

          <div className="space-y-3">
            {topics.map((topic) => (
              <TopicAccordion
                key={topic.id}
                topic={topic}
                isOpen={openTopic === topic.id}
                onToggle={() => {
                  setOpenTopic(openTopic === topic.id ? null : topic.id);
                  setOpenSubtopic(null);
                }}
                openSubId={
                  openSubtopic?.topicId === topic.id ? openSubtopic.subId : null
                }
                onToggleSub={(subId) => handleToggleSub(topic.id, subId)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Универсальный алгоритм
            </h2>
            <p className="text-[#c8cdd1]">
              Шесть шагов для решения любой физической задачи
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Прочитать", desc: "Внимательно прочитать условие, выделить вопрос" },
              { num: "2", title: "Записать данные", desc: "Выписать известные величины, перевести в СИ" },
              { num: "3", title: "Определить тип", desc: "Классифицировать задачу по теме и типу" },
              { num: "4", title: "Найти формулу", desc: "Выбрать закон или формулу из справочника" },
              { num: "5", title: "Решить", desc: "Подставить данные, вычислить ответ" },
              { num: "6", title: "Проверить", desc: "Проверить размерность и адекватность" },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5"
              >
                <span className="font-mono-phys text-3xl font-bold text-[#2eff8c]">
                  {step.num}
                </span>
                <h3 className="font-semibold mt-2">{step.title}</h3>
                <p className="text-sm text-[#798389] mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulas */}
      <section className="section-light py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-4">
              Основные формулы кинематики
            </h2>
          </div>
          <div className="bg-[#2a3237] border border-[#434e54] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#434e54]">
                  <th className="text-left py-3 px-4 text-[#798389] font-medium">
                    Обозначение
                  </th>
                  <th className="text-left py-3 px-4 text-[#798389] font-medium">
                    Название
                  </th>
                  <th className="text-left py-3 px-4 text-[#798389] font-medium">
                    Формула
                  </th>
                  <th className="text-left py-3 px-4 text-[#798389] font-medium">
                    Единица
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { sym: "v", name: "Скорость", formula: "v = s/t", unit: "м/с" },
                  { sym: "a", name: "Ускорение", formula: "a = Δv/Δt", unit: "м/с²" },
                  { sym: "x", name: "Координата", formula: "x = x₀ + v₀t + at²/2", unit: "м" },
                  {
                    sym: "v",
                    name: "Скорость (равноускоренное)",
                    formula: "v = v₀ + at",
                    unit: "м/с",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 last:border-b-0"
                  >
                    <td className="py-3 px-4 font-mono-phys text-[#2eff8c]">
                      {row.sym}
                    </td>
                    <td className="py-3 px-4">{row.name}</td>
                    <td className="py-3 px-4 formula-text text-xs">
                      {row.formula}
                    </td>
                    <td className="py-3 px-4 text-[#798389]">{row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
