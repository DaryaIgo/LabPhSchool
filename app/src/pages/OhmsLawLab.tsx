import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, RotateCcw, Lightbulb, Zap, CircleDot, ToggleRight, BookOpen, Table2, Download } from "lucide-react";
import OhmsLawCircuit from "@/components/OhmsLawCircuit";
import { generateProtocolPDF } from "@/components/ProtocolPDF";
import { getLabBySlug } from "@/data/labs";

/* ================================================================
   OHM'S LAW - TEXTBOOK STYLE LAB SIMULATION
   ================================================================ */

interface CircuitState {
  voltage: number;
  resistance: number;
  switchOn: boolean;
}

interface Measurement {
  id: number;
  voltage: number;
  resistance: number;
  current: number;
  power: number;
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function OhmsLawLab() {
  const [circuitState, setCircuitState] = useState<CircuitState>({
    voltage: 12,
    resistance: 4,
    switchOn: false,
  });

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeTab, setActiveTab] = useState<"simulation" | "theory" | "protocol">("simulation");

  const current = circuitState.switchOn ? circuitState.voltage / circuitState.resistance : 0;
  const power = current * circuitState.voltage;

  const addMeasurement = () => {
    const newMeasurement: Measurement = {
      id: measurements.length + 1,
      voltage: circuitState.voltage,
      resistance: circuitState.resistance,
      current,
      power,
    };
    setMeasurements([...measurements, newMeasurement]);
  };

