import {
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import { ChevronRight, Sparkles } from "lucide-react";

export interface SnakeTimelineItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  color?: string;
  order?: number;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  meta?: ReactNode;
  details?: ReactNode;
  disabled?: boolean;
}

interface SnakeTimelineProps {
  items: SnakeTimelineItem[];
  columns?: number;
  className?: string;
  baseSize?: "sm" | "md" | "lg";
}

const DEFAULT_ACCENT = "#2eff8c";

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c1: string;
  c2: string;
}

export default function SnakeTimeline({
  items,
  columns = 4,
  className = "",
  baseSize = "md",
}: SnakeTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const rafRef = useRef<number | undefined>(undefined);

  const rows = useMemo(() => {
    const result: SnakeTimelineItem[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns));
    }
    return result;
  }, [items, columns]);

  const gridColsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : columns === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  const flatItems = useMemo(() => {
    const list: Array<{
      item: SnakeTimelineItem;
      rowIndex: number;
      colIndex: number;
    }> = [];
    rows.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        list.push({ item, rowIndex, colIndex });
      });
    });
    return list;
  }, [rows]);

  const drawLines = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const containerRect = container.getBoundingClientRect();
    const nodeCenters = new Map<
      string,
      { x: number; y: number; r: number; color: string }
    >();

    for (const { item } of flatItems) {
      const el = nodeRefs.current.get(String(item.id));
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      nodeCenters.set(String(item.id), {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
        r: rect.width / 2,
        color: item.color || DEFAULT_ACCENT,
      });
    }

    const segments: Segment[] = [];

    for (const row of rows) {
      // Horizontal connections only
      for (let i = 0; i < row.length - 1; i++) {
        const a = nodeCenters.get(String(row[i].id));
        const b = nodeCenters.get(String(row[i + 1].id));
        if (!a || !b) continue;
        segments.push({
          x1: a.x + a.r,
          y1: a.y,
          x2: b.x - b.r,
          y2: b.y,
          c1: a.color,
          c2: b.color,
        });
      }
    }

    // Render SVG by direct DOM mutation
    svg.innerHTML = "";
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    segments.forEach((seg, i) => {
      const gradId = `snake-grad-${i}`;
      const grad = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient"
      );
      grad.setAttribute("id", gradId);
      grad.setAttribute("x1", "0%");
      grad.setAttribute("y1", "0%");
      grad.setAttribute("x2", "100%");
      grad.setAttribute("y2", "0%");
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      const angle =
        (Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1) * 180) / Math.PI;
      grad.setAttribute(
        "gradientTransform",
        `rotate(${angle}, ${(seg.x1 + seg.x2) / 2}, ${(seg.y1 + seg.y2) / 2})`
      );

      const stop1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop"
      );
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", seg.c1);
      stop1.setAttribute("stop-opacity", "0.85");

      const stop2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop"
      );
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", seg.c2);
      stop2.setAttribute("stop-opacity", "0.85");

      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
    });
    svg.appendChild(defs);

    segments.forEach((seg, i) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", String(seg.x1));
      line.setAttribute("y1", String(seg.y1));
      line.setAttribute("x2", String(seg.x2));
      line.setAttribute("y2", String(seg.y2));
      line.setAttribute("stroke", `url(#snake-grad-${i})`);
      line.setAttribute("stroke-width", "2.5");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("style", `filter: drop-shadow(0 0 5px ${seg.c1});`);
      svg.appendChild(line);
    });
  }, [flatItems, rows]);

  useLayoutEffect(() => {
    drawLines();
  }, [drawLines]);

  useLayoutEffect(() => {
    const animate = () => {
      drawLines();
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawLines]);

  useLayoutEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(drawLines);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawLines]);

  const sizeClasses = {
    sm: {
      cell: "min-h-[130px]",
      node: "w-16 h-16",
      expanded: "w-64",
      title: "text-xs",
      subtitle: "text-[10px]",
    },
    md: {
      cell: "min-h-[170px]",
      node: "w-20 h-20",
      expanded: "w-72",
      title: "text-sm",
      subtitle: "text-xs",
    },
    lg: {
      cell: "min-h-[210px]",
      node: "w-24 h-24",
      expanded: "w-80",
      title: "text-base",
      subtitle: "text-sm",
    },
  };

  const sz = sizeClasses[baseSize];

  return (
    <div ref={containerRef} className={`relative pt-20 ${className}`}>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        aria-hidden="true"
      />

      <div className={`relative z-10 grid ${gridColsClass} gap-y-12`}>
        {rows.map((row, rowIndex) =>
          row.map((item, index) => {
            const accent = item.color || DEFAULT_ACCENT;
            const hasLink = !!item.href && !item.disabled;
            const isClickable = !item.disabled && (hasLink || item.onClick);
            const animationDelay = `${((rowIndex * columns + index) * 0.7) % 6}s`;

            const nodeCircle = (
              <div
                ref={el => {
                  if (el) nodeRefs.current.set(String(item.id), el);
                }}
                className={`
                  group relative flex flex-col items-center justify-center text-center
                  ${sz.node} rounded-full border-2 transition-all duration-500 ease-out
                  hover:scale-110 hover:shadow-[0_0_30px_rgba(46,255,140,0.35)]
                  ${isClickable ? "cursor-pointer" : "cursor-default"}
                  ${item.disabled ? "opacity-50" : ""}
                `}
                style={{
                  borderColor: `${accent}50`,
                  backgroundColor: `${accent}12`,
                  boxShadow: `0 0 24px ${accent}12`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: `0 0 48px ${accent}45, inset 0 0 20px ${accent}18`,
                  }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                  {item.icon ? (
                    <span style={{ color: accent }}>{item.icon}</span>
                  ) : (
                    <span
                      className="text-xl font-bold font-mono-phys"
                      style={{ color: accent }}
                    >
                      {String(item.order ?? index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={item.id}
                className="group/tile relative flex justify-center min-w-0"
              >
                <div
                  className={`
                    flex flex-col items-center justify-start
                    ${sz.cell} px-2 transition-all duration-500
                    animate-snake-float
                  `}
                  style={{ animationDelay }}
                >
                  {/* Title above the node */}
                  <div className="mb-4 text-center max-w-[95%]">
                    <h4
                      className={`font-bold leading-tight ${sz.title} transition-colors`}
                      style={{ color: accent }}
                    >
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className={`mt-1 text-[#798389] ${sz.subtitle}`}>
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {isClickable ? (
                    hasLink ? (
                      <Link
                        to={item.href!}
                        className="outline-none"
                        onClick={e => e.stopPropagation()}
                      >
                        {nodeCircle}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="outline-none bg-transparent border-0 p-0"
                        onClick={item.onClick}
                      >
                        {nodeCircle}
                      </button>
                    )
                  ) : (
                    nodeCircle
                  )}
                </div>

                {/* Expanded hover card */}
                <div
                  className={`
                    absolute bottom-[calc(100%-1rem)] left-1/2 -translate-x-1/2 z-30
                    ${sz.expanded}
                    opacity-0 invisible scale-95
                    group-hover/tile:opacity-100 group-hover/tile:visible group-hover/tile:scale-100
                    transition-all duration-300 ease-out pointer-events-none
                  `}
                >
                  <div
                    className="relative overflow-hidden rounded-2xl border p-5 text-left shadow-2xl backdrop-blur-md"
                    style={{
                      borderColor: `${accent}40`,
                      backgroundColor: "rgba(26,31,34,0.96)",
                      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accent}15`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                      }}
                    />

                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${accent}15`,
                          color: accent,
                        }}
                      >
                        {item.icon ?? <Sparkles size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-white text-base leading-tight">
                          {item.title}
                        </h5>
                        {item.subtitle && (
                          <p className="text-xs text-[#798389] mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-[#c8cdd1] leading-relaxed mb-3 line-clamp-4">
                        {item.description}
                      </p>
                    )}

                    {item.details && <div className="mb-3">{item.details}</div>}

                    {item.meta && <div className="mb-3">{item.meta}</div>}

                    {isClickable && (
                      <div
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: accent }}
                      >
                        {hasLink ? "Перейти" : "Открыть"}
                        <ChevronRight size={14} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
