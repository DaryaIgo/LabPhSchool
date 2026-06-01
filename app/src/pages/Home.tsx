import { Link } from "react-router";
import {
  FlaskConical,
  BookOpen,
  Mail,
  Send,
  Calendar,
  MapPin,
  ExternalLink,
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
              Посмотреть лабораторные
            </Link>
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
            </div>
          </div>
        </div>
      </section>

      {/* ====== TEACHING METHODOLOGY ====== */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-10 text-center">
            Методика преподавания
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "Алгоритмический подход",
                desc: "Каждая задача решается по чёткому алгоритму: от анализа условия до проверки ответа. Это исключает хаотичные попытки и вырабатывает системное мышление.",
              },
              {
                num: "02",
                title: "Интерактивные лабораторные",
                desc: "Вместо статичных описаний — живые симуляции. Ученик может менять параметры эксперимента и наблюдать результат в реальном времени.",
              },
              {
                num: "03",
                title: "Персональный трекинг",
                desc: "Каждый ученик видит свой прогресс по всем темам. Система автоматически подсвечивает слабые места и рекомендует материалы для изучения.",
              },
              {
                num: "04",
                title: "От простого к сложному",
                desc: "Курс построен по принципу нарастающей сложности. Каждая новая тема опирается на предыдущие, создавая цельную картину мира.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6"
              >
                <span className="font-mono-phys text-2xl font-bold text-[#2eff8c]">
                  {item.num}
                </span>
                <h3 className="text-lg font-semibold mt-3 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-[#c8cdd1] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
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
              href="https://t.me/physics_teacher"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#01acff] text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              <Send size={18} />
              Telegram
            </a>
            <a
              href="https://profi.ru/profile/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#ff6b6b] text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              <ExternalLink size={18} />
              Profi.ru
            </a>
            <a
              href="mailto:teacher@kvant.physics"
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

      {/* ====== FOOTER ====== */}

      {/* ====== FOOTER ====== */}
      <footer className="bg-[#1a1a1a] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h4 className="font-semibold mb-4 text-white">Контакты</h4>
            <ul className="space-y-2 text-sm text-[#798389]">
              <li>Telegram: @physics_teacher</li>
              <li>Email: teacher@kvant.physics</li>
            </ul>
          </div>
          <div className="border-t border-white/5 pt-6 text-center text-xs text-[#798389]">
            Академия Кванта — Школьный курс физики
          </div>
        </div>
      </footer>
    </div>
  );
}
