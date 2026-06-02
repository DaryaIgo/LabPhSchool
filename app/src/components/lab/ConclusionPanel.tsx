import { useState } from "react";
import { FileText } from "lucide-react";

interface ConclusionPanelProps {
  template: string;
  data: Record<string, string | number>;
  onGenerate?: () => void;
}

export default function ConclusionPanel({
  template,
  data,
  onGenerate,
}: ConclusionPanelProps) {
  const [conclusion, setConclusion] = useState("");

  const generate = () => {
    if (onGenerate) {
      onGenerate();
      return;
    }
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }
    setConclusion(result);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2eff8c] text-[#0d1117] text-sm font-semibold hover:bg-[#25cc70] transition-colors"
      >
        <FileText size={18} />
        Сформировать вывод
      </button>

      {conclusion && (
        <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-5">
          <h4 className="text-[#2eff8c] font-semibold mb-3 text-sm uppercase tracking-wide">
            Вывод
          </h4>
          <div className="text-[#c8cdd1] text-sm leading-relaxed whitespace-pre-wrap">
            {conclusion}
          </div>
        </div>
      )}

      {!conclusion && (
        <div className="bg-[#1a1f22] border border-[#37474f] rounded-xl p-8 text-center text-[#c8cdd1] text-sm">
          Нажмите «Сформировать вывод», чтобы автоматически сгенерировать вывод
          на основе полученных данных.
        </div>
      )}
    </div>
  );
}
