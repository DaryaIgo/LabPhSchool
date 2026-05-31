import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, RotateCcw, Plus, BookOpen, FileText, Beaker } from "lucide-react";
import { Link } from "react-router";

type Tab = "sim" | "theory" | "protocol";
type Measurement = {
  id: number;
  mass: number;
  stiffness: number;
  period: number;
  periodSq: number;
};

/* ================================================================
   SPRING PENDULUM LAB — Study of spring oscillations
   ================================================================ */
export default function LabSpringPendulum() {
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
          <p className="formula-text text-sm mb-3">T = 2π√(m/k)</p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4">
            Изучение колебаний пружинного маятника
          </h1>
          <p className="text-[#c8cdd1] max-w-3xl">
            Исследуйте зависимость периода колебаний груза на пружине от массы
            груза и жёсткости пружины. Проверьте закон сохранения энергии
            в колебательной системе.
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
  const [mass, setMass] = useState(1.0);
  const [stiffness, setStiffness] = useState(20);
  const [amplitude, setAmplitude] = useState(0.5);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [nextId, setNextId] = useState(1);

  const omega = Math.sqrt(stiffness / mass);
  const theoreticalPeriod = (2 * Math.PI) / omega;
  const frequency = 1 / theoreticalPeriod;

  const drawScene = useCallback(
    (displacement: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, W, H);

      const originX = W / 2;
      const ceilingY = 50;
      const eqY = ceilingY + 150;
      const maxDispPx = 100;
      const dispPx = displacement * maxDispPx;
      const bobY = eqY + dispPx;

      const bobRadius = 12 + mass * 5;
      const springWidth = 30;
      const numCoils = 12;

      // Ceiling support
      ctx.fillStyle = "#434e54";
      ctx.fillRect(originX - 60, ceilingY - 15, 120, 15);
      for (let i = -50; i <= 50; i += 10) {
        ctx.beginPath();
        ctx.moveTo(originX + i, ceilingY);
        ctx.lineTo(originX + i - 5, ceilingY + 12);
        ctx.strokeStyle = "#798389";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Spring (zigzag)
      const springTop = ceilingY;
      const springBottom = bobY - bobRadius;
      const springH = springBottom - springTop;
      const segH = springH / numCoils;

      ctx.strokeStyle = "#c8cdd1";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(originX, springTop);
      for (let i = 0; i < numCoils; i++) {
        const y = springTop + i * segH;
        const nextY = springTop + (i + 1) * segH;
        const midY = (y + nextY) / 2;
        ctx.quadraticCurveTo(
          originX + (i % 2 === 0 ? springWidth / 2 : -springWidth / 2),
          midY,
          originX,
          nextY
        );
      }
      ctx.stroke();

      // Equilibrium line
      ctx.strokeStyle = "rgba(46,255,140,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(originX - 80, eqY);
      ctx.lineTo(originX + 80, eqY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "10px monospace";
      ctx.fillText("положение равновесия", originX + 85, eqY + 4);

      // Bob
      const bobGrad = ctx.createRadialGradient(
        originX - bobRadius / 3,
        bobY - bobRadius / 3,
        1,
        originX,
        bobY,
        bobRadius
      );
      bobGrad.addColorStop(0, "#5effa8");
      bobGrad.addColorStop(1, "#2eff8c");
      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(originX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(originX - bobRadius / 4, bobY - bobRadius / 4, bobRadius / 3, 0, Math.PI * 2);
      ctx.fill();

      // Mass label
      ctx.fillStyle = "#c8cdd1";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${mass.toFixed(1)} кг`, originX, bobY + bobRadius + 18);

      // Displacement arrow
      if (Math.abs(displacement) > 0.02) {
        const arrowDir = displacement > 0 ? 1 : -1;
        const arrowStart = bobY;
        const arrowEnd = eqY;
        ctx.strokeStyle = "#01acff";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(originX + bobRadius + 25, arrowStart);
        ctx.lineTo(originX + bobRadius + 25, arrowEnd);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(originX + bobRadius + 20, arrowEnd + arrowDir * 8);
        ctx.lineTo(originX + bobRadius + 25, arrowEnd);
        ctx.lineTo(originX + bobRadius + 30, arrowEnd + arrowDir * 8);
        ctx.stroke();

        ctx.fillStyle = "#01acff";
        ctx.font = "10px monospace";
        ctx.fillText(
          `x = ${(displacement * amplitude).toFixed(2)} м`,
          originX + bobRadius + 40,
          (arrowStart + arrowEnd) / 2 + 4
        );
      }

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.strokeStyle = "#434e54";
      ctx.lineWidth = 1;
      ctx.fillRect(15, H - 130, 230, 115);
      ctx.strokeRect(15, H - 130, 230, 115);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText("Измерения:", 25, H - 110);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "12px monospace";
      ctx.fillText(`Tтеор = ${theoreticalPeriod.toFixed(3)} с`, 25, H - 93);
      ctx.fillText(`f = ${frequency.toFixed(2)} Гц`, 25, H - 77);
      ctx.fillText(`t = ${elapsedTime.toFixed(2)} с`, 25, H - 61);
      ctx.fillText(`N = ${cycleCount} колеб.`, 25, H - 45);
      if (cycleCount > 0) {
        const expT = elapsedTime / cycleCount;
        ctx.fillText(`Tэксп = ${expT.toFixed(3)} с`, 25, H - 29);
      }

      ctx.textAlign = "left";
    },
    [mass, stiffness, amplitude, isRunning, elapsedTime, cycleCount, theoreticalPeriod, frequency]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;

    if (!isRunning) {
      drawScene(amplitude);
      return;
    }

    const omega = Math.sqrt(stiffness / mass);
    const startTime = performance.now();
    timeRef.current = 0;

    const animate = (now: number) => {
      const t = (now - startTime) / 1000;
      timeRef.current = t;

      const dampingFactor = 0.998;
      const currentDisp =
        amplitude * Math.pow(dampingFactor, t * 60) * Math.cos(omega * t);

      setElapsedTime(t);
      setCycleCount(Math.floor((omega * t) / (2 * Math.PI)));

      drawScene(currentDisp);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, mass, stiffness, amplitude, drawScene]);

  useEffect(() => {
    if (!isRunning) {
      drawScene(amplitude);
    }
  }, [mass, stiffness, amplitude, isRunning, drawScene]);

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCycleCount(0);
    setElapsedTime(0);
  };

  const reset = () => {
    setIsRunning(false);
    setCycleCount(0);
    setElapsedTime(0);
    drawScene(amplitude);
  };

  const addMeasurement = () => {
    if (cycleCount === 0) return;
    const expPeriod = elapsedTime / cycleCount;
    const newMeasurement: Measurement = {
      id: nextId,
      mass,
      stiffness,
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
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border border-[#434e54]"
            style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
            <h4 className="font-semibold mb-4">Параметры</h4>

            <div className="space-y-4">
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
                    if (isRunning) { setIsRunning(false); setCycleCount(0); setElapsedTime(0); }
                  }}
                  className="w-full accent-[#2eff8c]"
                />
              </div>

              <div>
                <label className="text-xs text-[#798389] block mb-2">
                  Жёсткость пружины: {stiffness} Н/м
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={stiffness}
                  onChange={(e) => {
                    setStiffness(parseInt(e.target.value));
                    if (isRunning) { setIsRunning(false); setCycleCount(0); setElapsedTime(0); }
                  }}
                  className="w-full accent-[#01acff]"
                />
              </div>

              <div>
                <label className="text-xs text-[#798389] block mb-2">
                  Амплитуда: {amplitude.toFixed(1)} м
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={amplitude}
                  onChange={(e) => {
                    setAmplitude(parseFloat(e.target.value));
                    if (isRunning) { setIsRunning(false); setCycleCount(0); setElapsedTime(0); }
                  }}
                  className="w-full accent-[#ffcb3d]"
                />
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

          <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">Результаты</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#798389]">Теор. период:</span>
                <span className="font-mono-phys text-[#2eff8c]">
                  {theoreticalPeriod.toFixed(3)} с
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Частота:</span>
                <span className="font-mono-phys">{frequency.toFixed(2)} Гц</span>
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
                      {expPeriod.toFixed(3)} с
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

      {measurements.length > 0 && (
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h4 className="font-semibold mb-4">Таблица измерений</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#434e54]">
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">№</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">m, кг</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">k, Н/м</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">T, с</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">T², с²</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 font-mono-phys">{m.id}</td>
                    <td className="py-2 px-3 font-mono-phys">{m.mass.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono-phys">{m.stiffness}</td>
                    <td className="py-2 px-3 font-mono-phys text-[#2eff8c]">
                      {m.period.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 font-mono-phys">{m.periodSq.toFixed(3)}</td>
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
          <h3 className="text-xl font-semibold mb-4">Пружинный маятник</h3>
          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            <strong>Пружинный маятник</strong> — система, состоящая из груза,
            подвешенного на пружине, совершающего колебания под действием силы
            упругости. При малых отклонениях от положения равновесия колебания
            являются гармоническими.
          </p>

          <div className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-5 my-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">Период колебаний</h4>
            <p className="formula-text text-center my-4 text-lg">
              T = 2π√(m/k)
            </p>
            <p className="text-sm text-[#c8cdd1] mt-3">
              где <strong className="text-white">m</strong> — масса груза (кг),{" "}
              <strong className="text-white">k</strong> — коэффициент жёсткости
              пружины (Н/м).
            </p>
          </div>

          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            Ключевое отличие от математического маятника: период пружинного
            маятника <strong className="text-[#2eff8c]">не зависит от g</strong>{" "}
            и может быть изменен в широких пределах подбором массы и жёсткости.
          </p>

          <div className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-5 my-5">
            <h4 className="font-semibold text-[#01acff] mb-3">
              Закон сохранения энергии
            </h4>
            <p className="text-sm text-[#c8cdd1] mb-3">
              Полная механическая энергия пружинного маятника:
            </p>
            <p className="formula-text text-center my-3">E = kx²/2 + mv²/2</p>
            <p className="text-sm text-[#c8cdd1] mt-3">
              В отсутствие трения полная энергия сохраняется: в точках максимального
              отклонения — полностью потенциальная, в положении равновесия —
              полностью кинетическая.
            </p>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Уравнение движения</h3>
          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            Вторая закон Ньютона для груза на пружине:
          </p>
          <p className="formula-text text-center my-3">ma = −kx</p>
          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            Это дифференциальное уравнение гармонических колебаний. Его решение:
          </p>
          <p className="formula-text text-center my-3">
            x(t) = A·cos(ωt + φ₀)
          </p>
          <p className="text-sm text-[#c8cdd1]">
            где <strong className="text-white">A</strong> — амплитуда,{" "}
            <strong className="text-white">ω = √(k/m)</strong> — угловая частота,
            {" "}
            <strong className="text-white">φ₀</strong> — начальная фаза.
          </p>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Зависимость периода от параметров</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                param: "Масса груза m",
                relation: "T ∝ √m",
                desc: "Период растёт с увеличением массы",
                color: "#2eff8c",
              },
              {
                param: "Жёсткость пружины k",
                relation: "T ∝ 1/√k",
                desc: "Период уменьшается с ростом жёсткости",
                color: "#01acff",
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

      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Ключевые формулы</h4>
          <div className="space-y-3 text-sm">
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Период</p>
              <p className="formula-text">T = 2π√(m/k)</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Частота</p>
              <p className="formula-text">ν = (1/2π)√(k/m)</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Угловая частота</p>
              <p className="formula-text">ω = √(k/m)</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Потенциальная энергия</p>
              <p className="formula-text">Eₚ = kx²/2</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Кинетическая энергия</p>
              <p className="formula-text">Eₖ = mv²/2</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Полная энергия</p>
              <p className="formula-text">E = kA²/2</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#2eff8c]/20 rounded-xl p-5">
          <h4 className="font-semibold text-[#2eff8c] mb-3">Порядок работы</h4>
          <ol className="space-y-2 text-sm text-[#c8cdd1]">
            {[
              "Установите массу груза и жёсткость пружины",
              "Задайте начальную амплитуду отклонения",
              "Запустите колебания",
              "Засеките время 10–20 полных колебаний",
              "Вычислите период T = t/N",
              "Повторите для разных масс при постоянной k",
              "Постройте график T²(m)",
              "Определите k по угловому коэффициенту",
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
    { mass: number; period: number; periodSq: number }[]
  >([
    { mass: 0.2, period: 0.628, periodSq: 0.394 },
    { mass: 0.5, period: 0.993, periodSq: 0.986 },
    { mass: 1.0, period: 1.405, periodSq: 1.974 },
    { mass: 1.5, period: 1.720, periodSq: 2.958 },
    { mass: 2.0, period: 1.986, periodSq: 3.944 },
    { mass: 3.0, period: 2.432, periodSq: 5.915 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculateK = () => {
    const n = protocolData.length;
    if (n < 2) return 0;

    let sumM = 0, sumT2 = 0, sumMT2 = 0, sumM2 = 0;
    for (const d of protocolData) {
      sumM += d.mass;
      sumT2 += d.periodSq;
      sumMT2 += d.mass * d.periodSq;
      sumM2 += d.mass * d.mass;
    }

    const slope = (n * sumMT2 - sumM * sumT2) / (n * sumM2 - sumM * sumM);
    return (4 * Math.PI * Math.PI) / slope;
  };

  const kValue = calculateK();

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

    const padL = 60, padR = 40, padT = 30, padB = 50;
    const graphW = canvas.width - padL - padR;
    const graphH = canvas.height - padT - padB;

    const maxM = Math.max(...protocolData.map((d) => d.mass)) * 1.2;
    const maxT2 = Math.max(...protocolData.map((d) => d.periodSq)) * 1.1;

    const toX = (m: number) => padL + (m / maxM) * graphW;
    const toY = (t2: number) => padT + graphH - (t2 / maxT2) * graphH;

    // Grid
    ctx.strokeStyle = "rgba(67,78,84,0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = padL + (i / 5) * graphW;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + graphH); ctx.stroke();
      const mVal = (i / 5) * maxM;
      ctx.fillStyle = "#798389"; ctx.font = "10px monospace"; ctx.textAlign = "center";
      ctx.fillText(mVal.toFixed(1), x, padT + graphH + 18);
    }
    for (let i = 0; i <= 5; i++) {
      const y = padT + (i / 5) * graphH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + graphW, y); ctx.stroke();
      const t2Val = (1 - i / 5) * maxT2;
      ctx.fillStyle = "#798389"; ctx.font = "10px monospace"; ctx.textAlign = "right";
      ctx.fillText(t2Val.toFixed(1), padL - 8, y + 4);
    }

    // Axes
    ctx.strokeStyle = "#c8cdd1"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + graphH);
    ctx.lineTo(padL + graphW, padT + graphH); ctx.stroke();

    ctx.fillStyle = "#c8cdd1"; ctx.font = "12px monospace"; ctx.textAlign = "center";
    ctx.fillText("m, кг", padL + graphW / 2, canvas.height - 8);
    ctx.save();
    ctx.translate(15, padT + graphH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText("T², с²", 0, 0); ctx.restore();

    // Regression line
    const n = protocolData.length;
    let sumM = 0, sumT2 = 0, sumMT2 = 0, sumM2 = 0;
    for (const d of protocolData) {
      sumM += d.mass; sumT2 += d.periodSq;
      sumMT2 += d.mass * d.periodSq; sumM2 += d.mass * d.mass;
    }
    const slope = (n * sumMT2 - sumM * sumT2) / (n * sumM2 - sumM * sumM);
    const intercept = (sumT2 - slope * sumM) / n;

    ctx.strokeStyle = "rgba(46,255,140,0.5)"; ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(intercept));
    ctx.lineTo(toX(maxM), toY(slope * maxM + intercept));
    ctx.stroke(); ctx.setLineDash([]);

    // Points
    for (const d of protocolData) {
      const px = toX(d.mass), py = toY(d.periodSq);
      ctx.fillStyle = "rgba(46,255,140,0.2)";
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#c8cdd1"; ctx.font = "9px monospace"; ctx.textAlign = "center";
      ctx.fillText(d.periodSq.toFixed(1), px, py - 14);
    }

    ctx.fillStyle = "#ffffff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
    ctx.fillText("График зависимости T² от m", padL + graphW / 2, 20);
  }, [protocolData]);

  const updateValue = (index: number, field: "mass" | "period" | "periodSq", value: number) => {
    setProtocolData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Протокол измерений</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#434e54]">
                <th className="text-left py-3 px-4 text-[#798389] font-medium">№</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">Масса m, кг</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">Период T, с</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">T², с²</th>
              </tr>
            </thead>
            <tbody>
              {protocolData.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-4 font-mono-phys">{i + 1}</td>
                  <td className="py-2 px-4">
                    <input type="number" step={0.1} value={row.mass}
                      onChange={(e) => updateValue(i, "mass", parseFloat(e.target.value) || 0)}
                      className="w-24 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" step={0.001} value={row.period}
                      onChange={(e) => updateValue(i, "period", parseFloat(e.target.value) || 0)}
                      className="w-24 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" step={0.001} value={row.periodSq}
                      onChange={(e) => updateValue(i, "periodSq", parseFloat(e.target.value) || 0)}
                      className="w-24 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#798389] mt-3">* Редактируйте значения, чтобы обновить график</p>
      </div>

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
            <h4 className="font-semibold text-[#2eff8c] mb-3">Расчёт k</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#798389]">k (график):</span>
                <span className="font-mono-phys text-[#2eff8c]">{kValue.toFixed(1)} Н/м</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Теор. (при k=20):</span>
                <span className="font-mono-phys">20.0 Н/м</span>
              </div>
            </div>
          </div>

          <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
            <h4 className="font-semibold mb-3">Выводы</h4>
            <div className="space-y-2 text-sm text-[#c8cdd1]">
              <p>1. Период колебаний прямо пропорционален корню квадратному из массы.</p>
              <p>2. Период обратно пропорционален корню квадратному из жёсткости пружины.</p>
              <p>3. График T²(m) — прямая линия, что подтверждает теоретическую зависимость.</p>
              <p>4. По угловому коэффициенту определена жёсткость пружины k ≈ <span className="text-[#2eff8c] font-mono-phys">{kValue.toFixed(1)} Н/м</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
