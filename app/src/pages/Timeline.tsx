import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { X, Clock, FlaskConical, User, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import type { TimelineEntry } from "@contracts/types";

const MIN_YEAR = -300;
const MAX_YEAR = 2026;
const YEAR_STEP = 100;
const TIMELINE_WIDTH = 3300;
const PADDING_X = 80;

const CENTURIES = [
  { label: "до н.э.", start: MIN_YEAR, end: 0 },
  { label: "1–10 вв.", start: 1, end: 1000 },
  { label: "11–15 вв.", start: 1001, end: 1600 },
  { label: "16-й", start: 1501, end: 1600 },
  { label: "17-й", start: 1601, end: 1700 },
  { label: "18-й", start: 1701, end: 1800 },
  { label: "19-й", start: 1801, end: 1900 },
  { label: "20-й", start: 1901, end: 2000 },
  { label: "21-й", start: 2001, end: 2100 },
];

function yearToPercent(year: number) {
  return ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
}

function packIntoRows<T extends { left: number; width: number }>(
  items: T[],
  gap: number
): Array<T & { row: number }> {
  const sorted = [...items].sort((a, b) => a.left - b.left);
  const rows: Array<{ left: number; right: number }[]> = [];
  const result: Array<T & { row: number }> = [];

  for (const item of sorted) {
    const half = item.width / 2;
    const left = item.left - half;
    const right = item.left + half;
    let placed = false;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const hasCollision = row.some(
        (r) => left < r.right + gap && right > r.left - gap
      );
      if (!hasCollision) {
        row.push({ left, right });
        result.push({ ...item, row: rowIndex });
        placed = true;
        break;
      }
    }

    if (!placed) {
      rows.push([{ left, right }]);
      result.push({ ...item, row: rows.length - 1 });
    }
  }

  return result;
}

const STARS = Array.from({ length: 80 }).map((_, i) => ({
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: ((i * 17) % 20) / 10 + 1,
  delay: ((i * 11) % 40) / 10,
  duration: ((i * 23) % 30) / 10 + 2,
}));

function TimelineBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Golden nebula glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1200] via-[#0f1720] to-[#050a10]" />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,183,50,0.35) 0%, rgba(255,140,0,0.1) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Stars */}
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Coordinate grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(1,172,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(1,172,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function formatYear(year: number) {
  if (year < 0) return `${Math.abs(year)} до н.э.`;
  if (year === 0) return "0";
  return String(year);
}

function TimelineArrow() {
  const ticks = [];
  for (let y = MIN_YEAR; y < MAX_YEAR; y += YEAR_STEP) {
    ticks.push(y);
  }
  ticks.push(MAX_YEAR);

  return (
    <div className="relative w-full h-2">
      {/* Arrow shaft */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 shadow-[0_0_20px_rgba(255,200,50,0.6)]" />
      {/* Arrow head */}
      <div
        className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0"
        style={{
          borderTop: "10px solid transparent",
          borderBottom: "10px solid transparent",
          borderLeft: "18px solid #fde68a",
          filter: "drop-shadow(0 0 6px rgba(255,220,100,0.8))",
        }}
      />
      {ticks.map((year) => {
        const left = yearToPercent(year);
        return (
          <div
            key={year}
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${left}%` }}
          >
            <div className="w-px h-3 bg-yellow-200/80" />
            <span className="absolute top-5 text-xs font-mono text-yellow-200/90 whitespace-nowrap">
              {formatYear(year)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EntryModal({
  entry,
  onClose,
}: {
  entry: TimelineEntry;
  onClose: () => void;
}) {
  const isEinstein =
    entry.name.toLowerCase().includes("эйнштейн") || entry.yearStart === 1905;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-lg w-full rounded-2xl border overflow-hidden shadow-2xl ${
          isEinstein
            ? "bg-[#051022] border-blue-500/60 shadow-[0_0_60px_rgba(1,172,255,0.35)]"
            : "bg-[#13181c] border-white/15 shadow-[0_0_40px_rgba(255,200,50,0.15)]"
        }`}
      >
        {isEinstein && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(1,172,255,0.8)]" />
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {entry.portraitUrl ? (
              <img
                src={entry.portraitUrl}
                alt={entry.name}
                className="w-24 h-24 rounded-xl object-cover border-2 border-white/10 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-xl flex items-center justify-center text-white/60 border-2 border-white/10"
                style={{ backgroundColor: `${entry.color}22` }}
              >
                {entry.type === "physicist" ? <User size={32} /> : <FlaskConical size={32} />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white leading-tight mb-1">
                {entry.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-yellow-200/80 font-mono">
                <Clock size={14} />
                <span>
                  {entry.yearStart}
                  {entry.yearEnd ? ` — ${entry.yearEnd}` : ""}
                </span>
              </div>
              <span
                className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold text-white/90"
                style={{ backgroundColor: entry.color }}
              >
                {entry.type === "physicist" ? "Учёный" : "Открытие"}
              </span>
            </div>
          </div>

          <div
            className={`text-sm leading-relaxed text-[#c8cdd1] ${
              isEinstein ? "font-light" : ""
            }`}
          >
            {entry.description}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Timeline() {
  const { data: entries, isLoading } = trpc.timeline.list.useQuery();
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "physicist" | "discovery">("all");
  const [selectedCenturies, setSelectedCenturies] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll to selected century when filters change; default to start
  useEffect(() => {
    if (!scrollRef.current) return;

    if (selectedCenturies.length === 0) {
      // Default view: show the modern era (right end of the timeline)
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: Math.max(0, maxScroll), behavior: "smooth" });
      return;
    }

    const selected = CENTURIES.filter((c) => selectedCenturies.includes(c.label));
    const earliestStart = Math.min(...selected.map((c) => c.start));
    const left = PADDING_X + (yearToPercent(earliestStart) / 100) * TIMELINE_WIDTH;
    scrollRef.current.scrollTo({
      left: Math.max(0, left - PADDING_X),
      behavior: "smooth",
    });
  }, [typeFilter, selectedCenturies, entries]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const progress = scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0;
    setScrollProgress(progress);
  };

  const scrollBy = (amount: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Drag-to-scroll
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollStart.current = scrollRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollStart.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      const typeOk = typeFilter === "all" || e.type === typeFilter;
      if (selectedCenturies.length === 0) return typeOk;

      const selected = CENTURIES.filter((c) => selectedCenturies.includes(c.label));

      if (e.type === "physicist") {
        const lifeEnd = e.yearEnd ?? e.yearStart + 50;
        return selected.some((c) => e.yearStart <= c.end && lifeEnd >= c.start);
      }

      // Discoveries: the year of discovery must fall inside a selected century
      return selected.some((c) => e.yearStart >= c.start && e.yearStart <= c.end);
    });
  }, [entries, typeFilter, selectedCenturies]);

  const physicists = filteredEntries.filter((e) => e.type === "physicist");
  const discoveries = filteredEntries.filter((e) => e.type === "discovery");

  const PHYSICIST_ROW_HEIGHT = 92;
  const DISCOVERY_ROW_HEIGHT = 118;
  const EMPTY_TIMELINE_HEIGHT = 320;

  const physicistItems = useMemo(() => {
    const items = physicists.map((entry) => {
      const endYear = entry.yearEnd ?? entry.yearStart + 50;
      const startX = PADDING_X + (yearToPercent(entry.yearStart) / 100) * TIMELINE_WIDTH;
      const endX = PADDING_X + (yearToPercent(endYear) / 100) * TIMELINE_WIDTH;
      const width = Math.max(160, endX - startX);
      const left = (startX + endX) / 2;
      return { entry, left, width, startX, endX };
    });
    return packIntoRows(items, 16);
  }, [physicists]);

  const discoveryItems = useMemo(() => {
    const items = discoveries.map((entry) => ({
      entry,
      left: PADDING_X + (yearToPercent(entry.yearStart) / 100) * TIMELINE_WIDTH,
      width: 160,
    }));
    return packIntoRows(items, 12);
  }, [discoveries]);

  const hasEntries = filteredEntries.length > 0;
  const physicistRows = physicistItems.length > 0 ? Math.max(...physicistItems.map((i) => i.row)) + 1 : 0;
  const discoveryRows = discoveryItems.length > 0 ? Math.max(...discoveryItems.map((i) => i.row)) + 1 : 0;

  const containerHeight = hasEntries
    ? Math.max(
        400,
        32 +
          physicistRows * PHYSICIST_ROW_HEIGHT +
          24 +
          40 +
          discoveryRows * DISCOVERY_ROW_HEIGHT +
          48
      )
    : EMPTY_TIMELINE_HEIGHT;

  const arrowTop = hasEntries
    ? 32 + physicistRows * PHYSICIST_ROW_HEIGHT + 24
    : containerHeight / 2;
  const discoveriesTop = hasEntries ? arrowTop + 40 : 0;

  const toggleCentury = (label: string) => {
    setSelectedCenturies((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  return (
    <div className="relative min-h-screen pt-16 overflow-x-hidden bg-[#0b0f13]">
      <TimelineBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-[0_0_25px_rgba(255,200,50,0.5)]"
          >
            Стрела времени
          </motion.h1>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-yellow-300" />
              <span className="text-sm font-medium text-white/80">Тип</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="bg-[#1a2024] border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="all">Все</option>
                <option value="physicist">Учёный</option>
                <option value="discovery">Открытие</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-white/80">Век</span>
              {CENTURIES.map((c) => (
                <label
                  key={c.label}
                  className="flex items-center gap-1.5 text-sm text-white/70 cursor-pointer hover:text-white transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCenturies.includes(c.label)}
                    onChange={() => toggleCentury(c.label)}
                    className="rounded border-white/30 bg-transparent text-yellow-400 focus:ring-yellow-400"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll controls */}
        <div className="max-w-6xl mx-auto mb-3 flex items-center justify-between">
          <span className="text-xs text-white/40">Начало — Архимед, III в. до н.э.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-400)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Прокрутить влево"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollBy(400)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Прокрутить вправо"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scroll progress */}
        <div className="max-w-6xl mx-auto h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 transition-all duration-150"
            style={{ width: `${Math.max(scrollProgress * 100, 2)}%` }}
          />
        </div>

        {/* Scrollable timeline area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="relative max-w-6xl mx-auto overflow-x-auto overflow-y-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,200,50,0.5) transparent" }}
        >
          <div
            className="relative"
            style={{
              width: `${TIMELINE_WIDTH + PADDING_X * 2}px`,
              height: `${containerHeight}px`,
              padding: `0 ${PADDING_X}px`,
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {filteredEntries.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10 pointer-events-none">
                    <p>Нет записей, соответствующих выбранным фильтрам.</p>
                  </div>
                )}

                {hasEntries && (
                  <>
                    {/* Physicists row */}
                    <div
                      className="absolute left-0 right-0"
                      style={{ top: 32, height: physicistRows * PHYSICIST_ROW_HEIGHT }}
                    >
                      {physicistItems.map(({ entry, left, width, row }, idx) => (
                        <motion.button
                          key={entry.id}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedEntry(entry)}
                          className="absolute text-left rounded-xl px-4 py-3 border shadow-lg transition-transform hover:scale-105 hover:z-20 overflow-hidden"
                          style={{
                            left: `calc(${left}px - ${width / 2}px)`,
                            top: row * PHYSICIST_ROW_HEIGHT,
                            width: `${width}px`,
                            backgroundColor: `${entry.color}20`,
                            borderColor: `${entry.color}60`,
                            boxShadow: `0 0 18px ${entry.color}30`,
                          }}
                        >
                          <div
                            className="text-sm font-bold text-white leading-tight truncate"
                            style={{ textShadow: `0 0 8px ${entry.color}` }}
                          >
                            {entry.name}
                          </div>
                          <div className="text-xs text-white/70 mt-1 font-mono">
                            {entry.yearStart}
                            {entry.yearEnd ? `—${entry.yearEnd}` : ""}
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Discoveries row */}
                    <div
                      className="absolute left-0 right-0"
                      style={{ top: discoveriesTop, height: discoveryRows * DISCOVERY_ROW_HEIGHT }}
                    >
                      {discoveryItems.map(({ entry, left, row }, idx) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 + 0.2 }}
                          className="absolute flex flex-col items-center"
                          style={{
                            left: `${left}px`,
                            top: row * DISCOVERY_ROW_HEIGHT,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform hover:scale-110 hover:z-20"
                            style={{
                              backgroundColor: `${entry.color}25`,
                              borderColor: entry.color,
                              boxShadow: `0 0 20px ${entry.color}40`,
                            }}
                          >
                            <span
                              className="text-xs font-bold text-white text-center leading-none px-1"
                              style={{ textShadow: `0 0 6px ${entry.color}` }}
                            >
                              {entry.yearStart}
                            </span>
                          </button>
                          <span className="mt-2 text-[11px] text-white/70 text-center w-40 leading-tight break-words">
                            {entry.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {/* Main arrow — always visible */}
                <div
                  className="absolute -translate-y-1/2"
                  style={{ top: arrowTop, left: PADDING_X, width: TIMELINE_WIDTH }}
                >
                  <TimelineArrow />
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-4">
          Используйте колёсико мыши, жесты или кнопки, чтобы прокручивать таймлайн.
        </p>
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <EntryModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
