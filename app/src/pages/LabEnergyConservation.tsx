import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, RotateCcw, Plus, BookOpen, FileText, Beaker } from "lucide-react";
import { Link } from "react-router";

type Tab = "sim" | "theory" | "protocol";
type Measurement = {
  id: number;
  height: number;
  mass: number;
  angle: number;
  ep: number;
  ek: number;
  q: number;
  total: number;
};

const G = 9.81;

/* ================================================================
   ENERGY CONSERVATION LAW LAB
   ================================================================ */
export default function LabEnergyConservation() {
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
          <p className="formula-text text-sm mb-3">E = Ep + Ek + Q = const</p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4">
            Закон сохранения механической энергии
          </h1>
          <p className="text-[#c8cdd1] max-w-3xl">
            Исследуйте преобразования энергии при движении тела по наклонной
            плоскости. Определите работу силы трения и проверьте выполнение
            закона сохранения энергии.
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
  const barCanvasRef = useRef<HTMLCanvasElement>(null);

  const [height, setHeight] = useState(5);
  const [mass, setMass] = useState(1.0);
  const [angle, setAngle] = useState(30);
  const [friction, setFriction] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);
  const animRef = useRef(0);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [nextId, setNextId] = useState(1);

  // Calculated values
  const slopeLength = height / Math.sin((angle * Math.PI) / 180);
  const frictionForce = friction * mass * G * Math.cos((angle * Math.PI) / 180);
  const frictionWork = frictionForce * slopeLength;
  const epTop = mass * G * height;
  const vBottom = Math.sqrt(
    2 * G * height * (Math.sin((angle * Math.PI) / 180) - friction * Math.cos((angle * Math.PI) / 180))
  );
  const ekBottom = isFinite(vBottom) && vBottom > 0 ? 0.5 * mass * vBottom * vBottom : 0;
  const qFriction = frictionWork;
  const totalEnergy = epTop;

  // Draw the inclined plane simulation
  const drawScene = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, W, H);

      const groundY = H - 80;
      const startX = 100;
      const angleRad = (angle * Math.PI) / 180;
      const slopeLenPx = Math.min(slopeLength * 25, 350);
      const slopeH = slopeLenPx * Math.sin(angleRad);
      const slopeW = slopeLenPx * Math.cos(angleRad);

      const topX = startX;
      const topY = groundY - slopeH;
      const bottomX = startX + slopeW;

      // Ground
      ctx.fillStyle = "#434e54";
      ctx.fillRect(0, groundY, W, 3);
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(0, groundY + 3, W, H - groundY - 3);

      // Inclined plane (surface)
      ctx.strokeStyle = "#c8cdd1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(bottomX, groundY);
      ctx.stroke();

      // Plane fill
      ctx.fillStyle = "rgba(67,78,84,0.3)";
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(bottomX, groundY);
      ctx.lineTo(bottomX, groundY + 30);
      ctx.lineTo(topX - 10, groundY + 30);
      ctx.closePath();
      ctx.fill();

      // Height indicator (vertical dashed line)
      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(topX, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Height label
      ctx.fillStyle = "#2eff8c";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`h = ${height.toFixed(1)} м`, topX - 35, (topY + groundY) / 2 + 4);

      // Angle arc
      const arcR = 30;
      ctx.strokeStyle = "rgba(1,172,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bottomX, groundY, arcR, Math.PI, Math.PI + angleRad);
      ctx.stroke();

      ctx.fillStyle = "#01acff";
      ctx.font = "10px monospace";
      ctx.fillText(`${angle}°`, bottomX - arcR - 18, groundY - 5);

      // Body position
      let bodyX: number, bodyY: number, currentH: number;

      if (progress <= 0) {
        bodyX = topX;
        bodyY = topY;
        currentH = height;
      } else if (progress >= 1) {
        bodyX = bottomX;
        bodyY = groundY;
        currentH = 0;
      } else {
        bodyX = topX + progress * slopeW;
        bodyY = topY + progress * slopeH;
        currentH = height * (1 - progress);
      }

      const bodySize = 12 + mass * 4;

      // Body
      const bodyGrad = ctx.createRadialGradient(
        bodyX - bodySize / 3, bodyY - bodySize / 3, 1,
        bodyX, bodyY, bodySize
      );
      bodyGrad.addColorStop(0, "#5effa8");
      bodyGrad.addColorStop(1, "#2eff8c");
      ctx.fillStyle = bodyGrad;

      // Draw body as square on slope
      ctx.save();
      ctx.translate(bodyX, bodyY);
      ctx.rotate(angleRad);
      ctx.fillRect(-bodySize / 2, -bodySize, bodySize, bodySize);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-bodySize / 2, -bodySize, bodySize, bodySize);
      ctx.restore();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(bodyX - bodySize / 4, bodyY - bodySize / 2, bodySize / 4, 0, Math.PI * 2);
      ctx.fill();

      // Mass label
      ctx.fillStyle = "#c8cdd1";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${mass.toFixed(1)} кг`, bodyX, bodyY - bodySize - 8);

      // Info panel
      ctx.fillStyle = "#2a3237";
      ctx.strokeStyle = "#434e54";
      ctx.lineWidth = 1;
      ctx.fillRect(15, 15, 220, 110);
      ctx.strokeRect(15, 15, 220, 110);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText("Энергии:", 25, 35);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "12px monospace";
      ctx.fillText(`Eп = ${(mass * G * currentH).toFixed(1)} Дж`, 25, 52);

      const currentV = progress > 0 && progress < 1
        ? Math.sqrt(2 * G * (height - currentH) * (Math.sin(angleRad) - friction * Math.cos(angleRad)))
        : 0;
      const currentEk = 0.5 * mass * currentV * currentV;
      ctx.fillStyle = "#01acff";
      ctx.fillText(`Eк = ${currentEk.toFixed(1)} Дж`, 25, 68);

      const currentQ = frictionForce * progress * slopeLength;
      ctx.fillStyle = "#ffcb3d";
      ctx.fillText(`Q = ${currentQ.toFixed(1)} Дж`, 25, 84);

      const currentTotal = mass * G * currentH + currentEk + currentQ;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`ΣE = ${currentTotal.toFixed(1)} Дж`, 25, 100);

      ctx.textAlign = "left";
    },
    [height, mass, angle, friction, slopeLength, frictionForce]
  );

  // Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 420;

    if (!isRunning) {
      drawScene(0);
      return;
    }

    const startTime = performance.now();
    const duration = 3000; // 3 seconds for the slide

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1);

      // Ease in-out
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      drawScene(eased);

      if (p < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, drawScene]);

  useEffect(() => {
    if (!isRunning) drawScene(0);
  }, [height, mass, angle, friction, isRunning, drawScene]);

  // Energy bar chart
  useEffect(() => {
    const canvas = barCanvasRef.current;
    if (!canvas) return;
    canvas.width = 300;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1f22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barW = 50;
    const maxE = Math.max(epTop, ekBottom + 5, qFriction + 5, 1);
    const scale = 150 / maxE;

    const bars = [
      { label: "Eп", value: epTop, color: "#2eff8c", x: 40 },
      { label: "Eк", value: ekBottom, color: "#01acff", x: 120 },
      { label: "Q", value: qFriction, color: "#ffcb3d", x: 200 },
    ];

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Энергия в нижней точке", canvas.width / 2, 20);

    // Axis
    ctx.strokeStyle = "#434e54";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 40);
    ctx.lineTo(20, 200);
    ctx.lineTo(270, 200);
    ctx.stroke();

    // Scale ticks
    for (let i = 0; i <= 4; i++) {
      const y = 200 - (i / 4) * 150;
      ctx.fillStyle = "#798389";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText((i * maxE / 4).toFixed(0), 15, y + 3);
    }

    bars.forEach((bar) => {
      const barH = bar.value * scale;

      // Bar
      ctx.fillStyle = bar.color;
      ctx.fillRect(bar.x, 200 - barH, barW, barH);

      // Border
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bar.x, 200 - barH, barW, barH);

      // Value label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${bar.value.toFixed(1)}`, bar.x + barW / 2, 200 - barH - 6);

      // Label
      ctx.fillStyle = bar.color;
      ctx.font = "12px monospace";
      ctx.fillText(bar.label, bar.x + barW / 2, 218);
    });

    // Units
    ctx.fillStyle = "#798389";
    ctx.font = "9px monospace";
    ctx.fillText("Дж", 10, 35);
  }, [epTop, ekBottom, qFriction, totalEnergy]);

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
  };

  const reset = () => {
    setIsRunning(false);
    drawScene(0);
  };

  const addMeasurement = () => {
    const newMeasurement: Measurement = {
      id: nextId,
      height,
      mass,
      angle,
      ep: epTop,
      ek: ekBottom,
      q: qFriction,
      total: totalEnergy,
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
    setNextId((prev) => prev + 1);
  };

  const deleteMeasurement = (id: number) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl border border-[#434e54]"
            style={{ maxWidth: 600, height: "auto", aspectRatio: "600/420" }}
          />
        </div>

        <div className="space-y-4">
          {/* Energy bar chart */}
          <canvas
            ref={barCanvasRef}
            className="w-full rounded-xl border border-[#434e54]"
            style={{ maxWidth: 300, height: "auto", aspectRatio: "300/250" }}
          />

          <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
            <h4 className="font-semibold mb-4">Параметры</h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#798389] block mb-1">
                  Высота: {height.toFixed(1)} м
                </label>
                <input
                  type="range" min={1} max={10} step={0.5} value={height}
                  onChange={(e) => { setHeight(parseFloat(e.target.value)); if (isRunning) setIsRunning(false); }}
                  className="w-full accent-[#2eff8c]"
                />
              </div>

              <div>
                <label className="text-xs text-[#798389] block mb-1">
                  Масса: {mass.toFixed(1)} кг
                </label>
                <input
                  type="range" min={0.1} max={5} step={0.1} value={mass}
                  onChange={(e) => { setMass(parseFloat(e.target.value)); if (isRunning) setIsRunning(false); }}
                  className="w-full accent-[#2eff8c]"
                />
              </div>

              <div>
                <label className="text-xs text-[#798389] block mb-1">
                  Угол наклона: {angle}°
                </label>
                <input
                  type="range" min={10} max={60} step={5} value={angle}
                  onChange={(e) => { setAngle(parseInt(e.target.value)); if (isRunning) setIsRunning(false); }}
                  className="w-full accent-[#01acff]"
                />
              </div>

              <div>
                <label className="text-xs text-[#798389] block mb-1">
                  Коэф. трения: {friction.toFixed(2)}
                </label>
                <input
                  type="range" min={0} max={0.5} step={0.05} value={friction}
                  onChange={(e) => { setFriction(parseFloat(e.target.value)); if (isRunning) setIsRunning(false); }}
                  className="w-full accent-[#ffcb3d]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={startSimulation}
                disabled={isRunning}
                className="flex-1 btn-lime flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play size={16} />
                {isRunning ? "Идёт..." : "Скатить"}
              </button>
              <button onClick={reset} className="btn-outline px-4">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-4">
          <p className="text-xs text-[#798389] mb-1">Потенциальная Eп</p>
          <p className="font-mono-phys text-[#2eff8c] text-lg">{epTop.toFixed(1)} Дж</p>
        </div>
        <div className="bg-[#2a3237] border border-[#01acff]/30 rounded-xl p-4">
          <p className="text-xs text-[#798389] mb-1">Кинетическая Eк</p>
          <p className="font-mono-phys text-[#01acff] text-lg">{ekBottom.toFixed(1)} Дж</p>
        </div>
        <div className="bg-[#2a3237] border border-[#ffcb3d]/30 rounded-xl p-4">
          <p className="text-xs text-[#798389] mb-1">Тепло Q (трение)</p>
          <p className="font-mono-phys text-[#ffcb3d] text-lg">{qFriction.toFixed(1)} Дж</p>
        </div>
        <div className="bg-[#2a3237] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-[#798389] mb-1">Полная энергия</p>
          <p className="font-mono-phys text-white text-lg">{totalEnergy.toFixed(1)} Дж</p>
        </div>
      </div>

      <button
        onClick={addMeasurement}
        className="w-full btn-lime flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Добавить в таблицу
      </button>

      {measurements.length > 0 && (
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h4 className="font-semibold mb-4">Таблица измерений</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#434e54]">
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">№</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">h, м</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">m, кг</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">α, °</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">Eп, Дж</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">Eк, Дж</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium">Q, Дж</th>
                  <th className="text-left py-2 px-3 text-[#798389] font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 font-mono-phys">{m.id}</td>
                    <td className="py-2 px-3 font-mono-phys">{m.height.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono-phys">{m.mass.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono-phys">{m.angle}</td>
                    <td className="py-2 px-3 font-mono-phys text-[#2eff8c]">{m.ep.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono-phys text-[#01acff]">{m.ek.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono-phys text-[#ffcb3d]">{m.q.toFixed(1)}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => deleteMeasurement(m.id)} className="text-[#ff6b6b] hover:text-[#ff6b6b]/70 text-xs">
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
          <h3 className="text-xl font-semibold mb-4">Закон сохранения энергии</h3>
          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            <strong>Закон сохранения механической энергии</strong> — один из
            фундаментальных законов физики. В замкнутой системе тел, между
            которыми действуют только консервативные силы, полная механическая
            энергия остаётся постоянной.
          </p>

          <div className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-5 my-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">Формулировка</h4>
            <p className="formula-text text-center my-4 text-lg">
              E = Eₚ + Eₖ = const
            </p>
            <p className="text-sm text-[#c8cdd1] mt-3">
              При наличии сил трения часть энергии переходит в тепло:
            </p>
            <p className="formula-text text-center my-3">
              Eₚ₁ + Eₖ₁ = Eₚ₂ + Eₖ₂ + Q
            </p>
          </div>

          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            В данной лабораторной работе тело скользит по наклонной плоскости.
            Потенциальная энергия в верхней точке преобразуется в кинетическую
            энергию и работу против силы трения (тепло Q).
          </p>

          <div className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-5 my-5">
            <h4 className="font-semibold text-[#01acff] mb-3">
              Работа силы трения
            </h4>
            <p className="formula-text text-center my-3">
              Fтр = μN = μmg·cos α
            </p>
            <p className="formula-text text-center my-3">
              Aтр = Fтр · l = μmg·cos α · l
            </p>
            <p className="formula-text text-center my-3">
              Q = Aтр = μmg·cos α · (h / sin α) = μmgh·ctg α
            </p>
            <p className="text-sm text-[#c8cdd1] mt-3">
              где <strong className="text-white">μ</strong> — коэффициент трения,
              {" "}<strong className="text-white">α</strong> — угол наклона,
              {" "}<strong className="text-white">l = h/sin α</strong> — длина пути.
            </p>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Скорость в нижней точке</h3>
          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            Из закона сохранения энергии:
          </p>
          <p className="formula-text text-center my-3">
            mgh = mv²/2 + μmgh·ctg α
          </p>
          <p className="text-[#c8cdd1] leading-relaxed mb-4">
            Разделив на m и решив относительно v:
          </p>
          <p className="formula-text text-center my-3">
            v = √[2gh(1 − μ·ctg α)]
          </p>
          <p className="text-sm text-[#c8cdd1] mt-3">
            При <strong className="text-white">μ = 0</strong> (нет трения) получаем
            классический результат: {" "}
            <strong className="text-[#2eff8c]">v = √(2gh)</strong>.
          </p>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Виды энергии</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                name: "Потенциальная Eₚ",
                formula: "Eₚ = mgh",
                desc: "Энергия положения тела в гравитационном поле",
                color: "#2eff8c",
              },
              {
                name: "Кинетическая Eₖ",
                formula: "Eₖ = mv²/2",
                desc: "Энергия движения тела",
                color: "#01acff",
              },
              {
                name: "Тепло Q",
                formula: "Q = Aтр",
                desc: "Энергия, ушедшая на преодоление трения",
                color: "#ffcb3d",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#1a1f22] border border-[#434e54] rounded-lg p-4"
              >
                <h4 className="font-semibold mb-2" style={{ color: card.color }}>
                  {card.name}
                </h4>
                <p className="formula-text text-sm mb-2">{card.formula}</p>
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
              <p className="text-[#798389] text-xs mb-1">Потенциальная энергия</p>
              <p className="formula-text">Eₚ = mgh</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Кинетическая энергия</p>
              <p className="formula-text">Eₖ = mv²/2</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Сила трения</p>
              <p className="formula-text">Fтр = μmg·cos α</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Работа трения</p>
              <p className="formula-text">Aтр = μmgh·ctg α</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Скорость</p>
              <p className="formula-text">v = √[2gh(1−μ·ctg α)]</p>
            </div>
            <div className="bg-[#1a1f22] rounded-lg p-3">
              <p className="text-[#798389] text-xs mb-1">Сохранение энергии</p>
              <p className="formula-text">Eₚ = Eₖ + Q</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#2eff8c]/20 rounded-xl p-5">
          <h4 className="font-semibold text-[#2eff8c] mb-3">Порядок работы</h4>
          <ol className="space-y-2 text-sm text-[#c8cdd1]">
            {[
              "Установите высоту, массу и угол наклона",
              "Задайте коэффициент трения",
              "Запустите симуляцию спуска",
              "Зафиксируйте Eп, Eк и Q",
              "Повторите для разных высот",
              "Повторите при разных μ",
              "Проверьте: Eп = Eк + Q",
              "Сделайте выводы",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#2eff8c] font-mono text-xs mt-0.5">{i + 1}.</span>
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
    { height: number; ep: number; ek: number; q: number }[]
  >([
    { height: 1.0, ep: 9.81, ek: 7.85, q: 1.96 },
    { height: 2.0, ep: 19.62, ek: 15.70, q: 3.92 },
    { height: 3.0, ep: 29.43, ek: 23.54, q: 5.89 },
    { height: 4.0, ep: 39.24, ek: 31.39, q: 7.85 },
    { height: 5.0, ep: 49.05, ek: 39.24, q: 9.81 },
    { height: 6.0, ep: 58.86, ek: 47.09, q: 11.77 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const maxH = Math.max(...protocolData.map((d) => d.height)) * 1.2;
    const maxE = Math.max(...protocolData.map((d) => Math.max(d.ep, d.ek + d.q))) * 1.1;

    const toX = (h: number) => padL + (h / maxH) * graphW;
    const toY = (e: number) => padT + graphH - (e / maxE) * graphH;

    // Grid
    ctx.strokeStyle = "rgba(67,78,84,0.4)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = padL + (i / 5) * graphW;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + graphH); ctx.stroke();
      ctx.fillStyle = "#798389"; ctx.font = "10px monospace"; ctx.textAlign = "center";
      ctx.fillText(((i / 5) * maxH).toFixed(1), x, padT + graphH + 18);
    }
    for (let i = 0; i <= 5; i++) {
      const y = padT + (i / 5) * graphH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + graphW, y); ctx.stroke();
      ctx.fillStyle = "#798389"; ctx.font = "10px monospace"; ctx.textAlign = "right";
      ctx.fillText(((1 - i / 5) * maxE).toFixed(0), padL - 8, y + 4);
    }

    // Axes
    ctx.strokeStyle = "#c8cdd1"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + graphH);
    ctx.lineTo(padL + graphW, padT + graphH); ctx.stroke();

    ctx.fillStyle = "#c8cdd1"; ctx.font = "12px monospace"; ctx.textAlign = "center";
    ctx.fillText("h, м", padL + graphW / 2, canvas.height - 8);
    ctx.save();
    ctx.translate(15, padT + graphH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText("E, Дж", 0, 0); ctx.restore();

    // Draw stacked area: Q at bottom (yellow), Ek on top (blue), total line (green)
    // Sort by height
    const sorted = [...protocolData].sort((a, b) => a.height - b.height);

    // Q area
    ctx.fillStyle = "rgba(255,203,61,0.3)";
    ctx.beginPath();
    ctx.moveTo(toX(sorted[0].height), toY(0));
    for (const d of sorted) ctx.lineTo(toX(d.height), toY(d.q));
    ctx.lineTo(toX(sorted[sorted.length - 1].height), toY(0));
    ctx.closePath(); ctx.fill();

    // Ek area (stacked on Q)
    ctx.fillStyle = "rgba(1,172,255,0.3)";
    ctx.beginPath();
    ctx.moveTo(toX(sorted[0].height), toY(sorted[0].q));
    for (const d of sorted) ctx.lineTo(toX(d.height), toY(d.q + d.ek));
    for (let i = sorted.length - 1; i >= 0; i--)
      ctx.lineTo(toX(sorted[i].height), toY(sorted[i].q));
    ctx.closePath(); ctx.fill();

    // Ep line
    ctx.strokeStyle = "#2eff8c"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < sorted.length; i++) {
      const d = sorted[i];
      if (i === 0) ctx.moveTo(toX(d.height), toY(d.ep));
      else ctx.lineTo(toX(d.height), toY(d.ep));
    }
    ctx.stroke();

    // Points
    for (const d of sorted) {
      const px = toX(d.height);

      // Ep point
      const pyEp = toY(d.ep);
      ctx.fillStyle = "#2eff8c";
      ctx.beginPath(); ctx.arc(px, pyEp, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();

      // Ek+Q point
      const pyEk = toY(d.q + d.ek);
      ctx.fillStyle = "#01acff";
      ctx.beginPath(); ctx.arc(px, pyEk, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // Legend
    const legendX = padL + graphW - 140;
    const legendY = padT + 10;
    ctx.fillStyle = "rgba(46,255,140,0.3)";
    ctx.fillRect(legendX, legendY, 14, 10);
    ctx.strokeStyle = "#2eff8c"; ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 14, 10);
    ctx.fillStyle = "#c8cdd1"; ctx.font = "10px monospace"; ctx.textAlign = "left";
    ctx.fillText("Eп (полная)", legendX + 20, legendY + 9);

    ctx.fillStyle = "rgba(1,172,255,0.3)";
    ctx.fillRect(legendX, legendY + 16, 14, 10);
    ctx.fillStyle = "#01acff"; ctx.font = "10px monospace";
    ctx.fillText("Eк", legendX + 20, legendY + 25);

    ctx.fillStyle = "rgba(255,203,61,0.3)";
    ctx.fillRect(legendX, legendY + 32, 14, 10);
    ctx.fillStyle = "#ffcb3d"; ctx.font = "10px monospace";
    ctx.fillText("Q", legendX + 20, legendY + 41);

    // Title
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
    ctx.fillText("Распределение энергии", padL + graphW / 2, 20);
  }, [protocolData]);

  const updateValue = (index: number, field: "height" | "ep" | "ek" | "q", value: number) => {
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
                <th className="text-left py-3 px-4 text-[#798389] font-medium">h, м</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">Eп, Дж</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">Eк, Дж</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">Q, Дж</th>
                <th className="text-left py-3 px-4 text-[#798389] font-medium">Eп − (Eк+Q)</th>
              </tr>
            </thead>
            <tbody>
              {protocolData.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-4 font-mono-phys">{i + 1}</td>
                  <td className="py-2 px-4">
                    <input type="number" step={0.1} value={row.height}
                      onChange={(e) => updateValue(i, "height", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" step={0.01} value={row.ep}
                      onChange={(e) => updateValue(i, "ep", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" step={0.01} value={row.ek}
                      onChange={(e) => updateValue(i, "ek", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" step={0.01} value={row.q}
                      onChange={(e) => updateValue(i, "q", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#1a1f22] border border-[#434e54] rounded px-2 py-1 text-sm font-mono-phys focus:border-[#2eff8c] outline-none" />
                  </td>
                  <td className="py-2 px-4 font-mono-phys text-[#798389]">
                    {(row.ep - row.ek - row.q).toFixed(2)}
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
            <h4 className="font-semibold text-[#2eff8c] mb-3">Проверка закона</h4>
            <div className="space-y-2 text-sm">
              {protocolData.slice(0, 3).map((row, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[#798389]">h={row.height.toFixed(1)}м:</span>
                  <span className="font-mono-phys">
                    {(row.ep - row.ek - row.q).toFixed(2)} Дж
                  </span>
                </div>
              ))}
              <div className="border-t border-[#434e54] pt-2 mt-2">
                <p className="text-[#798389] text-xs">Разница ≈ 0 — закон выполняется</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
            <h4 className="font-semibold mb-3">Выводы</h4>
            <div className="space-y-2 text-sm text-[#c8cdd1]">
              <p>1. Потенциальная энергия в верхней точке преобразуется в кинетическую и тепло.</p>
              <p>2. При отсутствии трения (μ=0) вся Eп переходит в Eк: v=√(2gh).</p>
              <p>3. С ростом коэффициента трения доля энергии, переходящей в тепло, увеличивается.</p>
              <p>4. Закон сохранения энергии выполняется: Eп = Eк + Q.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
