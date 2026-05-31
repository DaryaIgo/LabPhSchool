import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, RotateCcw, Plus, BookOpen, FileText, Beaker, Download } from "lucide-react";
import { Link } from "react-router";
import { generateProtocolPDF } from "@/components/ProtocolPDF";
import { getLabBySlug } from "@/data/labs";

type Tab = "sim" | "theory" | "protocol";
type Measurement = {
  id: number;
  length: number;
  mass: number;
  angle: number;
  period: number;
  periodSq: number;
};

const G = 9.81;

/* ================================================================
   FULL PENDULUM SIMULATION — Study of oscillations
   ================================================================ */
export default function LabPendulum() {
  const [activeTab, setActiveTab] = useState<Tab>("sim");

  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      {/* Header */}
      <section className="bg-[#262e33] border-b border-white/5 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/labs"
            className="inline-flex items-center gap-2 text-sm text-[#798389] hover:text-[#2eff8c] transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Ко всем лабораторным
          </Link>
          <p className="formula-text text-sm mb-3">T = 2π√(l/g)</p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4">
            Изучение колебаний математического маятника
          </h1>
          <p className="text-[#c8cdd1] max-w-3xl">
            Исследуйте зависимость периода колебаний математического маятника
            от длины нити, массы груза и амплитуды. Определите ускорение
            свободного падения экспериментально.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-white/5 bg-[#1a1f22]">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {[
            { key: "sim" as Tab, label: "Симуляция", icon: Beaker },
            { key: "theory" as Tab, label: "Теория", icon: BookOpen },
            { key: "protocol" as Tab, label: "Протокол", icon: FileText },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === t.key
                  ? "text-[#2eff8c] border-[#2eff8c] bg-[#2eff8c]/5"
                  : "text-[#798389] border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6">
          {activeTab === "sim" && <SimulationTab />}
          {activeTab === "theory" && <TheoryTab />}
          {activeTab === "protocol" && <ProtocolTab />}
        </div>
      </section>
    </div>
  );
}

/* ================================================================
   SIMULATION TAB
   ================================================================ */
function SimulationTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState(2.0);
  const [mass, setMass] = useState(1.0);
  const [angle, setAngle] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const animRef = useRef(0);
  const timeRef = useRef(0);
  const bobTrailRef = useRef<{ x: number; y: number }[]>([]);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [nextId, setNextId] = useState(1);

  // Theoretical period (small-angle approximation)
  const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / G);

  const drawScene = useCallback(
    (currentAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Background — textbook style
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, W, H);

      const originX = W / 2;
      const originY = 60;
      const pxPerM = 90;
      const lenPx = Math.min(length * pxPerM, H - 120);

      // Pivot support structure
      ctx.fillStyle = "#434e54";
      ctx.fillRect(originX - 40, originY - 15, 80, 15);
      ctx.fillRect(originX - 5, originY, 10, 8);

      // Pivot point
      ctx.fillStyle = "#c8cdd1";
      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#798389";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bob position
      const bobX = originX + lenPx * Math.sin(currentAngle);
      const bobY = originY + lenPx * Math.cos(currentAngle);

      // Trail
      bobTrailRef.current.push({ x: bobX, y: bobY });
      if (bobTrailRef.current.length > 80) bobTrailRef.current.shift();

      if (bobTrailRef.current.length > 1) {
        ctx.strokeStyle = "rgba(46,255,140,0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bobTrailRef.current[0].x, bobTrailRef.current[0].y);
        for (let i = 1; i < bobTrailRef.current.length; i++) {
          ctx.lineTo(bobTrailRef.current[i].x, bobTrailRef.current[i].y);
        }
        ctx.stroke();
      }

      // String
      ctx.strokeStyle = "#c8cdd1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Bob
      const bobRadius = 10 + mass * 4;
      const bobGrad = ctx.createRadialGradient(
        bobX - bobRadius / 3,
        bobY - bobRadius / 3,
        1,
        bobX,
        bobY,
        bobRadius
      );
      bobGrad.addColorStop(0, "#5effa8");
      bobGrad.addColorStop(1, "#2eff8c");
      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bob highlight
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(bobX - bobRadius / 4, bobY - bobRadius / 4, bobRadius / 3, 0, Math.PI * 2);
      ctx.fill();

      // Arc showing angle
      if (!isRunning || Math.abs(currentAngle) > 0.01) {
        ctx.strokeStyle = "rgba(46,255,140,0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(
          originX,
          originY,
          40,
          Math.PI / 2 - Math.abs(currentAngle),
          Math.PI / 2 + Math.abs(currentAngle)
        );
        ctx.stroke();
        ctx.setLineDash([]);

        // Angle label
        const labelAngle = Math.PI / 2 + currentAngle * 0.5;
        const labelR = 55;
        ctx.fillStyle = "#2eff8c";
        ctx.font = "11px monospace";
        ctx.fillText(
          `${(Math.abs(currentAngle) * (180 / Math.PI)).toFixed(1)}°`,
          originX + labelR * Math.sin(labelAngle) - 12,
          originY + labelR * Math.cos(labelAngle)
        );
      }

      // Length label
      ctx.strokeStyle = "#798389";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const labelX = originX + lenPx + bobRadius + 20;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(labelX, originY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bobX, bobY);
      ctx.lineTo(labelX, bobY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#c8cdd1";
      ctx.font = "12px monospace";
      ctx.fillText(`l = ${length.toFixed(1)} м`, labelX + 5, (originY + bobY) / 2 + 4);

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.strokeStyle = "#434e54";
      ctx.lineWidth = 1;
      ctx.fillRect(15, H - 115, 220, 100);
      ctx.strokeRect(15, H - 115, 220, 100);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText("Измерения:", 25, H - 95);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "12px monospace";
      ctx.fillText(`Tтеор = ${theoreticalPeriod.toFixed(2)} с`, 25, H - 78);
      ctx.fillText(`t = ${elapsedTime.toFixed(2)} с`, 25, H - 62);
      ctx.fillText(`N = ${cycleCount} колеб.`, 25, H - 46);
      if (cycleCount > 0) {
        const expT = elapsedTime / cycleCount;
        ctx.fillText(`Tэксп = ${expT.toFixed(2)} с`, 25, H - 30);
      }

      // Mass label near bob
      ctx.fillStyle = "#c8cdd1";
      ctx.font = "10px monospace";
      ctx.fillText(`${mass.toFixed(1)} кг`, bobX - 15, bobY + bobRadius + 16);
    },
    [length, mass, isRunning, elapsedTime, cycleCount, theoreticalPeriod]
  );

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;

    const startAngle = (angle * Math.PI) / 180;

    if (!isRunning) {
      drawScene(startAngle);
      return;
    }

    const omega = Math.sqrt(G / length);
    const startTime = performance.now();
    timeRef.current = 0;
    bobTrailRef.current = [];

    const animate = (now: number) => {
      const t = (now - startTime) / 1000;
      timeRef.current = t;

      // Damped oscillation
      const dampingFactor = 0.995;
      const currentAngle =
        startAngle * Math.pow(dampingFactor, t * 60) * Math.cos(omega * t);

      setElapsedTime(t);
      setCycleCount(Math.floor((omega * t) / (2 * Math.PI)));

      drawScene(currentAngle);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, length, angle, drawScene]);

  // Static draw when not running
  useEffect(() => {
    if (!isRunning) {
      const startAngle = (angle * Math.PI) / 180;
      drawScene(startAngle);
    }
  }, [length, mass, angle, isRunning, drawScene]);

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCycleCount(0);
    setElapsedTime(0);
    bobTrailRef.current = [];
  };

  const reset = () => {
    setIsRunning(false);
    setCycleCount(0);
    setElapsedTime(0);
    bobTrailRef.current = [];
    const startAngle = (angle * Math.PI) / 180;
    drawScene(startAngle);
  };

  const addMeasurement = () => {
    if (cycleCount === 0) return;
    const expPeriod = elapsedTime / cycleCount;
    const newMeasurement: Measurement = {
      id: nextId,
      length,
      mass,
      angle,
      period: expPeriod,
      periodSq: expPeriod * expPeriod,
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
    setNextId((prev) => prev + 1);
  };

  const deleteMeasurement = (id: number) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const expPeriod = cycleCount > 0 ? elapsedTime / cycleCount : 0;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border border-[#434e54]"
            style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
            <h4 className="font-semibold mb-4">Параметры</h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#798389] block mb-2">
                  Длина нити: {length.toFixed(1)} м
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.1}
                  value={length}
                  onChange={(e) => {
                    setLength(parseFloat(e.target.value));
                    if (isRunning) {
                      setIsRunning(false);
                      setCycleCount(0);
                      setElapsedTime(0);
                    }
                  }}
                  className="w-full accent-[#2eff8c]"
                />
              </div>

              <div>
                <label className="text-xs text-[#798389] block mb-2">
                  Масса груза: {mass.toFixed(1)} кг
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={mass}
                  onChange={(e) => {
                    setMass(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#2eff8c]"
                />
              </div>

              <div>
                <label className="text-xs text-[#798389] block mb-2">
                  Начальный угол: {angle}°
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={angle}
                  onChange={(e) => {
                    setAngle(parseInt(e.target.value));
                    if (isRunning) {
                      setIsRunning(false);
                      setCycleCount(0);
                      setElapsedTime(0);
                    }
                  }}
                  className="w-full accent-[#ffcb3d]"
                />
                <p className="text-[10px] text-[#798389] mt-1">
                  {angle <= 15
                    ? "✓ Малый угол — приближение T = 2π√(l/g)"
                    : "⚠ Большой угол — наблюдается нелинейность"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={startSimulation}
                disabled={isRunning}
                className="flex-1 btn-lime flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play size={16} />
                {isRunning ? "Идёт..." : "Запустить"}
              </button>
              <button onClick={reset} className="btn-outline px-4">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Live results */}
          <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">Результаты</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#798389]">Теор. период:</span>
                <span className="font-mono-phys text-[#2eff8c]">
                  {theoreticalPeriod.toFixed(2)} с
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Колебаний:</span>
                <span className="font-mono-phys">{cycleCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Время:</span>
                <span className="font-mono-phys">{elapsedTime.toFixed(2)} с</span>
              </div>
              {cycleCount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#798389]">Эксп. период:</span>
                    <span className="font-mono-phys text-[#2eff8c]">
                      {expPeriod.toFixed(2)} с
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#798389]">Погрешность:</span>
                    <span className="font-mono-phys">
                      {(
                        (Math.abs(expPeriod - theoreticalPeriod) /
                          theoreticalPeriod) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={addMeasurement}
            disabled={cycleCount === 0}
            className="w-full btn-lime flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} />
            Добавить в таблицу
          </button>
        </div>
      </div>

      {/* Measurements table */}
      {measurements.length > 0 && (
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h4 className="font-semibold mb-4">Таблица измерений</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#434e54]">
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">№</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">
                    l, м
                  </th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">
                    m, кг
                  </th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">
                    α, °
                  </th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">
                    T, с
                  </th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">
                    T², с²
                  </th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-2 px-3 font-mono-phys">{m.id}</td>
                    <td className="py-2 px-3 font-mono-phys">
                      {m.length.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 font-mono-phys">
                      {m.mass.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 font-mono-phys">{m.angle}</td>
                    <td className="py-2 px-3 font-mono-phys text-[#2eff8c]">
                      {m.period.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 font-mono-phys">
                      {m.periodSq.toFixed(2)}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => deleteMeasurement(m.id)}
                        className="text-[#ff6b6b] hover:text-[#ff6b6b]/70 text-xs"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   THEORY TAB
   ================================================================ */
function TheoryTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Математический маятник</h3>
          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            <strong>Математический маятник</strong> — это идеализированная модель,
            представляющая собой материальную точку, подвешенную на невесомой
            нерастяжимой нити. В реальных условиях это приближённо соответствует
            небольшому массивному шару на тонкой лёгкой нити.
          </p>

          <div className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-5 my-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">
              Период малых колебаний
            </h4>
            <p className="formula-text text-center my-4 text-lg">
              T = 2π√(l/g)
            </p>
            <p className="text-sm text-[#c8cdd1] mt-3">
              где <strong className="text-white">l</strong> — длина нити (м),{" "}
              <strong className="text-white">g</strong> — ускорение свободного
              падения (м/с²).
            </p>
          </div>

          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            Для <strong>малых углов отклонения</strong> (α ≤ 15°) период колебаний
            не зависит от амплитуды — это свойство называется{" "}
            <strong className="text-[#2eff8c]">изохронностью</strong>. При больших
            углах наблюдается зависимость периода от амплитуды.
          </p>

          <div className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-5 my-5">
            <h4 className="font-semibold text-[#01acff] mb-3">
              Определение ускорения свободного падения
            </h4>
            <p className="text-sm text-[#c8cdd1] mb-3">
              Возведя формулу периода в квадрат, получаем:
            </p>
            <p className="formula-text text-center my-3">T² = 4π² · l/g</p>
            <p className="text-sm text-[#c8cdd1] mb-3">
              Отсюда ускорение свободного падения:
            </p>
            <p className="formula-text text-center my-3">g = 4π² · l/T²</p>
            <p className="text-sm text-[#c8cdd1] mt-3">
              Построив график зависимости <strong>T²(l)</strong>, по угловому
              коэффициенту прямой k = ΔT²/Δl можно найти:
            </p>
            <p className="formula-text text-center my-3">g = 4π²/k</p>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">
            Условия применимости формулы
          </h3>
          <ul className="space-y-3 text-[#c8cdd1]">
            {[
              "Угол отклонения не превышает 10–15° (sin α ≈ α)",
              "Нить невесома и нерастяжима",
              "Размеры груза много меньше длины нити (груз — материальная точка)",
              "Колебания происходят в одной плоскости",
              "Сопротивление воздуха пренебрежимо мало",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#2eff8c] mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">
            Зависимость периода от параметров
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                param: "Длина нити l",
                relation: "T ∝ √l",
                desc: "Период пропорционален корню из длины",
                color: "#2eff8c",
              },
              {
                param: "Масса груза m",
                relation: "T не зависит от m",
                desc: "При прочих равных масса не влияет",
                color: "#01acff",
              },
              {
                param: "Амплитуда α",
                relation: "T ≈ const (при малых α)",
                desc: "Изохронность малых колебаний",
                color: "#ffcb3d",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-4"
              >
                <h4 className="font-semibold mb-2" style={{ color: card.color }}>
                  {card.param}
                </h4>
                <p className="formula-text text-sm mb-2">{card.relation}</p>
                <p className="text-xs text-[#798389]">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Ключевые формулы</h4>
          <div className="space-y-3 text-sm">
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Период</p>
              <p className="formula-text">T = 2π√(l/g)</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Частота</p>
              <p className="formula-text">ν = 1/T = (1/2π)√(g/l)</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Угловая частота</p>
              <p className="formula-text">ω = √(g/l)</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Ускорение g</p>
              <p className="formula-text">g = 4π²l/T²</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#2eff8c]/20 rounded-xl p-5">
          <h4 className="font-semibold text-[#2eff8c] mb-3">Порядок работы</h4>
          <ol className="space-y-2 text-sm text-[#c8cdd1]">
            {[
              "Установите длину нити",
              "Задайте начальный угол отклонения (5–15°)",
              "Запустите колебания",
              "Засеките время 10–20 колебаний",
              "Вычислите период T = t/N",
              "Повторите для разных длин",
              "Постройте график T²(l)",
              "Определите g по угловому коэффициенту",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#2eff8c] font-mono text-xs mt-0.5">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PROTOCOL TAB
   ================================================================ */
function ProtocolTab() {
  const [protocolData, setProtocolData] = useState<
    { length: number; period: number; periodSq: number }[]
  >([
    { length: 0.5, period: 1.42, periodSq: 2.02 },
    { length: 1.0, period: 2.01, periodSq: 4.04 },
    { length: 1.5, period: 2.46, periodSq: 6.05 },
    { length: 2.0, period: 2.84, periodSq: 8.07 },
    { length: 2.5, period: 3.17, periodSq: 10.05 },
    { length: 3.0, period: 3.48, periodSq: 12.11 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate g from linear regression
  const calculateG = () => {
    const n = protocolData.length;
    if (n < 2) return 0;

    let sumL = 0,
      sumT2 = 0,
      sumLT2 = 0,
      sumL2 = 0;
    for (const d of protocolData) {
      sumL += d.length;
      sumT2 += d.periodSq;
      sumLT2 += d.length * d.periodSq;
      sumL2 += d.length * d.length;
    }

    const slope = (n * sumLT2 - sumL * sumT2) / (n * sumL2 - sumL * sumL);
    return (4 * Math.PI * Math.PI) / slope;
  };

  const gValue = calculateG();
  const gError = Math.abs((gValue - G) / G) * 100;

  // Draw graph T²(l)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1f22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padL = 60,
      padR = 40,
      padT = 30,
      padB = 50;
    const graphW = canvas.width - padL - padR;
    const graphH = canvas.height - padT - padB;

    const maxL = Math.max(...protocolData.map((d) => d.length)) * 1.1;
    const maxT2 = Math.max(...protocolData.map((d) => d.periodSq)) * 1.1;

    const toX = (l: number) => padL + (l / maxL) * graphW;
    const toY = (t2: number) => padT + graphH - (t2 / maxT2) * graphH;

    // Grid
    ctx.strokeStyle = "rgba(67,78,84,0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = padL + (i / 5) * graphW;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + graphH);
      ctx.stroke();

      const lVal = (i / 5) * maxL;
      ctx.fillStyle = "#798389";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(lVal.toFixed(1), x, padT + graphH + 18);
    }

    for (let i = 0; i <= 5; i++) {
      const y = padT + (i / 5) * graphH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + graphW, y);
      ctx.stroke();

      const t2Val = (1 - i / 5) * maxT2;
      ctx.fillStyle = "#798389";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(t2Val.toFixed(1), padL - 8, y + 4);
    }

    // Axes
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + graphH);
    ctx.lineTo(padL + graphW, padT + graphH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#c8cdd1";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("l, м", padL + graphW / 2, canvas.height - 8);

    ctx.save();
    ctx.translate(15, padT + graphH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("T², с²", 0, 0);
    ctx.restore();

    // Linear regression line
    const n = protocolData.length;
    let sumL = 0,
      sumT2 = 0,
      sumLT2 = 0,
      sumL2 = 0;
    for (const d of protocolData) {
      sumL += d.length;
      sumT2 += d.periodSq;
      sumLT2 += d.length * d.periodSq;
      sumL2 += d.length * d.length;
    }

    const slope = (n * sumLT2 - sumL * sumT2) / (n * sumL2 - sumL * sumL);
    const intercept = (sumT2 - slope * sumL) / n;

    ctx.strokeStyle = "rgba(46,255,140,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(intercept));
    ctx.lineTo(toX(maxL), toY(slope * maxL + intercept));
    ctx.stroke();
    ctx.setLineDash([]);

    // Data points
    for (const d of protocolData) {
      const px = toX(d.length);
      const py = toY(d.periodSq);

      // Glow
      ctx.fillStyle = "rgba(46,255,140,0.2)";
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fill();

      // Point
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Value label
      ctx.fillStyle = "#c8cdd1";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(d.periodSq.toFixed(1), px, py - 14);
    }

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("График зависимости T² от l", padL + graphW / 2, 20);
  }, [protocolData]);

  const updateValue = (
    index: number,
    field: "length" | "period" | "periodSq",
    value: number
  ) => {
    setProtocolData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Protocol Table */}
      <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Протокол измерений
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#434e54]">
                <th className="text-left py-3 px-4 text-[#798389] font-medium">№</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">
                  Длина нити l, м
                </th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">
                  Период T, с
                </th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">
                  T², с²
                </th>
              </tr>
            </thead>
            <tbody>
              {protocolData.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-2 px-4 font-mono-phys">{i + 1}</td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      step={0.1}
                      value={row.length}
                      onChange={(e) =>
                        updateValue(i, "length", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      step={0.01}
                      value={row.period}
                      onChange={(e) =>
                        updateValue(i, "period", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      step={0.01}
                      value={row.periodSq}
                      onChange={(e) =>
                        updateValue(i, "periodSq", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#798389] mt-3">
          * Редактируйте значения в таблице, чтобы обновить график
        </p>
      </div>

      {/* Graph */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border border-[#434e54]"
            style={{ maxWidth: 600, height: "auto", aspectRatio: "3/2" }}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">Расчёт g</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#798389]">g (график):</span>
                <span className="font-mono-phys text-[#2eff8c]">
                  {gValue.toFixed(2)} м/с²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Табличное:</span>
                <span className="font-mono-phys">{G.toFixed(2)} м/с²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Погрешность:</span>
                <span
                  className={`font-mono-phys ${
                    gError < 5 ? "text-[#2eff8c]" : gError < 10 ? "text-[#ffcb3d]" : "text-[#ff6b6b]"
                  }`}
                >
                  {gError.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
            <h4 className="font-semibold mb-3">Выводы</h4>
            <div className="space-y-2 text-sm text-[#c8cdd1]">
              <p>
                1. Период колебаний прямо пропорционален корню квадратному из
                длины нити.
              </p>
              <p>
                2. Период не зависит от массы груза (при малых углах).
              </p>
              <p>
                3. График T²(l) является прямой линией, проходящей через начало
                координат.
              </p>
              <p>
                4. По угловому коэффициенту графика определено ускорение
                свободного падения g ≈{" "}
                <span className="text-[#2eff8c] font-mono-phys">
                  {gValue.toFixed(2)} м/с²
                </span>
                .
              </p>
            </div>
          </div>

          {/* Download PDF */}
          <button
            onClick={() => {
              const lab = getLabBySlug("pendulum");
              if (!lab) return;
              generateProtocolPDF(lab, {
                studentName: "Ученик",
                date: new Date().toLocaleDateString("ru-RU"),
                measurements: protocolData.map((m, i) => ({
                  n: String(i + 1),
                  l: String(m.length),
                  t10: String((m.period * 10).toFixed(2)),
                  t: String(m.period.toFixed(3)),
                  t2: String(m.periodSq.toFixed(3)),
                })),
                conclusion: `В ходе работы была исследована зависимость периода колебаний математического маятника от длины нити. Ускорение свободного падения: g = ${gValue.toFixed(2)} м/с².`,
              });
            }}
            className="w-full btn-lime flex items-center justify-center gap-2 py-3 text-base"
          >
            <Download size={18} />
            Скачать протокол (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
