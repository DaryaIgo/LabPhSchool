import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ChevronDown, ChevronRight, BookOpen, FlaskConical, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router";
import type { TopicNode } from "@db/schema";

interface TreeNode extends TopicNode {
  children: TreeNode[];
}

function buildTree(nodes: TopicNode[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  for (const node of nodes) {
    const treeNode = map.get(node.id)!;
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) {
        parent.children.push(treeNode);
      }
    } else {
      roots.push(treeNode);
    }
  }

  return roots;
}

function NodeContent({ node, onBack }: { node: TreeNode; onBack: () => void }) {
  return (
    <div className="bg-[#1a1f22] border border-[#2eff8c]/20 rounded-xl p-5 mb-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#798389] hover:text-[#2eff8c] transition-colors mb-3"
      >
        <ArrowLeft size={12} /> Назад
      </button>
      <h4 className="text-base font-semibold text-[#2eff8c] mb-1">{node.title}</h4>
      <div className="border-t border-white/5 pt-3">
        {node.content ? (
          <MarkdownRenderer content={node.content} />
        ) : (
          <p className="text-sm text-[#798389]">Нет содержимого</p>
        )}
      </div>
    </div>
  );
}

function SubtopicList({
  nodes,
  activeId,
  onSelect,
  depth = 0,
}: {
  nodes: TreeNode[];
  activeId: number | null;
  onSelect: (id: number) => void;
  depth?: number;
}) {
  return (
    <div className={`space-y-2 ${depth > 0 ? "ml-4 mt-2" : ""}`}>
      {depth === 0 && (
        <h4 className="text-xs font-mono-phys text-[#2eff8c] uppercase tracking-wider mb-3">
          Подтемы:
        </h4>
      )}
      {nodes.map((sub) => (
        <div key={sub.id}>
          <button
            onClick={() => onSelect(sub.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors group text-left ${
              activeId === sub.id
                ? "bg-[#2eff8c]/10 border border-[#2eff8c]/30"
                : "bg-[#262e33] hover:bg-[#2eff8c]/10 border border-transparent"
            }`}
          >
            <FileText size={16} className="text-[#2eff8c] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
              <p className="text-sm font-medium group-hover:text-[#2eff8c] transition-colors">
                {sub.title}
              </p>
              {sub.content && (
                <p className="text-xs text-[#798389] mt-1 line-clamp-2">
                  {sub.content.slice(0, 120).replace(/[#*_`]/g, "")}
                  {sub.content.length > 120 ? "..." : ""}
                </p>
              )}
            </div>
            <BookOpen size={14} className="text-[#798389] group-hover:text-[#2eff8c] transition-colors shrink-0 mt-1" />
          </button>
          {sub.children.length > 0 && activeId !== sub.id && (
            <div className="mt-1">
              <SubtopicList
                nodes={sub.children}
                activeId={activeId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TopicAccordion({
  topic,
  isOpen,
  onToggle,
  activeNodeId,
  onSelectNode,
  onBack,
}: {
  topic: TreeNode;
  isOpen: boolean;
  onToggle: () => void;
  activeNodeId: number | null;
  onSelectNode: (id: number) => void;
  onBack: () => void;
}) {
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

  return (
    <div className="border border-[#434e54] rounded-xl overflow-hidden bg-[#2a3237] transition-all hover:border-[#2eff8c]/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/5"
      >
        <span
          className="font-mono-phys text-2xl font-bold shrink-0"
          style={{ color: topic.color || "#2eff8c" }}
        >
          {String(topic.order).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold">{topic.title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown size={20} className="text-[#2eff8c] shrink-0" />
        ) : (
          <ChevronRight size={20} className="text-[#798389] shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          {topic.content && (
            <div className="text-[#c8cdd1] text-sm mb-4 leading-relaxed">
              <MarkdownRenderer content={topic.content} />
            </div>
          )}

          {activeNode ? (
            <NodeContent node={activeNode} onBack={onBack} />
          ) : (
            <SubtopicList
              nodes={topic.children}
              activeId={activeNodeId}
              onSelect={onSelectNode}
            />
          )}

          {!activeNode && (
            <div className="mt-4 flex gap-3">
              <Link
                to={`/labs`}
                className="inline-flex items-center gap-2 text-xs text-[#2eff8c] hover:underline"
              >
                <FlaskConical size={14} />
                Перейти к лабораториям
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Course() {
  const [openTopicId, setOpenTopicId] = useState<number | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

  const { data: nodes, isLoading } = trpc.course.topicNodes.useQuery();

  const tree = useMemo(() => {
    if (!nodes) return [];
    return buildTree(nodes);
  }, [nodes]);

  const handleToggleTopic = (id: number) => {
    setOpenTopicId((prev) => (prev === id ? null : id));
    setActiveNodeId(null);
  };

  const handleSelectNode = (id: number) => {
    setActiveNodeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative bg-[#262e33] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#2eff8c"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="formula-text text-sm mb-4">E = mc² | полный курс</p>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6">
            Курс физики: полная программа
          </h1>
          <p className="text-[#c8cdd1] max-w-2xl mx-auto">
            От кинематики до квантовой физики — структурированный материал с
            алгоритмами, формулами и примерами
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="section-light py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-8 text-center">
            Темы курса
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#2eff8c]" size={32} />
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center text-[#798389] py-12">
              Пока нет тем. Добавьте их в панели администратора.
            </div>
          ) : (
            <div className="space-y-3">
              {tree.map((topic) => (
                <TopicAccordion
                  key={topic.id}
                  topic={topic}
                  isOpen={openTopicId === topic.id}
                  onToggle={() => handleToggleTopic(topic.id)}
                  activeNodeId={activeNodeId}
                  onSelectNode={handleSelectNode}
                  onBack={() => setActiveNodeId(null)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
