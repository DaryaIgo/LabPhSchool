import {
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
  useEffect,
} from "react";
import { X, ArrowLeft, FileText, ExternalLink, BookOpen } from "lucide-react";
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
  topicTitle,
}: {
  node: TreeNode;
  onBack: () => void;
  onSelectNode: (id: number) => void;
  jupyterUrl?: string | null;
  showJupyter?: boolean;
  topicTitle?: string;
}) {
  const wordCount = node.content
    ? node.content
        .replace(/[#*_`[\]\n\r]/g, " ")
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#0b0d0f] animate-fadeIn">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#0b0d0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-[#a0a8ad] hover:text-[#2eff8c] transition-colors shrink-0"
          >
            <ArrowLeft size={16} /> Назад
          </button>
          <h1 className="flex-1 text-sm sm:text-base font-semibold text-white truncate text-center">
            {node.title}
          </h1>
          <div className="w-16 shrink-0" />
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        {topicTitle && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2eff8c]/20 bg-[#2eff8c]/5 text-[#2eff8c] text-xs font-medium tracking-wide mb-4">
            {topicTitle}
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
          {node.title}
        </h2>
        <div className="flex items-center gap-4 mt-4 text-sm text-[#798389]">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={14} />
            {readTime} мин чтения
          </span>
          {wordCount > 0 && <span>{wordCount} слов</span>}
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        {node.content ? (
          <MarkdownRenderer content={node.content} />
        ) : (
          <p className="text-lg text-[#798389]">Нет содержимого</p>
        )}

        {showJupyter && (
          <div className="mt-10 pt-6 border-t border-white/10">
            {jupyterUrl ? (
              <a
                href={jupyterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-[#2eff8c]/10 text-[#2eff8c] px-4 py-2 rounded-lg hover:bg-[#2eff8c]/20 transition-colors"
              >
                <ExternalLink size={16} />
                Открыть Jupyter-ноутбук: {node.title}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-[#798389] bg-white/5 px-4 py-2 rounded-lg">
                <ExternalLink size={16} />
                Jupyter-ноутбук не задан
              </span>
            )}
          </div>
        )}

        {node.children.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h5 className="text-lg font-semibold text-white mb-5">
              Вложенные материалы
            </h5>
            <div className="grid sm:grid-cols-2 gap-4">
              {node.children.map(child => (
                <button
                  key={child.id}
                  onClick={() => onSelectNode(child.id)}
                  className="text-left bg-[#15191c] border border-[#2a3136] rounded-xl p-5 hover:border-[#2eff8c]/40 hover:bg-[#1a1f22] transition-colors group"
                >
                  <FileText
                    size={20}
                    className="text-[#2eff8c] mb-3 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-base font-medium text-white">
                    {child.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </article>
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

interface PlanetStyle {
  background: string;
  boxShadow: string;
  ring?: boolean;
}

function getPlanetStyle(order: number): PlanetStyle {
  const planets: PlanetStyle[] = [
    {
      background:
        "linear-gradient(160deg, #b8b8b8 0%, #6e6e6e 60%, #4a4a4a 100%)",
      boxShadow: "0 0 28px rgba(184,184,184,0.45)",
    }, // Mercury
    {
      background:
        "linear-gradient(160deg, #f8e9b8 0%, #d4a574 50%, #a67c52 100%)",
      boxShadow: "0 0 28px rgba(248,233,184,0.45)",
    }, // Venus
    {
      background:
        "linear-gradient(160deg, #4a90e2 0%, #2d6a4f 45%, #1a5f2a 100%)",
      boxShadow: "0 0 28px rgba(74,144,226,0.45)",
    }, // Earth
    {
      background:
        "linear-gradient(160deg, #e07a4f 0%, #a84a28 50%, #6b2310 100%)",
      boxShadow: "0 0 28px rgba(224,122,79,0.45)",
    }, // Mars
    {
      background:
        "repeating-linear-gradient(180deg, #d4a574 0px, #c49a6c 7px, #8b5a2b 14px, #c49a6c 21px, #d4a574 28px)",
      boxShadow: "0 0 28px rgba(212,165,116,0.45)",
    }, // Jupiter
    {
      background:
        "linear-gradient(160deg, #f5e6a3 0%, #d4a574 50%, #a6844a 100%)",
      boxShadow: "0 0 28px rgba(245,230,163,0.45)",
      ring: true,
    }, // Saturn
    {
      background:
        "linear-gradient(160deg, #a8e0f0 0%, #6bb3cd 50%, #4a90a8 100%)",
      boxShadow: "0 0 28px rgba(168,224,240,0.45)",
    }, // Uranus
    {
      background:
        "linear-gradient(160deg, #4a6de2 0%, #2a4aa8 50%, #1a2f6b 100%)",
      boxShadow: "0 0 28px rgba(74,109,226,0.45)",
    }, // Neptune
  ];
  return planets[(order - 1) % planets.length];
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseInOverlay, setMouseInOverlay] = useState(false);
  const mouseRafRef = useRef<number | undefined>(undefined);
  const mousePosRef = useRef({ x: 0, y: 0 });

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
    if (subtopics.length === 0 || orbitWidth === 0 || orbitHeight === 0)
      return [];

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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = orbitRef.current?.getBoundingClientRect();
      if (!rect) return;
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!mouseRafRef.current) {
        mouseRafRef.current = requestAnimationFrame(() => {
          setMousePos(mousePosRef.current);
          mouseRafRef.current = undefined;
        });
      }
    },
    [setMousePos]
  );

  const handleMouseEnter = () => setMouseInOverlay(true);
  const handleMouseLeave = () => setMouseInOverlay(false);

  const centerX = orbitWidth / 2;
  const centerY = orbitHeight / 2;

  const getGravityOffset = useCallback(
    (x: number, y: number) => {
      if (!mouseInOverlay || orbitWidth === 0 || orbitHeight === 0) {
        return { x: 0, y: 0 };
      }
      const nodeX = centerX + x;
      const nodeY = centerY + y;
      const dx = mousePos.x - nodeX;
      const dy = mousePos.y - nodeY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = Math.min(orbitWidth, orbitHeight) * 0.65;
      const maxOffset = 45;
      if (distance >= maxDistance || distance < 1) return { x: 0, y: 0 };
      const force = maxOffset * (1 - distance / maxDistance);
      return {
        x: (dx / distance) * force,
        y: (dy / distance) * force,
      };
    },
    [mouseInOverlay, mousePos, centerX, centerY, orbitWidth, orbitHeight]
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d1012]/85 backdrop-blur-md animate-fadeIn rocket-cursor"
      onClick={handleBackdropClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={onClose}
        className={`absolute top-5 right-5 inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#434e54] bg-[#1a1f22]/80 text-[#a0a8ad] hover:text-white hover:border-[#2eff8c]/50 transition-colors ${activeNode ? "z-[80]" : "z-50"}`}
        aria-label="Закрыть"
      >
        <X size={18} />
      </button>

      {activeNode ? (
        <div
          className="fixed inset-0 z-[70] bg-[#0b0d0f] overflow-y-auto reader-cursor"
          onClick={e => e.stopPropagation()}
        >
          <NodeContent
            node={activeNode}
            onBack={() => onSelectNode(null)}
            onSelectNode={onSelectNode}
            jupyterUrl={jupyterUrlMap?.get(activeNode.title)}
            showJupyter={showJupyter}
            topicTitle={topic.title}
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
              style={{ animationDelay: "2.5s" }}
            >
              <div
                onClick={onClose}
                role="button"
                tabIndex={0}
                aria-label="Закрыть"
                className="relative flex flex-col items-center justify-center text-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 transition-all duration-500 hover:scale-105 cursor-pointer"
                style={{
                  borderColor: `${accent}60`,
                  backgroundColor: `${accent}14`,
                  boxShadow: `0 0 60px ${accent}20, inset 0 0 30px ${accent}10`,
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClose();
                  }
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
                    size={isMobile ? 20 : 28}
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
            </div>
          </div>

          {/* Subtopic orbit nodes */}
          {orbitItems.map((item, index) => {
            const sub = item.node;
            const floatDelay = `${(index * 0.7) % 6}s`;
            const popDelay = `${index * 0.08}s`;
            const gravity = getGravityOffset(item.x, item.y);
            const labelOnLeft = item.x < 0;

            const planetOrder = sub.order || index + 1;
            const planet = getPlanetStyle(planetOrder);

            return (
              <div
                key={sub.id}
                className="absolute left-1/2 top-1/2 z-20 will-change-transform"
                style={{
                  transform: `translate(-50%, -50%) translate(${item.x + gravity.x}px, ${item.y + gravity.y}px)`,
                }}
              >
                <div
                  className="animate-orbit-pop-in"
                  style={{ animationDelay: popDelay }}
                >
                  <div
                    className="relative flex items-center animate-snake-float"
                    style={{ animationDelay: floatDelay }}
                  >
                    <button
                      type="button"
                      className="outline-none bg-transparent border-0 p-0 relative z-10 group"
                      onClick={() => onSelectNode(sub.id)}
                    >
                      <div
                        className={`
                          relative flex flex-col items-center justify-center text-center
                          w-20 h-20 sm:w-28 sm:h-28 rounded-full transition-all duration-500 ease-out
                          group-hover:scale-110
                        `}
                        style={{
                          background: planet.background,
                          boxShadow: planet.boxShadow,
                        }}
                      >
                        {/* 3D sphere highlight */}
                        <div
                          className="absolute inset-0 rounded-full opacity-40"
                          style={{
                            background:
                              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 45%)",
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            boxShadow:
                              "0 0 48px rgba(255,255,255,0.25), inset 0 0 24px rgba(255,255,255,0.15)",
                          }}
                        />

                        {/* Saturn ring */}
                        {planet.ring && (
                          <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                            style={{
                              width: "140%",
                              height: "40%",
                              border: "3px solid rgba(220, 200, 150, 0.6)",
                              boxShadow: "0 0 10px rgba(220,200,150,0.4)",
                              transform: "translate(-50%, -50%) rotate(-15deg)",
                            }}
                          />
                        )}
                      </div>
                    </button>

                    {/* Side label card */}
                    <div
                      className={`
                        absolute top-1/2 -translate-y-1/2 z-20
                        w-40 sm:w-52
                        ${labelOnLeft ? "right-full mr-4 text-right" : "left-full ml-4 text-left"}
                      `}
                    >
                      <div
                        className="rounded-xl border p-3 backdrop-blur-md"
                        style={{
                          borderColor: `${accent}40`,
                          backgroundColor: "rgba(26,31,34,0.92)",
                          boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 24px ${accent}10`,
                        }}
                      >
                        <h6
                          className="text-sm font-bold leading-tight mb-1"
                          style={{ color: accent }}
                        >
                          {sub.title}
                        </h6>
                        {sub.content && (
                          <p className="text-[11px] sm:text-xs text-[#a0a8ad] leading-relaxed line-clamp-2">
                            {sub.content
                              .replace(/[#*_`[\]]/g, "")
                              .slice(0, 100)}
                            {sub.content.length > 100 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