  const resetAll = () => {
    setCircuitState({ voltage: 12, resistance: 4, switchOn: false });
    setMeasurements([]);
  };

  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      {/* ====== HERO ====== */}
      <section className="bg-[#1a1f22] py-12 lg:py-16 border-b border-[#434e54]">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/labs"
            className="inline-flex items-center gap-2 text-[#798389] hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Назад к лабораториям
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="formula-text text-xs mb-2">Лабораторная работа №3 | Электричество</p>
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight">
                Изучение закона Ома
              </h1>
              <p className="text-[#c8cdd1] mt-3 max-w-xl">
                Экспериментальная проверка закона Ома для участка цепи.
                Сборка электрической цепи с измерением силы тока и напряжения.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={resetAll} className="btn-outline text-sm flex items-center gap-2">
                <RotateCcw size={14} />
                Сбросить всё
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TABS ====== */}
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

      {/* ====== SIMULATION TAB ====== */}
      {activeTab === "simulation" && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Canvas - textbook style circuit */}
            <div className="lg:col-span-2">
              <OhmsLawCircuit
                state={circuitState}
                onAddMeasurement={addMeasurement}
              />
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              {/* Switch Control */}
              <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ToggleRight size={18} className="text-[#2eff8c]" />
                    Переключатель S
                  </h4>
                  <button
                    onClick={() => setCircuitState(s => ({ ...s, switchOn: !s.switchOn }))}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      circuitState.switchOn ? "bg-[#2eff8c]" : "bg-[#434e54]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                        circuitState.switchOn ? "translate-x-7" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-[#798389]">
                  {circuitState.switchOn
                    ? "Цепь замкнута. Электрический ток идёт по цепи."
                    : "Цепь разомкнута. Замкните переключатель S для начала эксперимента."}
                </p>
              </div>

              {/* Voltage Control */}
              <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-[#01acff]" />
                  Напряжение источника Б
                </h4>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#798389] mb-2">
                    <span>1 В</span>
                    <span className="text-white font-mono-phys">{circuitState.voltage} В</span>
                    <span>24 В</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    step={1}
                    value={circuitState.voltage}
                    onChange={(e) => setCircuitState(s => ({ ...s, voltage: parseInt(e.target.value) }))}
                    className="w-full accent-[#01acff]"
                  />
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {[3, 6, 9, 12, 18, 24].map(v => (
                    <button
                      key={v}
                      onClick={() => setCircuitState(s => ({ ...s, voltage: v }))}
                      className={`text-xs py-1 rounded ${
                        circuitState.voltage === v
                          ? "bg-[#01acff] text-black font-bold"
                          : "bg-[#262e33] text-[#798389] hover:bg-[#434e54]"
                      }`}
                    >
                      {v}В
                    </button>
                  ))}
                </div>
              </div>

              {/* Resistance Control */}
              <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <CircleDot size={18} className="text-[#ffcb3d]" />
                  Сопротивление резистора R
                </h4>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#798389] mb-2">
                    <span>1 Ом</span>
                    <span className="text-white font-mono-phys">{circuitState.resistance} Ом</span>
                    <span>20 Ом</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={circuitState.resistance}
                    onChange={(e) => setCircuitState(s => ({ ...s, resistance: parseFloat(e.target.value) }))}
                    className="w-full accent-[#ffcb3d]"
                  />
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[2, 4, 6, 10, 15].map(r => (
                    <button
                      key={r}
                      onClick={() => setCircuitState(s => ({ ...s, resistance: r }))}
                      className={`text-xs py-1 rounded ${
                        circuitState.resistance === r
                          ? "bg-[#ffcb3d] text-black font-bold"
                          : "bg-[#262e33] text-[#798389] hover:bg-[#434e54]"
                      }`}
                    >
                      {r}Ω
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time readings */}
              <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
                <h4 className="font-semibold text-[#2eff8c] mb-3 flex items-center gap-2">
                  <Lightbulb size={16} />
                  Показания приборов
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 rounded bg-[#262e33]">
                    <span className="text-[#798389]">Вольтметр V</span>
                    <span className="font-mono-phys text-[#01acff] text-lg">{circuitState.voltage.toFixed(1)} В</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#262e33]">
                    <span className="text-[#798389]">Амперметр A</span>
                    <span className={`font-mono-phys text-lg ${circuitState.switchOn ? "text-[#2eff8c]" : "text-[#434e54]"}`}>
                      {current.toFixed(3)} А
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-[#262e33]">
                    <span className="text-[#798389]">Мощность P</span>
                    <span className="font-mono-phys text-white">{power.toFixed(2)} Вт</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Measurements Table */}
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
                      <th className="text-left px-4 py-3 font-mono-phys text-[#2eff8c]">№</th>
                      <th className="text-left px-4 py-3">U, В</th>
                      <th className="text-left px-4 py-3">R, Ом</th>
                      <th className="text-left px-4 py-3">I, А</th>
                      <th className="text-left px-4 py-3">P, Вт</th>
                      <th className="text-left px-4 py-3">U/R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m) => (
                      <tr key={m.id} className="border-t border-[#434e54]/50">
                        <td className="px-4 py-3 font-mono-phys text-[#2eff8c]">{m.id}</td>
                        <td className="px-4 py-3">{m.voltage.toFixed(1)}</td>
                        <td className="px-4 py-3">{m.resistance}</td>
                        <td className="px-4 py-3 font-mono-phys">{m.current.toFixed(3)}</td>
                        <td className="px-4 py-3">{m.power.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono-phys">{(m.voltage / m.resistance).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ====== THEORY TAB ====== */}
      {activeTab === "theory" && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* Purpose */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-[#2eff8c]" />
                Цель работы
              </h3>
              <p className="text-[#c8cdd1] leading-relaxed">
                Экспериментально проверить закон Ома для участка цепи:
                установить зависимость силы тока от напряжения при постоянном
                сопротивлении и от сопротивления при постоянном напряжении.
              </p>
            </div>

            {/* Theory */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Теоретическая часть</h3>
              <div className="space-y-4 text-[#c8cdd1] leading-relaxed">
                <p>
                  <strong className="text-white">Закон Ома</strong> для участка цепи устанавливает
                  связь между силой тока I, напряжением U и сопротивлением R:
                </p>
                <div className="bg-[#1a1f22] rounded-lg p-4 text-center">
                  <p className="formula-text text-lg">I = U / R</p>
                </div>
                <p>
                  Сила тока прямо пропорциональна напряжению на концах участка и
                  обратно пропорциональна его сопротивлению.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-[#1a1f22] rounded-lg p-4">
                    <p className="formula-text text-sm mb-2">U = I × R</p>
                    <p className="text-xs text-[#798389]">Напряжение равно произведению тока на сопротивление</p>
                  </div>
                  <div className="bg-[#1a1f22] rounded-lg p-4">
                    <p className="formula-text text-sm mb-2">R = U / I</p>
                    <p className="text-xs text-[#798389]">Сопротивление равно отношению напряжения к току</p>
                  </div>
                </div>
                <p className="mt-4">
                  <strong className="text-white">Мощность</strong> тока на участке цепи:
                </p>
                <div className="bg-[#1a1f22] rounded-lg p-4 text-center">
                  <p className="formula-text text-lg">P = U × I = I² × R = U² / R</p>
                </div>
              </div>
            </div>

            {/* Equipment */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Оборудование</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Источник постоянного напряжения (Б)",
                  "Резистор (R, нагрузка)",
                  "Лампа накаливания (L)",
                  "Амперметр (A)",
                  "Вольтметр (V)",
                  "Переключатель (S)",
                  "Соединительные провода",
                  "Штатив для сборки цепи",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#262e33] rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-[#2eff8c]/20 flex items-center justify-center text-[#2eff8c] text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Procedure */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Порядок выполнения</h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Сборка цепи",
                    desc: "Соберите электрическую цепь по схеме (рис. 1): источник питания Б, амперметр A (последовательно), переключатель S, резистор R и лампа L. Вольтметр V подключите параллельно источнику."
                  },
                  {
                    step: 2,
                    title: "Исследование I(R) при U = const",
                    desc: "Установите напряжение 12 В на источнике. Изменяя сопротивление R от 2 до 15 Ом, записывайте показания амперметра для каждого значения. Заполните таблицу 1."
                  },
                  {
                    step: 3,
                    title: "Исследование I(U) при R = const",
                    desc: "Установите сопротивление R = 4 Ом. Изменяя напряжение от 3 до 24 В, записывайте показания амперметра. Заполните таблицу 2."
                  },
                  {
                    step: 4,
                    title: "Обработка результатов",
                    desc: "Сравните экспериментальные значения тока с теоретическими, рассчитанными по формуле I = U/R. Сделайте вывод о справедливости закона Ома."
                  },
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

      {/* ====== PROTOCOL TAB ====== */}
      {activeTab === "protocol" && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Pre-filled protocol */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Бланк протокола</h3>
              <div className="space-y-4 text-sm">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#798389] block mb-1">Название работы</label>
                    <div className="bg-[#262e33] rounded-lg p-3 text-[#c8cdd1]">
                      Изучение закона Ома для участка цепи
                    </div>
                  </div>
                  <div>
                    <label className="text-[#798389] block mb-1">Цель</label>
                    <div className="bg-[#262e33] rounded-lg p-3 text-[#c8cdd1]">
                      Проверка закона Ома экспериментально
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[#798389] block mb-1">Формулы</label>
                  <div className="bg-[#262e33] rounded-lg p-3">
                    <p className="formula-text">I = U/R &nbsp;&nbsp; U = I·R &nbsp;&nbsp; R = U/I &nbsp;&nbsp; P = U·I</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Experiment 1 */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h4 className="font-semibold mb-4 text-[#01acff]">Таблица 1. Зависимость I(R) при U = 12 В</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#262e33]">
                      <th className="text-left px-3 py-2">№</th>
                      <th className="text-left px-3 py-2">U, В</th>
                      <th className="text-left px-3 py-2">R, Ом</th>
                      <th className="text-left px-3 py-2">I измер, А</th>
                      <th className="text-left px-3 py-2">I = U/R</th>
                      <th className="text-left px-3 py-2">δ, %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 1, u: 12, r: 2 },
                      { n: 2, u: 12, r: 4 },
                      { n: 3, u: 12, r: 6 },
                      { n: 4, u: 12, r: 8 },
                      { n: 5, u: 12, r: 12 },
                    ].map((row) => {
                      const iTheor = row.u / row.r;
                      const measured = measurements.find(m => m.voltage === row.u && m.resistance === row.r);
                      const iExp = measured?.current || 0;
                      const error = iExp > 0 ? Math.abs((iExp - iTheor) / iTheor * 100) : null;
                      return (
                        <tr key={row.n} className="border-t border-[#434e54]/50">
                          <td className="px-3 py-2 font-mono-phys">{row.n}</td>
                          <td className="px-3 py-2">{row.u}</td>
                          <td className="px-3 py-2">{row.r}</td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? iExp.toFixed(3) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono-phys text-[#01acff]">{iTheor.toFixed(3)}</td>
                          <td className="px-3 py-2">
                            {error !== null ? `${error.toFixed(1)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#798389] mt-3">
                * Проведите измерения в симуляторе: установите U = 12 В и меняйте R, нажимая «Записать в таблицу»
              </p>
            </div>

            {/* Experiment 2 */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h4 className="font-semibold mb-4 text-[#ffcb3d]">Таблица 2. Зависимость I(U) при R = 4 Ом</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#262e33]">
                      <th className="text-left px-3 py-2">№</th>
                      <th className="text-left px-3 py-2">U, В</th>
                      <th className="text-left px-3 py-2">R, Ом</th>
                      <th className="text-left px-3 py-2">I измер, А</th>
                      <th className="text-left px-3 py-2">I = U/R</th>
                      <th className="text-left px-3 py-2">δ, %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 1, u: 3, r: 4 },
                      { n: 2, u: 6, r: 4 },
                      { n: 3, u: 9, r: 4 },
                      { n: 4, u: 12, r: 4 },
                      { n: 5, u: 18, r: 4 },
                    ].map((row) => {
                      const iTheor = row.u / row.r;
                      const measured = measurements.find(m => m.voltage === row.u && m.resistance === row.r);
                      const iExp = measured?.current || 0;
                      const error = iExp > 0 ? Math.abs((iExp - iTheor) / iTheor * 100) : null;
                      return (
                        <tr key={row.n} className="border-t border-[#434e54]/50">
                          <td className="px-3 py-2 font-mono-phys">{row.n}</td>
                          <td className="px-3 py-2">{row.u}</td>
                          <td className="px-3 py-2">{row.r}</td>
                          <td className="px-3 py-2 font-mono-phys">
                            {measured ? iExp.toFixed(3) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono-phys text-[#ffcb3d]">{iTheor.toFixed(3)}</td>
                          <td className="px-3 py-2">
                            {error !== null ? `${error.toFixed(1)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#798389] mt-3">
                * Проведите измерения в симуляторе: установите R = 4 Ом и меняйте U, нажимая «Записать в таблицу»
              </p>
            </div>

            {/* Conclusion */}
            <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6">
              <h4 className="font-semibold mb-3">Вывод</h4>
              <div className="bg-[#262e33] rounded-lg p-4 text-sm text-[#c8cdd1] leading-relaxed">
                В ходе работы был экспериментально проверен закон Ома для участка цепи.
                Установлено, что сила тока прямо пропорциональна напряжению (при R = const)
                и обратно пропорциональна сопротивлению (при U = const), что полностью
                согласуется с теоретическим соотношением I = U/R.
              </div>
            </div>

            {/* Download PDF */}
            <button
              onClick={() => {
                const lab = getLabBySlug("ohms-law");
                if (!lab) return;
                generateProtocolPDF(lab, {
                  studentName: "Ученик",
                  date: new Date().toLocaleDateString("ru-RU"),
                  measurements: measurements.map((m) => ({
                    n: String(m.id),
                    u: String(m.voltage),
                    i: String(m.current.toFixed(3)),
                    r: String(m.resistance),
                  })),
                  conclusion: "В ходе работы был экспериментально проверен закон Ома. Установлено, что I прямо пропорционально U и обратно пропорционально R.",
                });
              }}
              className="w-full btn-lime flex items-center justify-center gap-2 py-3 text-base"
            >
              <Download size={18} />
              Скачать протокол (PDF)
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
