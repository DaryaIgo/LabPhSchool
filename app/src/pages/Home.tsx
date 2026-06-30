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
import { useState, useEffect, useRef, type ReactNode } from "react";

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

const ROCKET_FORMULAS = [
  "E=mc²",
  "F=ma",
  "a=v/t",
  "P=mg",
  "Q=cmΔT",
  "I=U/R",
  "p=mv",
  "E=kq/r²",
];
class FormulaPopup {
  x: number;
  y: number;
  formula: string;
  opacity: number;

  constructor(x: number, y: number, formula: string) {
    this.x = x;
    this.y = y;
    this.formula = formula;
    this.opacity = 1;
  }

  update(): boolean {
    this.y -= 0.6;
    this.opacity -= 0.015;
    return this.opacity > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    ctx.font = '12px "Geist Mono", monospace';
    const metrics = ctx.measureText(this.formula);
    const paddingX = 10;
    const w = metrics.width + paddingX * 2;
    const h = 22;
    const x = this.x - w / 2;
    const y = this.y - h / 2;
    const r = 8;

    ctx.fillStyle = "rgba(38, 46, 51, 0.9)";
    ctx.strokeStyle = "#2eff8c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.formula, this.x, this.y + 1);

    ctx.restore();
  }
}

class Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  formula: string;
  emoji: string;
  angle: number;
  vAngle: number;
  falling: boolean;
  opacity: number;
  hit: boolean;

  constructor(W: number, H: number) {
    this.formula =
      ROCKET_FORMULAS[Math.floor(Math.random() * ROCKET_FORMULAS.length)];
    this.emoji = Rocket.pickEmoji();
    this.size = 20 + Math.random() * 8;
    this.opacity = 1;
    this.falling = false;
    this.hit = false;

    const side = Math.floor(Math.random() * 4);
    const margin = 60;
    if (side === 0) {
      this.x = Math.random() * W;
      this.y = -margin;
    } else if (side === 1) {
      this.x = W + margin;
      this.y = Math.random() * H;
    } else if (side === 2) {
      this.x = Math.random() * W;
      this.y = H + margin;
    } else {
      this.x = -margin;
      this.y = Math.random() * H;
    }

    const targetX = Math.random() * W;
    const targetY = Math.random() * H;
    const distance = Math.hypot(targetX - this.x, targetY - this.y);
    const duration = 2 + Math.random() * 3;
    const speed = distance / (duration * 60);

    // Scale: slower objects are bigger (min x1, max x2)
    const MIN_SPEED = 0.5;
    const MAX_SPEED = 5.0;
    const clampedSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
    const scaleFactor =
      2 - (clampedSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
    this.size = (20 + Math.random() * 8) * scaleFactor;

    const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);
    const spread = (Math.random() - 0.5) * 0.6;
    const dir = angleToTarget + spread;

    this.vx = Math.cos(dir) * speed;
    this.vy = Math.sin(dir) * speed;
    this.angle = dir;
    this.vAngle = (Math.random() - 0.5) * 0.015;
  }

  static pickEmoji(): string {
    const r = Math.random();
    if (r < 0.7) return "🚀";
    const others = ["⭐", "👨‍🚀", "👽", "🪐", "🌟"];
    return others[Math.floor(Math.random() * others.length)];
  }

  update(mouse: { x: number; y: number }, W: number, H: number): boolean {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);

    if (!this.falling && dist < 45) {
      this.falling = true;
      this.hit = true;
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = 2 + Math.random() * 2;
      this.vAngle = (Math.random() - 0.5) * 0.1;
    }

    if (this.falling) {
      this.vy += 0.2;
      this.vx *= 0.99;
      this.opacity -= 0.012;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.vAngle;

    if (this.opacity <= 0) return false;
    if (
      !this.falling &&
      (this.x < -80 || this.x > W + 80 || this.y < -80 || this.y > H + 80)
    ) {
      return false;
    }
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 4);
    ctx.font = `${this.size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

/* ---------- Rocket Canvas ---------- */
function RocketCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0,
      H = 0;
    let raf = 0;
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const rockets: Rocket[] = [];
    const popups: FormulaPopup[] = [];
    let spawnTimer = 0;
    const spawnInterval = 150 + Math.floor(Math.random() * 108); //

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      spawnTimer++;
      if (spawnTimer > spawnInterval && rockets.length < 5) {
        rockets.push(new Rocket(W, H));
        spawnTimer = 0;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        const wasFalling = rocket.falling;
        if (!rocket.update(mouse, W, H)) {
          rockets.splice(i, 1);
        } else {
          rocket.draw(ctx);
          if (rocket.falling && !wasFalling) {
            popups.push(new FormulaPopup(rocket.x, rocket.y, rocket.formula));
          }
        }
      }

      for (let i = popups.length - 1; i >= 0; i--) {
        const popup = popups[i];
        if (!popup.update()) {
          popups.splice(i, 1);
        } else {
          popup.draw(ctx);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
  );
}

/* ---------- Main Page ---------- */
export default function Home() {
  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center overflow-hidden bg-[#262e33]">
        <GlobeCanvas />
        <RocketCanvas />
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto pt-10">
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
          <div className="grid lg:grid-cols-[36%_1fr] gap-12 lg:gap-20 items-center">
            {/* Photo composition */}
            <div className="relative">
              <div className="relative mx-auto w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]">
                {/* Animated gradient aura behind the figure */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] rounded-full bg-gradient-to-br from-[#d8b4fe]/45 via-[#2eff8c]/20 to-[#01acff]/30 blur-3xl animate-nebula-drift pointer-events-none" />
                <div className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full bg-[#ff9ecd]/25 blur-3xl animate-nebula-drift-slow pointer-events-none" />
                <div className="absolute bottom-[20%] right-[10%] w-28 h-28 rounded-full bg-[#01acff]/20 blur-3xl animate-nebula-pulse pointer-events-none" />

                {/* Main photo without background */}
                <div className="relative">
                  <img
                    src="/images/teacher.png"
                    alt="Дарья Дмитриевна — преподаватель физики"
                    className="relative z-10 w-full h-auto drop-shadow-[0_25px_60px_rgba(38,46,51,0.25)]"
                  />
                  {/* Soft grounding shadow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-6 bg-[#262e33]/15 blur-2xl rounded-full z-0" />

                  {/* Soft edge blend — left and bottom so photo doesn't look cut */}
                  <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-[#e8ebed]/40 to-transparent z-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#e8ebed]/40 to-transparent z-20 pointer-events-none" />
                </div>

              </div>
            </div>

            {/* Text content */}
            <div className="lg:pl-4">
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
                  теорию не только из учебников, но и из инженерной практики — и
                  именно поэтому умею объяснять физику языком, близким реальному
                  миру.
                </p>
                <p>
                  На занятиях мы используем интерактивные симуляции PhET,
                  онлайн-доску, видеосвязь и Jupyter-ноутбуки — всё, чтобы вы
                  могли не заучивать формулы, а действительно понимать, как
                  устроена природа.
                </p>
              </div>

              {/* Floating tags cloud */}
              <div className="flex flex-wrap gap-3">
                {[
                  "Личный кабинет",
                  "Jupyter-ноутбуки",
                  "Онлайн-доска",
                  "Виртуальные лаборатории",
                  "Индивидуальная программа",
                ].map((tag, i) => (
                  <FloatingTag
                    key={tag}
                    delay={i * 0.5}
                    className={
                      i % 3 === 1 ? "mt-2" : i % 3 === 2 ? "-mt-1" : ""
                    }
                  >
                    {tag}
                  </FloatingTag>
                ))}
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
                label: "12 Разделов",
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
                  <Link to={card.to} className="block p-8 h-full flex flex-col">
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
      <section className="bg-[#262e33] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
