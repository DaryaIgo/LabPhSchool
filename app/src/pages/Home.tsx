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
  Brain,
  Target,
  TrendingUp,
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

      {/* ====== ABOUT TEACHER PREVIEW ====== */}
      <section className="section-light py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 mx-auto rounded-full overflow-hidden border-2 border-[#2eff8c] shadow-2xl">
                <img
                  src="/images/teacher.png"
                  alt="Преподаватель физики"
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-6 leading-tight">
                Превращаю сложную физику в понятные шаги
              </h2>
              <p className="text-[#434e54] mb-2 leading-relaxed">
                Рада вас приветствовать 👋
              </p>
              <p className="text-[#434e54] mb-4 leading-relaxed">
                Меня зовут Дарья Дмитриевна.
              </p>
              <p className="text-[#434e54] mb-4 leading-relaxed">
                Я окончила СПбПУ (Политех Петра Великого) с отличием. Я не просто
                знаю теорию из учебников — я каждый день вижу, как физика работает
                на практике и в технологиях.
              </p>
              <p className="text-[#434e54] mb-8 leading-relaxed">
                С помощью интерактивных симуляций PhET ученики могут сами
                «потрогать» физические процессы — от движения молекул до
                оптических лучей и электрических цепей. На занятиях мы используем
                видеосвязь в Яндекс Телемост, удобную онлайн-доску Chattern и
                ноутбуки Jupyter для наглядного разбора сложных задач.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* ====== SECTION TABS ====== */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Разделы платформы
            </h2>
            <p className="text-[#c8cdd1] max-w-2xl mx-auto">
              Курс, лабораторные и дополнительные материалы
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                to: "/course",
                formula: "понятнее всего то, чего не будет на экзамене",
                title: "Курс физики",
                titleAccent: "школьная программа",
                description:
                  "От кинематики до квантовой физики — структурированный материал с алгоритмами, формулами и примерами.",
                icon: BookOpen,
                color: "#2eff8c",
              },
              {
                to: "/labs",
                formula: "под давлением всё ухудшается",
                title: "Виртуальные лабораторные работы",
                titleAccent: null,
                description:
                  "Интерактивные симуляции физических экспериментов для учащихся 7–11 классов. Меняйте параметры, наблюдайте результаты, фиксируйте данные и формируйте научные выводы.",
                icon: FlaskConical,
                color: "#01acff",
              },
              {
                to: "/resources",
                formula: "усталость - это иллюзия",
                title: "Дополнительные ресурсы",
                titleAccent: null,
                description:
                  "Видеолекции, справочники, задачники и интерактивные модели для углублённого изучения физики.",
                icon: ExternalLink,
                color: "#ffcb3d",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.to}
                  to={card.to}
                  className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${card.color}15`,
                      }}
                    >
                      <Icon size={24} style={{ color: card.color }} />
                    </div>
                    <span className="inline-flex items-center text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                      Перейти
                      <ArrowRight size={14} className="ml-1" />
                    </span>
                  </div>
                  <p className="formula-text text-xs mb-3">{card.formula}</p>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-3 leading-tight">
                    {card.title}
                    {card.titleAccent && (
                      <span className="text-[#2eff8c]"> {card.titleAccent}</span>
                    )}
                  </h3>
                  <p className="text-sm text-[#c8cdd1] leading-relaxed flex-1">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-16 lg:mt-20 border-t border-[#434e54]" />
        </div>
      </section>

      {/* ====== TEACHING METHODOLOGY ====== */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <span className="w-2 h-8 bg-[#2eff8c] rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Методика преподавания
              </h2>
            </div>
            <p className="text-[#c8cdd1] max-w-2xl mx-auto">
              Как устроен процесс обучения
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Алгоритмический подход",
                desc: "Каждая задача решается по чёткому алгоритму: от анализа условия до проверки ответа. Это исключает хаотичные попытки и вырабатывает системное мышление.",
                icon: Brain,
                color: "#2eff8c",
              },
              {
                num: "02",
                title: "Интерактивные лабораторные",
                desc: "Вместо статичных описаний — живые симуляции. Ученик может менять параметры эксперимента и наблюдать результат в реальном времени.",
                icon: FlaskConical,
                color: "#01acff",
              },
              {
                num: "03",
                title: "Персональный трекинг",
                desc: "Каждый ученик видит свой прогресс по всем темам. Система автоматически подсвечивает слабые места и рекомендует материалы для изучения.",
                icon: Target,
                color: "#ffcb3d",
              },
              {
                num: "04",
                title: "От простого к сложному",
                desc: "Курс построен по принципу нарастающей сложности. Каждая новая тема опирается на предыдущие, создавая цельную картину мира.",
                icon: TrendingUp,
                color: "#ff6b6b",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${item.color}15`,
                      }}
                    >
                      <Icon size={24} style={{ color: item.color }} />
                    </div>
                    <span
                      className="font-mono-phys text-xs font-bold px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#c8cdd1] leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== CONTACT CTA ====== */}
      <section className="section-light py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-4">
            Свяжитесь со мной
          </h2>
          <p className="text-[#434e54] mb-8">
            Если у вас есть вопросы о курсе или вы хотите записаться на занятия
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            <a
              href="https://t.me/igoshinadarya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#01acff] text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              <Send size={18} />
              Telegram
            </a>
            <a
              href="https://profi.ru/profile/IgoshinaDD3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#ff6b6b] text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              <ExternalLink size={18} />
              Profi.ru
            </a>
            <a
              href="mailto:igoshina.physics@yandex.com"
              className="flex items-center justify-center gap-2 bg-[#262e33] text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              <Mail size={18} />
              Написать письмо
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-[#798389]">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              Шанхай
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Занятия онлайн
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
