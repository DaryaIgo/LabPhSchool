import { useRef } from "react";

interface ConclusionPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SYMBOLS = [
  "α",
  "β",
  "γ",
  "δ",
  "ε",
  "θ",
  "λ",
  "μ",
  "π",
  "ρ",
  "σ",
  "τ",
  "φ",
  "ω",
  "Δ",
  "Σ",
  "Ω",
  "°",
  "±",
  "×",
  "→",
  "≈",
  "²",
  "³",
];

export default function ConclusionPanel({
  value,
  onChange,
  placeholder = "Напишите свой вывод на основе полученных результатов...",
}: ConclusionPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const newValue = value.slice(0, start) + symbol + value.slice(end);
    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + symbol.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };ы

  return (
    <div className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 space-y-4">
      <label className="block text-sm text-[#798389]">Напиши вывод</label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={8}
        className="w-full bg-[#1a1f22] border border-[#37474f] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#2eff8c] transition-colors resize-none"
        placeholder={placeholder}
      />

      <div className="space-y-2">
        <p className="text-xs text-[#798389]">
          Нажмите на символ, чтобы вставить его в текст вывода
        </p>
        <div className="flex flex-wrap gap-2">
          {SYMBOLS.map(symbol => (
            <button
              key={symbol}
              type="button"
              onClick={() => insertSymbol(symbol)}
              className="h-9 min-w-[2.25rem] px-2 rounded-lg bg-[#1a1f22] border border-[#37474f] text-[#c8cdd1] hover:border-[#2eff8c] hover:text-white transition-colors text-sm font-medium"
              aria-label={`Вставить символ ${symbol}`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
