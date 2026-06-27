import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATEGORY_ICONS, getCategoryIcon } from "@/lib/lab-icons";
import { CategoryIcon } from "@/components/CategoryIcon";

export function CategoryIconPicker({
  value,
  onChange,
  label = "Иконка",
}: {
  value: string | null | undefined;
  onChange: (key: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = getCategoryIcon(value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATEGORY_ICONS;
    return CATEGORY_ICONS.filter(
      i => i.label.toLowerCase().includes(q) || i.key.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div>
      <Label className="text-xs text-[#798389]">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-1 justify-between bg-[#1e2529] border-[#37474f] text-white hover:bg-[#2a3237] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <CategoryIcon iconKey={value} size={18} />
              <span>{selected.label}</span>
            </span>
            <ChevronsUpDown size={14} className="text-[#798389]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 bg-[#1e2529] border-[#37474f] text-white p-3"
          align="start"
        >
          <Input
            placeholder="Поиск иконки..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#1a1f22] border-[#37474f] text-white mb-3"
          />
          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {filtered.map(icon => {
              const Icon = icon.component;
              const isSelected = value === icon.key;
              return (
                <button
                  key={icon.key}
                  type="button"
                  onClick={() => {
                    onChange(icon.key);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-[#2eff8c]/20 border-[#2eff8c] text-[#2eff8c]"
                      : "bg-[#1a1f22] border-[#37474f] text-[#c8cdd1] hover:border-[#2eff8c]/50"
                  }`}
                  title={icon.label}
                >
                  <Icon size={22} style={{ color: icon.color }} />
                  <span className="text-[10px] leading-tight text-center line-clamp-2">
                    {icon.label}
                  </span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-xs text-[#798389] text-center py-2">
              Ничего не найдено
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-[#37474f] text-xs text-[#798389]">
            Чтобы добавить новую иконку, импортируйте компонент из{" "}
            <code className="text-[#2eff8c]">lucide-react</code> и добавьте
            запись в{" "}
            <code className="text-[#2eff8c]">app/src/lib/lab-icons.ts</code>.
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
