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

  const data = measurements.map((m, i) => ({
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
