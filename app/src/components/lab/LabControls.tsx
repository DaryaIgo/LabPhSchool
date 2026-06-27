import { useId } from "react";

interface SliderControl {
  type: "slider";
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

interface NumberControl {
  type: "number";
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

interface SelectControl {
  type: "select";
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface ButtonControl {
  type: "button";
  label: string;
  variant?: "primary" | "outline" | "danger";
  onClick: () => void;
}

export type ControlItem =
  | SliderControl
  | NumberControl
  | SelectControl
  | ButtonControl;

interface LabControlsProps {
  controls: ControlItem[];
}

export default function LabControls({ controls }: LabControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      {controls.map((control, index) => (
        <ControlField key={index} control={control} />
      ))}
    </div>
  );
}

function ControlField({ control }: { control: ControlItem }) {
  const id = useId();

  switch (control.type) {
    case "slider": {
      return (
        <div className="flex flex-col gap-1.5 min-w-[200px] flex-none">
          <label
            htmlFor={id}
            className="text-[#c8cdd1] text-sm font-medium truncate"
            title={`${control.label}${control.unit ? `, ${control.unit}` : ""}`}
          >
            {control.label}
            {control.unit ? `, ${control.unit}` : ""}
          </label>
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={control.value}
              onChange={e => control.onChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-[#37474f] rounded-lg appearance-none cursor-pointer accent-[#2eff8c] min-w-0"
            />
            <span className="text-[#2eff8c] text-sm w-[68px] shrink-0 text-right font-mono font-semibold">
              {control.value}
              {control.unit ? ` ${control.unit}` : ""}
            </span>
          </div>
        </div>
      );
    }
    case "number": {
      return (
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <label htmlFor={id} className="text-[#c8cdd1] text-sm font-medium">
            {control.label}
            {control.unit ? `, ${control.unit}` : ""}
          </label>
          <input
            id={id}
            type="number"
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            value={control.value}
            onChange={e => control.onChange(parseFloat(e.target.value) || 0)}
            className="bg-[#1a1f22] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c] transition-colors"
          />
        </div>
      );
    }
    case "select": {
      return (
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label htmlFor={id} className="text-[#c8cdd1] text-sm font-medium">
            {control.label}
          </label>
          <select
            id={id}
            value={control.value}
            onChange={e => control.onChange(e.target.value)}
            className="bg-[#1a1f22] border border-[#37474f] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#2eff8c] transition-colors"
          >
            {control.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    case "button": {
      const btnClasses = {
        primary: "bg-[#2eff8c] text-[#0d1117] hover:bg-[#25cc70]",
        outline:
          "border border-[#37474f] text-[#c8cdd1] hover:border-[#2eff8c] hover:text-[#2eff8c]",
        danger: "border border-red-500/50 text-red-400 hover:bg-red-500/10",
      };
      return (
        <button
          onClick={control.onClick}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            btnClasses[control.variant ?? "primary"]
          }`}
        >
          {control.label}
        </button>
      );
    }
  }
}
