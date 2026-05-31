import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  FlaskConical,
  BookOpen,
  User,
  ArrowRight,
  ChevronRight,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

/* ---------- Hero Globe Canvas ---------- */
function GlobeCanvas() {
  const canvasRef = (node: HTMLCanvasElement | null) => {
    if (!node) return;
    const canvas = node;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0,
      H = 0;
    let raf = 0;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const rays: { angle: number; speed: number; length: number; alpha: number }[] = [];
    for (let i = 0; i < 12; i++) {
      rays.push({
        angle: (Math.PI * 2 * i) / 12 + Math.random() * 0.5,
        speed: 0.005 + Math.random() * 0.01,
        length: 80 + Math.random() * 60,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.25;

      // Globe wireframe
      ctx.strokeStyle = "rgba(46,255,140,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Meridians
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * i) / 3;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          radius * Math.abs(Math.cos(angle + time * 0.1)),
          radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Latitudes
      for (let i = -2; i <= 2; i++) {
        const y = cy + (radius * i) / 3;
        const rx = radius * Math.sqrt(1 - (i * i) / 9);
        ctx.beginPath();
        ctx.ellipse(cx, y, rx, rx * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rays
      rays.forEach((ray) => {
        ray.angle += ray.speed;
        const x1 = cx + Math.cos(ray.angle) * radius;
        const y1 = cy + Math.sin(ray.angle) * radius * 0.8;
        const x2 = cx + Math.cos(ray.angle) * (radius + ray.length);
        const y2 = cy + Math.sin(ray.angle) * (radius + ray.length) * 0.8;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(46,255,140,${ray.alpha})`);
        grad.addColorStop(1, "rgba(46,255,140,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Glow tip
        ctx.fillStyle = `rgba(255,255,255,${ray.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(x2, y2, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  };

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ---------- Typewriter Text ---------- */
function TypewriterText({
  text,
  delay,
  className,
}: {
  text: string;
  delay: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

/* ---------- Main Page ---------- */
export default function Home() {
  const { user } = useAuth();
  const { data: topics } = trpc.course.topics.useQuery();
  const { data: labsList } = trpc.course.labs.useQuery();

  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#262e33]">
        <GlobeCanvas />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
          <div className="space-y-2 mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[0.95]">
              <TypewriterText text="Физика — это не предмет" delay={600} />
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#2eff8c] uppercase tracking-tight leading-[0.95]">
              <TypewriterText text="Это способ мыслить" delay={1800} />
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[0.95]">
              <TypewriterText text="о реальности" delay={3000} />
            </h1>
          </div>

          <p className="text-base md:text-lg text-[#c8cdd1] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "3.5s", opacity: 0 }}>
            Структурированный школьный курс с интерактивными лабораторными
            работами, алгоритмами решения задач и персональными кабинетами для
            каждого ученика
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "3.8s", opacity: 0 }}>
            <Link to="/course" className="btn-lime flex items-center justify-center gap-2">
              <BookOpen size={18} />
              Начать обучение
            </Link>
            <Link to="/labs" className="btn-outline flex items-center justify-center gap-2">
              <FlaskConical size={18} />
              Посмотреть лаборатории
            </Link>
          </div>

          {user && (
            <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "4s", opacity: 0 }}>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 text-[#2eff8c] hover:underline text-sm"
              >
                <User size={16} />
                Перейти в личный кабинет
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ====== ABOUT TEACHER PREVIEW ====== */}
      <section className="section-light py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 mx-auto rounded-full overflow-hidden border-2 border-[#2eff8c] shadow-2xl">
                <img
                  src="/images/teacher.jpg"
                  alt="Преподаватель физики"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 lg:right-8 bg-[#2eff8c] text-black font-mono-phys text-xs px-4 py-2 rounded-full">
                F = ma
              </div>
            </div>
            <div>
              <p className="formula-text mb-3">
                преподаватель физики | 12+ лет опыта
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-6 leading-tight">
                Превращаю сложную физику в понятные шаги
              </h2>
              <p className="text-[#434e54] mb-8 leading-relaxed">
                Более 12 лет преподаю физику в средней школе. Разработал
                собственную методику обучения, основанную на алгоритмическом
                подходе к решению задач. Каждый ученик получает персональный
                кабинет с доступом к полному школьному курсу, интерактивным
                лабораторным работам и отслеживанию прогресса.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl lg:text-3xl font-bold text-[#2eff8c]">
                    12+
                  </div>
                  <div className="text-xs text-[#798389] mt-1">лет опыта</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl lg:text-3xl font-bold text-[#01acff]">
                    500+
                  </div>
                  <div className="text-xs text-[#798389] mt-1">учеников</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl lg:text-3xl font-bold text-[#2eff8c]">
                    100%
                  </div>
                  <div className="text-xs text-[#798389] mt-1">охват курса</div>
                </div>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 mt-6 text-[#1a1a1a] font-medium hover:text-[#2eff8c] transition-colors"
              >
                Подробнее обо мне
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== COURSE STRUCTURE ====== */}
      <section className="section-dark py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Структура курса
            </h2>
            <p className="text-[#c8cdd1] max-w-2xl mx-auto">
              Полный школьный курс физики — от кинематики до квантовой физики.
              Каждая тема включает теорию, алгоритмы и примеры.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics?.map((topic) => (
              <Link
                key={topic.id}
                to="/course"
                className="group relative bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="font-mono-phys text-2xl font-bold"
                    style={{ color: topic.color || "#2eff8c" }}
                  >
                    {String(topic.order).padStart(2, "0")}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-[#798389] group-hover:text-[#2eff8c] transition-colors"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#2eff8c] transition-colors">
                  {topic.title}
                </h3>
                {topic.formula && (
                  <p className="formula-text text-xs mb-2 opacity-70">
                    {topic.formula}
                  </p>
                )}
                <p className="text-sm text-[#798389]">{topic.shortDesc}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/course" className="btn-lime inline-flex items-center gap-2">
              Все темы курса
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== ALGORITHM STEPS ====== */}
      <section className="section-light py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-4">
              Алгоритм решения задач
            </h2>
            <p className="text-[#434e54]">
              Трёхшаговая система для решения любой физической задачи
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-[#2eff8c]/40" />

            {[
              {
                num: "01",
                title: "Разобрать условие",
                desc: "Выделить известные величины, привести к СИ, определить тип задачи",
                icon: Target,
              },
              {
                num: "02",
                title: "Найти формулу",
                desc: "Выбрать закон или формулу из алгоритма, записать в общем виде",
                icon: Lightbulb,
              },
              {
                num: "03",
                title: "Решить и проверить",
                desc: "Подставить данные, вычислить, проверить размерность",
                icon: CheckCircle,
              },
            ].map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-[#2eff8c] rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                  <step.icon size={32} className="text-black" />
                </div>
                <span className="font-mono-phys text-xs text-[#2eff8c] font-bold">
                  {step.num}
                </span>
                <h3 className="text-xl font-bold text-[#1a1a1a] mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#434e54]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== LABS PREVIEW ====== */}
      <section className="section-dark py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Лабораторные работы в цифре
            </h2>
            <p className="text-[#c8cdd1] max-w-2xl mx-auto">
              Каждая лаборатория — это интерактивная симуляция, где ученик
              может менять параметры и наблюдать результат
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {labsList?.slice(0, 6).map((lab) => {
              const iconMap: Record<string, string> = {
                mechanics: "/images/icon_lab_mechanics.png",
                pendulum: "/images/icon_lab_pendulum.png",
                circuit: "/images/icon_lab_circuit.png",
                diffraction: "/images/icon_lab_diffraction.png",
                lens: "/images/icon_lab_lens.png",
                photoeffect: "/images/icon_lab_photoeffect.png",
              };
              return (
                <Link
                  key={lab.id}
                  to={`/labs/${lab.slug}`}
                  className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1"
                >
                  <div className="w-24 h-24 mx-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    <img
                      src={iconMap[lab.iconType || "mechanics"] || "/images/icon_lab_mechanics.png"}
                      alt={lab.title}
                      className="w-full h-full object-contain invert"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#2eff8c] transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-sm text-[#798389] mb-4">{lab.shortDesc}</p>
                  <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                    Открыть симуляцию
                    <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/labs" className="btn-lime inline-flex items-center gap-2">
              Все лаборатории
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-[#1a1a1a] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-white">О курсе</h4>
              <ul className="space-y-2 text-sm text-[#798389]">
                <li>
                  <Link to="/course" className="hover:text-[#2eff8c] transition-colors">
                    Кинематика
                  </Link>
                </li>
                <li>
                  <Link to="/course" className="hover:text-[#2eff8c] transition-colors">
                    Динамика
                  </Link>
                </li>
                <li>
                  <Link to="/course" className="hover:text-[#2eff8c] transition-colors">
                    Электричество
                  </Link>
                </li>
                <li>
                  <Link to="/course" className="hover:text-[#2eff8c] transition-colors">
                    Оптика
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Лаборатории</h4>
              <ul className="space-y-2 text-sm text-[#798389]">
                <li>
                  <Link to="/labs" className="hover:text-[#2eff8c] transition-colors">
                    Механика
                  </Link>
                </li>
                <li>
                  <Link to="/labs" className="hover:text-[#2eff8c] transition-colors">
                    Термодинамика
                  </Link>
                </li>
                <li>
                  <Link to="/labs" className="hover:text-[#2eff8c] transition-colors">
                    Оптика
                  </Link>
                </li>
                <li>
                  <Link to="/labs" className="hover:text-[#2eff8c] transition-colors">
                    Атомная физика
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Кабинет</h4>
              <ul className="space-y-2 text-sm text-[#798389]">
                <li>
                  <Link to="/profile" className="hover:text-[#2eff8c] transition-colors">
                    Мой прогресс
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#2eff8c] transition-colors">
                    Лаборатории
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#2eff8c] transition-colors">
                    Обратная связь
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Контакты</h4>
              <ul className="space-y-2 text-sm text-[#798389]">
                <li>Telegram: @physics_teacher</li>
                <li>Email: teacher@kvant.physics</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center text-xs text-[#798389]">
            Академия Кванта — Школьный курс физики
          </div>
        </div>
      </footer>
    </div>
  );
}
