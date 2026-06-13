import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts";

interface LabGraphsProps {
  measurements: Record<string, string | number>[];
  slug: string;
}

export function LabGraphs({ measurements, slug }: LabGraphsProps) {
  if (measurements.length === 0) {
    return (
      <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl p-12 text-center text-[#798389]">
        Нет данных для построения графиков. Проведите измерения в симуляции.
      </div>
    );
  }

  const data: Record<string, unknown>[] = measurements.map((m, i) => ({
    index: i + 1,
    ...m,
  }));

  const renderGraphs = () => {
    if (slug === "density-measurement") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость плотности от массы (при V = const)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="m" name="Масса" stroke="#798389" />
                <YAxis type="number" dataKey="ρ" name="Плотность" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="ρ(m)" data={data} fill="#2eff8c" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Зависимость плотности от объёма (при m = const)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="V" stroke="#798389" />
                <YAxis dataKey="ρ" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ρ"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="ρ(V)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "archimedes-force") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость Fₐ от уровня погружения">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="immersionLevel" stroke="#798389" />
                <YAxis dataKey="Fₐ" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Fₐ"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="Fₐ(%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "buoyancy-independence") {
      return (
        <div className="space-y-6">
          <GraphCard title="Сравнение Fₐ для тел одинакового объёма">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="index" stroke="#798389" />
                <YAxis dataKey="Fₐ" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Fₐ"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="Fₐ"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "electric-work-measurement") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость работы тока от времени">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="time" stroke="#798389" />
                <YAxis dataKey="A" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="A"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="A(t)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Зависимость мощности от сопротивления">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="resistance" name="R" stroke="#798389" />
                <YAxis type="number" dataKey="P" name="P" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="P(R)" data={data} fill="#01acff" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "uniform-linear-motion") {
      const startX = Number(data[0]?.startX || 0);
      const speed = Number(data[0]?.speed || 0);
      const originPoint = { time: 0, x: startX, s: 0, v: speed, speed, startX };
      const numericData = [originPoint, ...data
        .map((d) => ({ ...d, time: Number(d.time), x: Number(d.x), s: Number(d.s), v: Number(d.v || d.speed) }))
      ].sort((a, b) => a.time - b.time);
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость координаты от времени x(t)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={numericData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="time" stroke="#798389" />
                <YAxis type="number" dataKey="x" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="linear"
                  dataKey="x"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="x(t)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Зависимость пройденного пути от времени s(t)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={numericData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="time" stroke="#798389" />
                <YAxis type="number" dataKey="s" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="linear"
                  dataKey="s"
                  stroke="#01acff"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#01acff" }}
                  name="s(t)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Зависимость скорости от времени v(t)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={numericData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="time" stroke="#798389" />
                <YAxis type="number" dataKey="v" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="linear"
                  dataKey="v"
                  stroke="#ff7043"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ff7043" }}
                  name="v(t)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "uniformly-accelerated-motion") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость скорости от времени v(t)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="time" stroke="#798389" />
                <YAxis dataKey="v" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#ff7043"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ff7043" }}
                  name="v(t)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Зависимость пройденного пути от времени s(t)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="time" name="t" stroke="#798389" />
                <YAxis type="number" dataKey="s" name="s" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="s(t)" data={data} fill="#2eff8c" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "free-fall-g") {
      const pendulumData = data.filter((d) => d.method === "маятник");
      const fallData = data.filter((d) => d.method === "падение");
      return (
        <div className="space-y-6">
          <GraphCard title="Способ 1: Зависимость квадрата периода от длины нити T²(l)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="length" name="l" stroke="#798389" />
                <YAxis
                  type="number"
                  dataKey="T"
                  name="T²"
                  stroke="#798389"
                  tickFormatter={(v: number) => (v * v).toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [(value * value).toFixed(3), "T²"]}
                />
                <Scatter name="T²(l)" data={pendulumData} fill="#2eff8c" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Способ 2: Зависимость высоты от квадрата времени падения h(t²)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="t2" name="t²" stroke="#798389" />
                <YAxis type="number" dataKey="height" name="h" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="h(t²)" data={fallData} fill="#01acff" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "circular-motion") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость центростремительного ускорения от радиуса a(R)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="radius" stroke="#798389" />
                <YAxis dataKey="a" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="a"
                  stroke="#ff7043"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ff7043" }}
                  name="a(R)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Зависимость линейной скорости от периода v(T)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="period" stroke="#798389" />
                <YAxis dataKey="v" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#01acff"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#01acff" }}
                  name="v(T)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "projectile-motion") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость дальности полёта от угла броска L(α)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="angle" stroke="#798389" />
                <YAxis dataKey="L" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="L"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="L(α)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Зависимость максимальной высоты от угла броска H(α)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="angle" stroke="#798389" />
                <YAxis dataKey="H" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="H"
                  stroke="#01acff"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#01acff" }}
                  name="H(α)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "boyle-mariotte") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость давления от объёма p(V)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="V" name="V" stroke="#798389" />
                <YAxis type="number" dataKey="p" name="p" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="p(V)" data={data} fill="#ff7043" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "isobaric-process") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость объёма от температуры V(T)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="T" stroke="#798389" />
                <YAxis dataKey="V" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="V"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="V(T)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "isochoric-process") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость давления от температуры p(T)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="T" stroke="#798389" />
                <YAxis dataKey="p" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="p"
                  stroke="#ff7043"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ff7043" }}
                  name="p(T)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "specific-heat-capacity") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость равновесной температуры от массы воды T_р(m_в)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="m_в" name="m_в" stroke="#798389" />
                <YAxis type="number" dataKey="T_р" name="T_р" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="T_р(m_в)" data={data} fill="#01acff" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "relative-humidity") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость относительной влажности от разности температур φ(ΔT)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="ΔT" stroke="#798389" />
                <YAxis dataKey="φ" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="φ"
                  stroke="#2eff8c"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2eff8c" }}
                  name="φ(ΔT)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "surface-tension") {
      return (
        <div className="space-y-6">
          <GraphCard title="Зависимость силы отрыва от массы капли F(m_кап)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="m_кап" name="m_кап" stroke="#798389" />
                <YAxis type="number" dataKey="F_отр" name="F_отр" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="F(m_кап)" data={data} fill="#ff7043" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    if (slug === "balancing-act") {
      return (
        <div className="space-y-6">
          <GraphCard title="Сравнение левого и правого моментов M_лев(M_прав)">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis type="number" dataKey="M_прав" name="M_прав" stroke="#798389" />
                <YAxis type="number" dataKey="M_лев" name="M_лев" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Scatter name="M_лев(M_прав)" data={data} fill="#2eff8c" />
              </ScatterChart>
            </ResponsiveContainer>
          </GraphCard>
          <GraphCard title="Изменение разности моментов ΔM от номера измерения">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
                <XAxis dataKey="index" stroke="#798389" />
                <YAxis dataKey="ΔM" stroke="#798389" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f22",
                    border: "1px solid #37474f",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ΔM"
                  stroke="#ffcb3d"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ffcb3d" }}
                  name="ΔM"
                />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      );
    }

    return (
      <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl p-12 text-center text-[#798389]">
        Графики для этой лабораторной работы в разработке.
      </div>
    );
  };

  return <div className="space-y-6">{renderGraphs()}</div>;
}

function GraphCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl p-6">
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      {children}
    </div>
  );
}
