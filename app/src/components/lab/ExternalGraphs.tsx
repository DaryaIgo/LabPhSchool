import { Plus, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SimulationChart from "./SimulationChart";
import type {
  ExternalDataTable,
  ExternalGraphConfig,
} from "./external-data";
import {
  createEmptyGraph,
  getColumnName,
  tableToMeasurementRows,
} from "./external-data";
import type { GraphConfig } from "./simulations/types";

interface ExternalGraphsProps {
  graphs: ExternalGraphConfig[];
  tables: ExternalDataTable[];
  onChange: (graphs: ExternalGraphConfig[]) => void;
}

export default function ExternalGraphs({
  graphs,
  tables,
  onChange,
}: ExternalGraphsProps) {
  const addGraph = () => {
    onChange([...graphs, createEmptyGraph(graphs.length)]);
  };

  const updateGraph = (
    id: string,
    updates: Partial<ExternalGraphConfig>
  ) => {
    onChange(graphs.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  const removeGraph = (id: string) => {
    onChange(graphs.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Графики</h3>
        <Button
          onClick={addGraph}
          variant="outline"
          size="sm"
          className="border-[#2eff8c]/50 text-[#2eff8c] hover:bg-[#2eff8c]/10"
        >
          <Plus size={14} className="mr-1" />
          График
        </Button>
      </div>

      {graphs.length === 0 && (
        <p className="text-sm text-[#798389]">
          Нажмите «+ График», чтобы построить график по данным таблицы.
        </p>
      )}

      {graphs.map(graph => (
        <GraphEditor
          key={graph.id}
          graph={graph}
          tables={tables}
          onUpdate={updates => updateGraph(graph.id, updates)}
          onRemove={() => removeGraph(graph.id)}
        />
      ))}
    </div>
  );
}

function GraphEditor({
  graph,
  tables,
  onUpdate,
  onRemove,
}: {
  graph: ExternalGraphConfig;
  tables: ExternalDataTable[];
  onUpdate: (updates: Partial<ExternalGraphConfig>) => void;
  onRemove: () => void;
}) {
  const selectedTable = tables.find(t => t.id === graph.tableId);

  const graphConfig: GraphConfig | null = selectedTable
    ? {
        title: graph.title,
        type: graph.type,
        xKey: graph.xColumnId,
        yKey: graph.yColumnId,
        xLabel: getColumnName(selectedTable, graph.xColumnId),
        yLabel: getColumnName(selectedTable, graph.yColumnId),
      }
    : null;

  const chartData = selectedTable ? tableToMeasurementRows(selectedTable) : [];

  return (
    <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <TrendingUp size={16} className="text-[#2eff8c] shrink-0" />
        <Input
          value={graph.title}
          onChange={e => onUpdate({ title: e.target.value })}
          className="h-8 bg-[#2a3237] border-[#434e54] text-white font-medium"
        />
        <Button
          onClick={onRemove}
          variant="outline"
          size="sm"
          className="h-8 border-red-500/50 text-red-400 hover:bg-red-500/10 shrink-0"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-[#798389]">Таблица</Label>
          <Select
            value={graph.tableId}
            onValueChange={tableId =>
              onUpdate({ tableId, xColumnId: "", yColumnId: "" })
            }
          >
            <SelectTrigger className="h-8 bg-[#2a3237] border-[#434e54] text-white text-xs">
              <SelectValue placeholder="Выберите таблицу" />
            </SelectTrigger>
            <SelectContent>
              {tables.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-[#798389]">Ось абсцисс (X)</Label>
          <Select
            value={graph.xColumnId}
            onValueChange={xColumnId => onUpdate({ xColumnId })}
            disabled={!selectedTable}
          >
            <SelectTrigger className="h-8 bg-[#2a3237] border-[#434e54] text-white text-xs">
              <SelectValue placeholder="X" />
            </SelectTrigger>
            <SelectContent>
              {selectedTable?.columns.map(col => (
                <SelectItem key={col.id} value={col.id}>
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-[#798389]">Ось ординат (Y)</Label>
          <Select
            value={graph.yColumnId}
            onValueChange={yColumnId => onUpdate({ yColumnId })}
            disabled={!selectedTable}
          >
            <SelectTrigger className="h-8 bg-[#2a3237] border-[#434e54] text-white text-xs">
              <SelectValue placeholder="Y" />
            </SelectTrigger>
            <SelectContent>
              {selectedTable?.columns.map(col => (
                <SelectItem key={col.id} value={col.id}>
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-[#798389]">Тип</Label>
          <Select
            value={graph.type}
            onValueChange={type =>
              onUpdate({ type: type as "line" | "scatter" })
            }
          >
            <SelectTrigger className="h-8 bg-[#2a3237] border-[#434e54] text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scatter">Точки</SelectItem>
              <SelectItem value="line">Линия</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {graphConfig && graph.xColumnId && graph.yColumnId && (
        <div className="pt-2">
          <SimulationChart graph={graphConfig} data={chartData} height={260} />
        </div>
      )}
    </div>
  );
}
