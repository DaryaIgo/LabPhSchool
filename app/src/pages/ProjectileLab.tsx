import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Target,
  TrendingUp,
  BookOpen,
  Table2,
  Zap,
} from "lucide-react";

/* ================================================================
   PROJECTILE MOTION LAB
   ================================================================ */

interface Measurement {
  id: number;
  v0: number;
  angle: number;
  h0: number;
  range: number;
  maxHeight: number;
  flightTime: number;
}

const G = 9.81;

/* ---------- Canvas Simulation ---------- */
function ProjectileCanvas({
  v0,
  angleDeg,
  h0,
  isRunning,
  onComplete,
}: {
  v0: number;
  angleDeg: number;
  h0: number;
  isRunning: boolean;
  onComplete: (range: number, maxH: number, time: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const stateRef = useRef({ t: 0, trail: [] as { x: number; y: number }[] });

  const angleRad = (angleDeg * Math.PI) / 180;
  const vx = v0 * Math.cos(angleRad);
  const vy = v0 * Math.sin(angleRad);

  const maxT = (vy + Math.sqrt(vy * vy + 2 * G * h0)) / G;
  const maxRange = vx * maxT;
  const maxHeight = h0 + (vy * vy) / (2 * G);

  const scaleX = Math.max(500 / (maxRange * 1.2), 2);
  const scaleY = Math.max(350 / (maxHeight * 1.3), 2);
  const scale = Math.min(scaleX, scaleY);

  const originX = 60;
  const originY = 400;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.fillStyle = "#0d1114";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(46,255,140,0.06)";
    ctx.lineWidth = 0.5;
    for (let x = originX; x < W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < originY; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Ground line
    ctx.strokeStyle = "#434e54";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX - 10, originY);
    ctx.lineTo(W - 10, originY);
    ctx.stroke();

    // Height markers
    ctx.fillStyle = "#798389";
    ctx.font = "9px 'Geist Mono', monospace";
    for (let m = 0; m <= Math.ceil(maxHeight / 10) * 10; m += 10) {
      const y = originY - m * scale;
      if (y < 0) break;
      ctx.fillText(`${m}м`, 5, y + 3);
      ctx.strokeStyle = "rgba(121,131,137,0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(originX, y);
      ctx.lineTo(W - 10, y);
      ctx.stroke();
    }

    // Distance markers
    for (let m = 0; m <= Math.ceil(maxRange / 20) * 20; m += 20) {
      const x = originX + m * scale;
      if (x > W - 10) break;
      ctx.fillStyle = "#798389";
      ctx.fillText(`${m}м`, x - 8, originY + 16);
    }

    // Axis labels
    ctx.fillStyle = "#2eff8c";
    ctx.font = "10px 'Geist Sans', sans-serif";
    ctx.fillText("x, м", W - 40, originY + 28);
    ctx.fillText("h, м", originX - 45, 15);

    // Theoretical trajectory (dotted)
    ctx.strokeStyle = "rgba(46,255,140,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let t = 0; t <= maxT; t += 0.02) {
      const x = vx * t;
      const y = h0 + vy * t - (G * t * t) / 2;
      const px = originX + x * scale;
      const py = originY - y * scale;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Animation state
    const { t: currentT, trail } = stateRef.current;

    // Trail
    if (trail.length > 1) {
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      trail.forEach((p, i) => {
        const px = originX + p.x * scale;
        const py = originY - p.y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Current ball position
    if (currentT > 0) {
      const cx = vx * currentT;
      const cy = h0 + vy * currentT - (G * currentT * currentT) / 2;
      const px = originX + cx * scale;
      const py = originY - cy * scale;

      // Glow
      const glow = ctx.createRadialGradient(px, py, 2, px, py, 15);
      glow.addColorStop(0, "rgba(46,255,140,0.4)");
      glow.addColorStop(1, "rgba(46,255,140,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, Math.PI * 2);
      ctx.fill();

      // Ball
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vector
      const vxc = vx;
      const vyc = vy - G * currentT;
      const vScale = 0.3;
      ctx.strokeStyle = "#01acff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + vxc * vScale, py - vyc * vScale);
      ctx.stroke();

      // Time display
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px 'Geist Mono', monospace";
      ctx.fillText(`t = ${currentT.toFixed(2)} с`, W - 140, 30);
      ctx.fillStyle = "#2eff8c";
      ctx.fillText(`x = ${cx.toFixed(1)} м`, W - 140, 48);
      ctx.fillStyle = "#01acff";
      ctx.fillText(`h = ${cy.toFixed(1)} м`, W - 140, 66);
    }

    // Cannon
    const cannonLen = 30;
    const cannonX = originX;
    const cannonY = originY - h0 * scale;
    ctx.save();
    ctx.translate(cannonX, cannonY);
    ctx.rotate(-angleRad);
    ctx.fillStyle = "#ffcb3d";
    ctx.fillRect(0, -4, cannonLen, 8);
    ctx.restore();

    // Cannon base
    ctx.fillStyle = "#ffcb3d";
    ctx.beginPath();
    ctx.arc(cannonX, cannonY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Info panel
    ctx.fillStyle = "rgba(13,17,20,0.9)";
    ctx.beginPath();
    roundRect(ctx, 10, 10, 150, 78, 6);
    ctx.fill();
    ctx.strokeStyle = "#434e54";
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, 10, 10, 150, 78, 6);
    ctx.stroke();

    ctx.fillStyle = "#ffcb3d";
    ctx.font = "bold 10px 'Geist Mono', monospace";
    ctx.fillText("ПАРАМЕТРЫ:", 18, 26);
    ctx.fillStyle = "#c8cdd1";
    ctx.font = "10px 'Geist Mono', monospace";
    ctx.fillText(`v₀ = ${v0} м/с`, 18, 42);
    ctx.fillText(`α = ${angleDeg}°`, 18, 56);
    ctx.fillText(`h₀ = ${h0} м`, 18, 70);
    ctx.fillText(`g = ${G} м/с²`, 18, 84);

    animRef.current = requestAnimationFrame(draw);
  }, [v0, angleDeg, h0, vx, vy, maxT, maxRange, maxHeight, scale, originX, originY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 700;
    canvas.height = 460;

    stateRef.current = { t: 0, trail: [] };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Animation
  useEffect(() => {
    if (!isRunning) return;

    const startTime = performance.now();
    stateRef.current = { t: 0, trail: [] };

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed, maxT);

      const cx = vx * t;
      const cy = h0 + vy * t - (G * t * t) / 2;

      stateRef.current.t = t;
      stateRef.current.trail.push({ x: cx, y: Math.max(0, cy) });

      if (t >= maxT) {
        onComplete(maxRange, maxHeight, maxT);
      } else {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isRunning, vx, vy, maxT, maxRange, maxHeight, h0, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl border border-[#434e54]"
      style={{ maxWidth: 700, height: "auto", aspectRatio: "700/460" }}
    />
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function ProjectileLab() {
  const [v0, setV0] = useState(20);
  const [angle, setAngle] = useState(45);
  const [h0, setH0] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ range: number; maxH: number; time: number } | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeTab, setActiveTab] = useState<"simulation" | "theory" | "protocol">("simulation");

  const handleComplete = (range: number, maxH: number, time: number) => {
    setResult({ range, maxH, time });
    setIsRunning(false);
  };

  const addMeasurement = () => {
    if (!result) return;
    const m: Measurement = {
      id: measurements.length + 1,
      v0,
      angle,
      h0,
      range: result.range,
      maxHeight: result.maxH,
      flightTime: result.time,
    };
    setMeasurements([...measurements, m]);
  };

  const reset = () => {
    setIsRunning(false);
    setResult(null);
  };

  const angleRad = (angle * Math.PI) / 180;
  const vx = v0 * Math.cos(angleRad);
  const vy = v0 * Math.sin(angleRad);
  const maxT = (vy + Math.sqrt(vy * vy + 2 * G * h0)) / G;
  const maxRange = vx * maxT;
  const maxHeight = h0 + (vy * vy) / (2 * G);

  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      {/* Hero */}
      <section className="bg-[#1a1f22] py-12 lg:py-16 border-b border-[#434e54]">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/labs"
            className="inline-flex items-center gap-2 text-[#798389] hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Назад к лабораториям
          </Link>
          <p className="formula-text text-xs mb-2">Лабораторная работа №7 | Кинематика</p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
            Бросок тела под углом к горизонту
          </h1>
          <p className="text-[#c8cdd1] mt-3 max-w-xl">
            Исследование траектории полёта тела, брошенного под углом.
            Определение дальности, максимальной высоты и времени полёта.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-1 bg-[#1a1f22] p-1 rounded-xl w-fit">
          {[
            { key: "simulation" as const, label: "Симуляция", icon: Zap },
            { key: "theory" as const, label: "Теория", icon: BookOpen },
            { key: "protocol" as const, label: "Протокол", icon: Table2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#2eff8c] text-black"
                  : "text-[#c8cdd1] hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation */}
      {activeTab === "simulation" && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProjectileCanvas
                v0={v0}
                angleDeg={angle}
                h0={h0}
                isRunning={isRunning}
                onComplete={handleComplete}
              />
            </div>

            <div className="space-y-4">
              {/* Controls */}
              <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target size={18} className="text-[#ffcb3d]" />
                  Параметры броска
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#798389] block mb-2">
                      Начальная скорость: {v0} м/с
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={1}
                      value={v0}
                      onChange={(e) => {
                        setV0(parseInt(e.target.value));
                        reset();
                      }}
                      disabled={isRunning}
                      className="w-full accent-[#ffcb3d]"
                    />
                    <div className="flex justify-between text-[10px] text-[#798389]">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#798389] block mb-2">
                      Угол броска: {angle}°
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      step={5}
                      value={angle}
                      onChange={(e) => {
                        setAngle(parseInt(e.target.value));
                        reset();
                      }}
                      disabled={isRunning}
                      className="w-full accent-[#2eff8c]"
                    />
                    <div className="flex justify-between text-[10px] text-[#798389]">
                      <span>10°</span>
                      <span>45°</span>
                      <span>80°</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#798389] block mb-2">
                      Начальная высота: {h0} м
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={5}
                      value={h0}
                      onChange={(e) => {
                        setH0(parseInt(e.target.value));
                        reset();
                      }}
                      disabled={isRunning}
                      className="w-full accent-[#01acff]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setResult(null);
                      setIsRunning(true);
                    }}
                    disabled={isRunning}
                    className="flex-1 btn-lime flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Play size={16} />
                    {isRunning ? "Полёт..." : "Запустить"}
                  </button>
                  <button onClick={reset} className="btn-outline px-4">
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
                <h4 className="font-semibold text-[#2eff8c] mb-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Расчётные значения
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 rounded bg-[#262e33]">
                    <span className="text-[#798389]">Время полёта</span>
                    <span className="font-mono-phys">{maxT.toFixed(2)} с</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#262e33]">
                    <span className="text-[#798389]">Дальность полёта</span>
                    <span className="font-mono-phys text-[#2eff8c]">{maxRange.toFixed(1)} м</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#262e33]">
                    <span className="text-[#798389]">Макс. высота</span>
                    <span className="font-mono-phys text-[#01acff]">{maxHeight.toFixed(1)} м</span>
                  </div>
                </div>

                {result && (
                  <button
                    onClick={addMeasurement}
                    className="w-full mt-4 btn-lime text-xs flex items-center justify-center gap-1"
                  >
                    Записать в таблицу
                  </button>
                )}
              </div>

              {/* Quick presets */}
              <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
                <h4 className="font-semibold text-sm mb-3">Быстрые настройки</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "v₀=20, α=30°", v: 20, a: 30, h: 0 },
                    { label: "v₀=30, α=45°", v: 30, a: 45, h: 0 },
                    { label: "v₀=25, α=60°", v: 25, a: 60, h: 0 },
                    { label: "v₀=20, α=45°, h=20", v: 20, a: 45, h: 20 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setV0(preset.v);
                        setAngle(preset.a);
                        setH0(preset.h);
                        reset();
                      }}
                      className="text-xs bg-[#262e33] text-[#c8cdd1] px-3 py-2 rounded-lg hover:bg-[#434e54] transition-colors text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Measurements table */}
          {measurements.length > 0 && (
            <div className="mt-8 bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Table2 size={20} className="text-[#2eff8c]" />
                Таблица измерений
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#262e33]">
                      <th className="text-left px-3 py-2">№</th>
                      <th className="text-left px-3 py-2">v₀, м/с</th>
                      <th className="text-left px-3 py-2">α, °</th>
                      <th className="text-left px-3 py-2">h₀, м</th>
                      <th className="text-left px-3 py-2">L, м</th>
                      <th className="text-left px-3 py-2">H_max, м</th>
                      <th className="text-left px-3 py-2">T, с</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m) => (
                      <tr key={m.id} className="border-t border-[#434e54]/50">
                        <td className="px-3 py-2 font-mono-phys text-[#2eff8c]">{m.id}</td>
                        <td className="px-3 py-2">{m.v0}</td>
                        <td className="px-3 py-2">{m.angle}</td>
                        <td className="px-3 py-2">{m.h0}</td>
                        <td className="px-3 py-2 font-mono-phys">{m.range.toFixed(1)}</td>
                        <td className="px-3 py-2 font-mono-phys">{m.maxHeight.toFixed(1)}</td>
                        <td className="px-3 py-2 font-mono-phys">{m.flightTime.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Theory */}
      {activeTab === "theory" && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-[#2eff8c]" />
                Цель работы
              </h3>
              <p className="text-[#c8cdd1] leading-relaxed">
                Экспериментально исследовать траекторию полёта тела, брошенного 
                под углом к горизонту. Определить зависимость дальности полёта, 
                максимальной высоты и времени полёта от начальной скорости и угла броска.
              </p>
            </div>

            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Теоретическая часть</h3>
              <div className="space-y-4 text-[#c8cdd1] leading-relaxed">
                <p>
                  При броске тела под углом α к горизонту с начальной скоростью v₀ 
                  движение разлагается на две независимые составляющие:
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#1a1f22] rounded-lg p-4">
                    <p className="text-xs text-[#798389] uppercase tracking-wider mb-2">По горизонтали (равномерное)</p>
                    <p className="formula-text text-sm">v_x = v₀·cosα = const</p>
                    <p className="formula-text text-sm mt-1">x = v₀·cosα·t</p>
                  </div>
                  <div className="bg-[#1a1f22] rounded-lg p-4">
                    <p className="text-xs text-[#798389] uppercase tracking-wider mb-2">По вертикали (равноускоренное)</p>
                    <p className="formula-text text-sm">v_y = v₀·sinα − gt</p>
                    <p className="formula-text text-sm mt-1">y = h₀ + v₀·sinα·t − gt²/2</p>
                  </div>
                </div>

                <p className="mt-4">
                  <strong className="text-white">Основные формулы:</strong>
                </p>

                <div className="bg-[#1a1f22] rounded-lg p-4 space-y-2">
                  <p className="formula-text">Время полёта: T = (v₀·sinα + √((v₀·sinα)² + 2gh₀)) / g</p>
                  <p className="formula-text">Дальность: L = v₀·cosα · T</p>
                  <p className="formula-text">Макс. высота: H = h₀ + (v₀·sinα)² / 2g</p>
                  <p className="formula-text">При h₀ = 0 и α = 45°: L_max = v₀² / g</p>
                </div>

                <p>
                  Траектория — <strong className="text-white">парабола</strong>. 
                  При угле 45° (без начальной высоты) дальность полёта максимальна.
                </p>
              </div>
            </div>

            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Порядок выполнения</h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Установите параметры", desc: "Задайте начальную скорость v₀ (5-50 м/с), угол броска α (10-80°) и начальную высоту h₀ (0-50 м)." },
                  { step: 2, title: "Запустите симуляцию", desc: "Нажмите «Запустить» и наблюдайте за траекторией полёта. Обратите внимание на вектор скорости." },
                  { step: 3, title: "Запишите результаты", desc: "После завершения полёта нажмите «Записать в таблицу». Сравните с теоретическими значениями." },
                  { step: 4, title: "Исследуйте зависимости", desc: "Проведите серию опытов при разных углах (при постоянном v₀). Постройте график L(α)." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2eff8c] flex items-center justify-center text-black font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-[#c8cdd1]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Protocol */}
      {activeTab === "protocol" && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Бланк протокола</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-[#798389] block mb-1">Название</label>
                  <div className="bg-[#262e33] rounded-lg p-3 text-[#c8cdd1]">
                    Бросок тела под углом к горизонту
                  </div>
                </div>
                <div>
                  <label className="text-[#798389] block mb-1">Цель</label>
                  <div className="bg-[#262e33] rounded-lg p-3 text-[#c8cdd1]">
                    Исследование траектории полёта
                  </div>
                </div>
              </div>
            </div>

            {/* Table 1: L(v0) at constant angle */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h4 className="font-semibold mb-4 text-[#01acff]">
                Таблица 1. Зависимость L(v₀) при α = 45°, h₀ = 0
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#262e33]">
                      <th className="text-left px-3 py-2">№</th>
                      <th className="text-left px-3 py-2">v₀, м/с</th>
                      <th className="text-left px-3 py-2">α, °</th>
                      <th className="text-left px-3 py-2">L_изм, м</th>
                      <th className="text-left px-3 py-2">L_теор = v₀²/g, м</th>
                      <th className="text-left px-3 py-2">H_max, м</th>
                      <th className="text-left px-3 py-2">T, с</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 1, v: 10, a: 45 },
                      { n: 2, v: 20, a: 45 },
                      { n: 3, v: 30, a: 45 },
                      { n: 4, v: 40, a: 45 },
                    ].map((row) => {
                      const measured = measurements.find(
                        (m) => m.v0 === row.v && m.angle === row.a && m.h0 === 0
                      );
                      const lTheor = (row.v * row.v) / G;
                      return (
                        <tr key={row.n} className="border-t border-[#434e54]/50">
                          <td className="px-3 py-2 font-mono-phys">{row.n}</td>
                          <td className="px-3 py-2">{row.v}</td>
                          <td className="px-3 py-2">{row.a}</td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? measured.range.toFixed(1) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono-phys text-[#01acff]">
                            {lTheor.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? measured.maxHeight.toFixed(1) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? measured.flightTime.toFixed(2) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#798389] mt-3">
                * Проведите измерения в симуляторе: v₀ = 10, 20, 30, 40 м/с при α = 45°
              </p>
            </div>

            {/* Table 2: L(alpha) at constant v0 */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h4 className="font-semibold mb-4 text-[#ffcb3d]">
                Таблица 2. Зависимость L(α) при v₀ = 30 м/с, h₀ = 0
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#262e33]">
                      <th className="text-left px-3 py-2">№</th>
                      <th className="text-left px-3 py-2">v₀, м/с</th>
                      <th className="text-left px-3 py-2">α, °</th>
                      <th className="text-left px-3 py-2">L_изм, м</th>
                      <th className="text-left px-3 py-2">L_теор, м</th>
                      <th className="text-left px-3 py-2">H_max, м</th>
                      <th className="text-left px-3 py-2">T, с</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 1, v: 30, a: 15 },
                      { n: 2, v: 30, a: 30 },
                      { n: 3, v: 30, a: 45 },
                      { n: 4, v: 30, a: 60 },
                      { n: 5, v: 30, a: 75 },
                    ].map((row) => {
                      const measured = measurements.find(
                        (m) => m.v0 === row.v && m.angle === row.a && m.h0 === 0
                      );
                      const rad = (row.a * Math.PI) / 180;
                      const lTheor = (row.v * row.v * Math.sin(2 * rad)) / G;
                      return (
                        <tr key={row.n} className="border-t border-[#434e54]/50">
                          <td className="px-3 py-2 font-mono-phys">{row.n}</td>
                          <td className="px-3 py-2">{row.v}</td>
                          <td className="px-3 py-2">{row.a}</td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? measured.range.toFixed(1) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono-phys text-[#ffcb3d]">
                            {lTheor.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? measured.maxHeight.toFixed(1) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? measured.flightTime.toFixed(2) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#798389] mt-3">
                * Проведите измерения в симуляторе: α = 15°, 30°, 45°, 60°, 75° при v₀ = 30 м/с
              </p>
            </div>

            {/* Conclusion */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h4 className="font-semibold mb-3">Вывод</h4>
              <div className="bg-[#262e33] rounded-lg p-4 text-sm text-[#c8cdd1] leading-relaxed">
                В ходе работы исследована траектория тела, брошенного под углом к горизонту. 
                Установлено, что дальность полёта зависит от начальной скорости (квадратично) 
                и угла броска (максимум при α ≈ 45° при h₀ = 0). Траектория полёта имеет 
                форму параболы, что подтверждает теоретические выводы.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
