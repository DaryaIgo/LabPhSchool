import {
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";
import { X, ArrowLeft, FileText, ExternalLink, Sparkles } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { CategoryIcon } from "./CategoryIcon";
import type { TopicNode } from "@db/schema";

interface TreeNode extends TopicNode {
  children: TreeNode[];
}

interface SubtopicOrbitItem {
  node: TreeNode;
  angle: number;
  x: number;
  y: number;
}

function NodeContent({
  node,
  onBack,
  onSelectNode,
  jupyterUrl,
  showJupyter,
  topicColor,
}: {
  node: TreeNode;
  onBack: () => void;
  onSelectNode: (id: number) => void;
  jupyterUrl?: string | null;
  showJupyter?: boolean;
  topicColor?: string | null;
}) {
  const accent = topicColor || "#2eff8c";

  return (
    <div className="animate-fadeIn w-full max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-[#a0a8ad] hover:text-[#2eff8c] transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Назад к подтемам
      </button>

      <div
        className="rounded-2xl border border-[#434e54] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(42,50,55,0.95) 0%, rgba(26,31,34,0.95) 100%)",
        }}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shrink-0"
              style={{
                backgroundColor: `${accent}15`,
                color: accent,
              }}
            >
              <FileText size={18} />
            </span>
            <h4 className="text-xl font-semibold text-white">{node.title}</h4>
          </div>
        </div>

        <div className="p-6">
          {node.content ? (
            <MarkdownRenderer content={node.content} />
          ) : (
            <p className="text-sm text-[#798389]">Нет содержимого</p>
          )}

          {showJupyter &&
            (jupyterUrl ? (
              <a
                href={jupyterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-3 py-1.5 rounded-md hover:bg-[#2eff8c]/20 transition-colors"
              >
                <ExternalLink size={12} />
                Jupyter- {node.title}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 mt-4 text-xs text-[#798389] bg-white/5 px-3 py-1.5 rounded-md">
                <ExternalLink size={12} />
                Jupyter: не задан
              </span>
            ))}

          {node.children.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <h5 className="text-sm font-semibold text-[#798389] uppercase tracking-wider mb-4">
                Вложенные материалы
              </h5>
              <div className="grid sm:grid-cols-2 gap-3">
                {node.children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => onSelectNode(child.id)}
                    className="text-left bg-[#1a1f22] border border-[#434e54] rounded-xl p-4 hover:border-[#2eff8c]/40 transition-colors"
                  >
                    <FileText size={16} className="text-[#2eff8c] mb-2" />
                    <span className="text-sm text-white">{child.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);

  return size;
}

interface TopicOrbitViewProps {
  topic: TreeNode;
  activeNodeId: number | null;
  onSelectNode: (id: number | null) => void;
  onClose: () => void;
  jupyterUrlMap?: Map<string, string | null>;
  showJupyter?: boolean;
}

export default function TopicOrbitView({
  topic,
  activeNodeId,
  onSelectNode,
  onClose,
  jupyterUrlMap,
  showJupyter,
}: TopicOrbitViewProps) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const { width: orbitWidth, height: orbitHeight } = useContainerSize(orbitRef);
  const centerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const accent = topic.color || "#2eff8c";
  const isMobile = orbitWidth > 0 && orbitWidth < 640;

  const activeNode = useMemo(() => {
    const find = (nodes: TreeNode[]): TreeNode | null => {
      for (const n of nodes) {
        if (n.id === activeNodeId) return n;
        const found = find(n.children);
        if (found) return found;
      }
      return null;
    };
    return find(topic.children);
  }, [topic.children, activeNodeId]);

  const subtopics = topic.children;

  const orbitItems: SubtopicOrbitItem[] = useMemo(() => {
    if (subtopics.length === 0 || orbitWidth === 0 || orbitHeight === 0) return [];

    const minDim = Math.min(orbitWidth, orbitHeight);
    // Base radius scales with viewport; add a little extra when there are many nodes
    const countFactor = Math.max(0, subtopics.length - 6) * 16;
    const baseRadius = isMobile
      ? Math.min(minDim * 0.34, 150 + countFactor * 0.6)
      : Math.min(minDim * 0.38, 320 + countFactor);

    const radius = baseRadius;
    const startAngle = -Math.PI / 2; // top
    const angleStep = (Math.PI * 2) / subtopics.length;

    return subtopics.map((node, index) => {
      const angle = startAngle + index * angleStep;
      return {
        node,
        angle,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.9, // slight ellipse for better vertical fit
      };
    });
  }, [subtopics, orbitWidth, orbitHeight, isMobile]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeNodeId !== null) {
          onSelectNode(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeNodeId, onClose, onSelectNode]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (activeNodeId !== null) {
        onSelectNode(null);
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d1012]/85 backdrop-blur-md animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#434e54] bg-[#1a1f22]/80 text-[#a0a8ad] hover:text-white hover:border-[#2eff8c]/50 transition-colors"
        aria-label="Закрыть"
      >
        <X size={18} />
      </button>

      {activeNode ? (
        <div
          className="w-full max-w-4xl max-h-[85vh] overflow-y-auto px-6 py-8"
          onClick={e => e.stopPropagation()}
        >
          <NodeContent
            node={activeNode}
            onBack={() => onSelectNode(null)}
            onSelectNode={onSelectNode}
            jupyterUrl={jupyterUrlMap?.get(activeNode.title)}
            showJupyter={showJupyter}
            topicColor={topic.color}
          />
        </div>
      ) : (
        <div
          ref={orbitRef}
          className="relative w-full h-full max-w-6xl max-h-[85vh] mx-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Nebula background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full animate-nebula-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(46,255,140,0.12) 0%, rgba(46,255,140,0.04) 35%, transparent 70%)",
                filter: "blur(80px)",
              }}
            />
            <div
              className="absolute top-[15%] left-[20%] w-[520px] h-[520px] rounded-full animate-nebula-drift"
              style={{
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)",
                filter: "blur(90px)",
              }}
            />
            <div
              className="absolute bottom-[12%] right-[18%] w-[480px] h-[480px] rounded-full animate-nebula-drift-slow"
              style={{
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.13) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)",
                filter: "blur(85px)",
              }}
            />
            <div
              className="absolute top-[30%] right-[25%] w-[360px] h-[360px] rounded-full animate-nebula-drift-slow"
              style={{
                background:
                  "radial-gradient(circle, rgba(14,165,233,0.11) 0%, rgba(14,165,233,0.03) 40%, transparent 70%)",
                filter: "blur(70px)",
              }}
            />
            <div
              className="absolute bottom-[25%] left-[15%] w-[320px] h-[320px] rounded-full animate-nebula-drift"
              style={{
                background:
                  "radial-gradient(circle, rgba(236,72,153,0.10) 0%, rgba(236,72,153,0.03) 40%, transparent 70%)",
                filter: "blur(65px)",
              }}
            />
          </div>

          {/* Center topic node */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              ref={centerRef}
              className="flex flex-col items-center animate-snake-float"
            >
              <div
                className="relative flex flex-col items-center justify-center text-center w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 transition-all duration-500 hover:scale-105"
                style={{
                  borderColor: `${accent}60`,
                  backgroundColor: `${accent}14`,
                  boxShadow: `0 0 60px ${accent}20, inset 0 0 30px ${accent}10`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full opacity-60"
                  style={{
                    boxShadow: `0 0 80px ${accent}30`,
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <CategoryIcon
                    iconKey={topic.iconType}
                    size={36}
                    color={accent}
                  />
                  <span
                    className="text-xl sm:text-2xl font-bold font-mono-phys"
                    style={{ color: accent }}
                  >
                    {String(topic.order).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <h3
                className="mt-5 text-xl sm:text-2xl font-bold text-white text-center max-w-[260px]"
                style={{ textShadow: `0 0 24px ${accent}40` }}
              >
                {topic.title}
              </h3>
              {topic.content && (
                <p className="mt-2 text-sm text-[#a0a8ad] text-center max-w-[320px] line-clamp-3 px-4">
                  {topic.content.replace(/[#*_`[\]]/g, "").slice(0, 120)}
                  {topic.content.length > 120 ? "..." : ""}
                </p>
              )}
            </div>
          </div>

          {/* Subtopic orbit nodes */}
          {orbitItems.map((item, index) => {
            const sub = item.node;
            const floatDelay = `${(index * 0.7) % 6}s`;
            const popDelay = `${index * 0.08}s`;
            const isHovered = hoveredId === sub.id;

            return (
              <div
                key={sub.id}
                className="absolute left-1/2 top-1/2 z-20 flex flex-col items-center"
                style={{
                  transform: `translate(-50%, -50%) translate(${item.x}px, ${item.y}px)`,
                }}
                onMouseEnter={() => setHoveredId(sub.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Hover card */}
                <div
                  className={`
                    absolute left-1/2 -translate-x-1/2
                    w-56 sm:w-64
                    opacity-0 invisible scale-95
                    ${isHovered ? "opacity-100 visible scale-100" : ""}
                    transition-all duration-300 ease-out pointer-events-none z-30
                    ${item.y < 0 ? "top-[calc(100%+0.75rem)]" : "bottom-[calc(100%+0.75rem)]"}
                  `}
                >
                  <div
                    className="relative overflow-hidden rounded-2xl border p-4 text-left shadow-2xl backdrop-blur-md"
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
                    <h5 className="font-bold text-white text-sm leading-tight mb-2">
                      {sub.title}
                    </h5>
                    {sub.content && (
                      <p className="text-xs text-[#c8cdd1] leading-relaxed line-clamp-4">
                        {sub.content
                          .replace(/[#*_`[\]]/g, "")
                          .slice(0, 140)}
                        {sub.content.length > 140 ? "..." : ""}
                      </p>
                    )}
                    <div
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium"
                      style={{ color: accent }}
                    >
                      Открыть
                      <Sparkles size={12} />
                    </div>
                  </div>
                </div>

                <div
                  className="animate-orbit-pop-in"
                  style={{ animationDelay: popDelay }}
                >
                  <button
                    type="button"
                    className="outline-none bg-transparent border-0 p-0 flex flex-col items-center group"
                    onClick={() => onSelectNode(sub.id)}
                  >
                    <div
                      className={`
                        relative flex flex-col items-center justify-center text-center
                        w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-500 ease-out
                        group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(46,255,140,0.35)]
                        animate-snake-float
                      `}
                      style={{
                        borderColor: `${accent}50`,
                        backgroundColor: `${accent}12`,
                        boxShadow: `0 0 24px ${accent}12`,
                        animationDelay: floatDelay,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          boxShadow: `0 0 40px ${accent}40, inset 0 0 16px ${accent}14`,
                        }}
                      />
                      <FileText
                        size={isMobile ? 16 : 20}
                        className="relative z-10"
                        style={{ color: accent }}
                      />
                    </div>
                    <span
                      className="mt-3 text-xs sm:text-sm font-semibold text-center max-w-[120px] line-clamp-2 transition-colors"
                      style={{ color: accent }}
                    >
                      {sub.title}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

          {subtopics.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <p className="text-sm text-[#798389]">
                Подтем пока нет. Добавьте их в панели администратора.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
