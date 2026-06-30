import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { prepareChartData } from "@/components/lab/simulations/graph-utils";
import type { GraphConfig, MeasurementRow } from "@/components/lab/simulations/types";

interface SimulationChartProps {
  graph: GraphConfig;
  data: MeasurementRow[];
  height?: number;
}

export default function SimulationChart({
  graph,
  data,
  height = 280,
}: SimulationChartProps) {
  const isEmpty = data.length === 0;
  const chartData = isEmpty ? [] : prepareChartData(graph, data);
  const defaultDomain: [number, number] = [0, 1];
  const autoDomain: [string, string] = ["auto", "auto"];

  const xAxisName = graph.xLabel ?? graph.xKey;
  const yAxisName = graph.yLabel ?? graph.yKey;
  const seriesName = `${yAxisName}(${xAxisName})`;

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1a1f22",
      border: "1px solid #37474f",
      borderRadius: "8px",
      color: "#fff",
    },
  };

  const xAxisLabel = {
    value: xAxisName,
    position: "insideBottom" as const,
    offset: -2,
    fill: "#798389",
    fontSize: 11,
  };

  const yAxisLabel = {
    value: yAxisName,
    angle: -90,
    position: "insideLeft" as const,
    fill: "#798389",
    fontSize: 11,
  };

  if (graph.type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
          <XAxis
            type="number"
            dataKey="x"
            stroke="#798389"
            fontSize={11}
            tickLine={false}
            domain={isEmpty ? defaultDomain : autoDomain}
            label={xAxisLabel}
          />
          <YAxis
            type="number"
            dataKey="y"
            stroke="#798389"
            fontSize={11}
            tickLine={false}
            domain={isEmpty ? defaultDomain : autoDomain}
            label={yAxisLabel}
          />
          <Tooltip {...tooltipStyle} />
          {!isEmpty && (
            <Scatter
              name={seriesName}
              data={chartData}
              fill="#2eff8c"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
        <XAxis
          type="number"
          dataKey="x"
          stroke="#798389"
          fontSize={11}
          tickLine={false}
          domain={isEmpty ? defaultDomain : autoDomain}
          label={xAxisLabel}
        />
        <YAxis
          type="number"
          dataKey="y"
          stroke="#798389"
          fontSize={11}
          tickLine={false}
          domain={isEmpty ? defaultDomain : autoDomain}
          label={yAxisLabel}
        />
        <Tooltip {...tooltipStyle} />
        {!isEmpty && (
          <Line
            type="linear"
            dataKey="y"
            stroke="#2eff8c"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2eff8c" }}
            name={seriesName}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
