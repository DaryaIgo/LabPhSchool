import { Link } from "react-router";
import {
  FlaskConical,
  BookOpen,
  Mail,
  Send,
  Calendar,
  MapPin,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

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

    const rays: {
      angle: number;
      speed: number;
      length: number;
      alpha: number;
    }[] = [];
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
      rays.forEach(ray => {
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

/* ---------- Spotlight Card ---------- */
function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(46, 255, 140, 0.12), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ---------- Floating Tag ---------- */
function FloatingTag({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block px-4 py-2 rounded-full bg-white/90 border border-emerald-200/60 text-sm font-medium text-emerald-800 shadow-lg backdrop-blur-sm animate-tag-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
}

/* ---------- Main Page ---------- */
export default function Home() {
  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center overflow-hidden bg-[#262e33]">
        <GlobeCanvas />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-10">
          <div className="space-y-2 mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[0.95]">
              <TypewriterText text="Физика — это не предмет" delay={600} />
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#2eff8c] uppercase tracking-tight leading-[0.95]">
              <TypewriterText text="Это способ мыслить" delay={1800} />
            </h1>
          </div>
        </div>

      </section>

      {/* Transition dark → light */}
      <div className="h-[100px] bg-gradient-to-b from-[#262e33] to-[#e8ebed]" />

      {/* ====== ABOUT TEACHER ====== */}
      <section className="relative overflow-hidden bg-[#e8ebed] py-24 lg:py-32">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Photo composition */}
            <div className="relative">
              <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
                {/* Gradient shadow frame */}
                <div
                  className="absolute inset-0 rounded-[2.5rem] rotate-3 opacity-40 blur-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #2eff8c 0%, #01acff 100%)",
                  }}
                />

                {/* Main photo */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/60 bg-white">
                  <img
                    src="/images/teacher.png"
                    alt="Дарья Дмитриевна — преподаватель физики"
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Floating badges */}
              </div>

              {/* Floating tags cloud under/over the photo */}
              <div className="relative -mt-10 z-10 flex flex-wrap justify-center gap-3 max-w-md lg:max-w-lg mx-auto px-4">
                {[
                  "Jupyter-ноутбуки",
                  "Онлайн-доска",
                  "Виртуальные лаборатории",
                  "Алгоритмический подход",
                  "Персональный трекинг",
                ].map((tag, i) => (
                  <FloatingTag
                    key={tag}
                    delay={i * 0.5}
                    className={i % 3 === 1 ? "mt-2" : i % 3 === 2 ? "-mt-1" : ""}
                  >
                    {tag}
                  </FloatingTag>
                ))}
              </div>
            </div>

            {/* Text content */}
            <div className="lg:pl-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#262e33]/10 shadow-sm mb-6">
                <Sparkles size={16} className="text-[#2eff8c]" />
                <span className="text-sm font-semibold text-[#262e33]">
                  Обо мне
                </span>
              </div>

              <h2 className="text-3xl lg:text-5xl font-black text-[#1a1a1a] mb-6 leading-[1.1]">
                Превращаю сложную физику
                <span className="text-gradient-emerald"> в понятные шаги</span>
              </h2>

              <div className="space-y-4 text-lg text-[#434e54] leading-relaxed mb-8">
                <p>
                  Рада вас приветствовать 👋 Меня зовут{" "}
                  <span className="font-bold text-[#1a1a1a]">
                    Дарья Дмитриевна
                  </span>
                  .
                </p>
                <p>
                  Я окончила СПбПУ (Политех Петра Великого) с отличием. Знаю
                  теорию не только из учебников, но и из инженерной практики —
                  и именно поэтому умею объяснять физику языком, близким
                  реальному миру.
                </p>
                <p>
                  На занятиях мы используем интерактивные симуляции PhET,
                  онлайн-доску, видеосвязь и Jupyter-ноутбуки — всё, чтобы вы
                  могли не заучивать формулы, а действительно понимать, как
                  устроена природа.
                </p>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Transition light → dark */}
      <div className="h-[100px] bg-gradient-to-b from-[#e8ebed] to-[#262e33]" />

      {/* ====== SECTION TABS ====== */}
      <section className="section-dark py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <span className="inline-block text-sm font-semibold text-[#2eff8c] uppercase tracking-wider mb-3">
              Платформа
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              Всё для изучения физики
            </h2>
            <p className="text-[#c8cdd1] text-lg">
              Курс, лабораторные и дополнительные материалы в одном месте
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                to: "/course",
                label: "12 тем",
                title: "Курс физики",
                titleAccent: "школьная программа",
                description:
                  "От кинематики до квантовой физики — структурированный материал с алгоритмами, формулами и примерами.",
                icon: BookOpen,
                color: "#2eff8c",
              },
              {
                to: "/labs",
                label: "Интерактивно",
                title: "Виртуальные лабораторные работы",
                titleAccent: null,
                description:
                  "Симуляции физических экспериментов для учащихся 7–11 классов. Меняйте параметры, наблюдайте результаты и формируйте выводы.",
                icon: FlaskConical,
                color: "#01acff",
              },
              {
                to: "/resources",
                label: "Дополнительно",
                title: "Дополнительные ресурсы",
                titleAccent: null,
                description:
                  "Видеолекции, справочники, задачники и интерактивные модели для углублённого изучения физики.",
                icon: ExternalLink,
                color: "#ffcb3d",
              },
            ].map(card => {
              const Icon = card.icon;
              return (
                <SpotlightCard
                  key={card.to}
                  className="group bg-[#2a3237] border border-[#434e54] rounded-3xl transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <Link
                    to={card.to}
                    className="block p-8 h-full flex flex-col"
                  >
                    <div
                      className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ backgroundColor: card.color }}
                    />

                    <div className="flex items-start justify-between mb-6 relative">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${card.color}15`,
                        }}
                      >
                        <Icon size={28} style={{ color: card.color }} />
                      </div>
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${card.color}15`,
                          color: card.color,
                        }}
                      >
                        {card.label}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-tight relative">
                      {card.title}
                      {card.titleAccent && (
                        <span className="text-[#2eff8c]">
                          {" "}
                          {card.titleAccent}
                        </span>
                      )}
                    </h3>

                    <p className="text-[#c8cdd1] leading-relaxed flex-1 mb-6 relative">
                      {card.description}
                    </p>

                    <span className="inline-flex items-center text-[#2eff8c] font-semibold group-hover:gap-2 transition-all relative">
                      Перейти
                      <ArrowRight size={16} className="ml-2" />
                    </span>
                  </Link>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== CONTACT CTA ====== */}
      <section className="relative overflow-hidden bg-[#262e33] py-24 lg:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] rounded-full bg-[#2eff8c]/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-[#01acff]/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column: text */}
            <div>
              <span className="inline-block text-sm font-semibold text-[#2eff8c] uppercase tracking-wider mb-4">
                Контакты
              </span>
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-[1.1]">
                Договоримся о занятии
              </h2>
              <p className="text-lg text-[#c8cdd1] mb-10 max-w-lg">
                Если у вас есть вопросы о курсе или хотите записаться на пробное
                занятие — напишите удобным способом. Отвечаю в течение дня.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 text-[#c8cdd1]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2a3237] border border-[#434e54] flex items-center justify-center">
                    <MapPin size={20} className="text-[#2eff8c]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Шанхай</p>
                    <p className="text-sm">Работаю онлайн</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2a3237] border border-[#434e54] flex items-center justify-center">
                    <Calendar size={20} className="text-[#01acff]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Гибкий график</p>
                    <p className="text-sm">Подберём время</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: contact cards */}
            <div className="grid gap-4">
              <SpotlightCard className="group rounded-2xl bg-[#2a3237] border border-[#434e54] hover:border-[#01acff]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <a
                  href="https://t.me/igoshinadarya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 p-6"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#01acff]/15 flex items-center justify-center shrink-0">
                    <Send size={28} className="text-[#01acff]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#01acff] transition-colors">
                      Telegram
                    </h3>
                    <p className="text-sm text-[#c8cdd1]">@igoshinadarya</p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-[#434e54] group-hover:text-[#01acff] transition-colors"
                  />
                </a>
              </SpotlightCard>

              <SpotlightCard className="group rounded-2xl bg-[#2a3237] border border-[#434e54] hover:border-[#ff6b6b]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <a
                  href="https://profi.ru/profile/IgoshinaDD3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 p-6"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#ff6b6b]/15 flex items-center justify-center shrink-0">
                    <ExternalLink size={28} className="text-[#ff6b6b]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#ff6b6b] transition-colors">
                      Profi.ru
                    </h3>
                    <p className="text-sm text-[#c8cdd1]">
                      Профиль преподавателя
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-[#434e54] group-hover:text-[#ff6b6b] transition-colors"
                  />
                </a>
              </SpotlightCard>

              <SpotlightCard className="group rounded-2xl bg-[#2a3237] border border-[#434e54] hover:border-[#2eff8c]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <a
                  href="mailto:igoshina.physics@yandex.com"
                  className="flex items-center gap-5 p-6"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#2eff8c]/15 flex items-center justify-center shrink-0">
                    <Mail size={28} className="text-[#2eff8c]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#2eff8c] transition-colors">
                      Email
                    </h3>
                    <p className="text-sm text-[#c8cdd1]">
                      igoshina.physics@yandex.com
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-[#434e54] group-hover:text-[#2eff8c] transition-colors"
                  />
                </a>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
