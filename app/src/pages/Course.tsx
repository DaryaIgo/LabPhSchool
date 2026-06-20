import { useState, useMemo, useLayoutEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ChevronDown, ChevronRight, FlaskConical, FileText, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
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

function NodeContent({ node, onBack, jupyterUrl, showJupyter }: { node: TreeNode; onBack: () => void; jupyterUrl?: string | null; showJupyter?: boolean }) {
  return (
    <div className="bg-[#222a2f] border border-[#2eff8c]/20 rounded-xl p-6 mb-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-[#a0a8ad] hover:text-[#2eff8c] transition-colors mb-3"
      >
        <ArrowLeft size={14} /> Назад
      </button>
      <h4 className="text-lg font-semibold text-[#2eff8c] mb-3">{node.title}</h4>
      <div className="border-t border-white/5 pt-4">
        {node.content ? (
          <MarkdownRenderer content={node.content} />
        ) : (
          <p className="text-sm text-[#798389]">Нет содержимого</p>
        )}
        {showJupyter && (
          jupyterUrl ? (
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
          )
        )}
      </div>
    </div>
  );
}

function SubtopicList({
  nodes,
  activeId,
  onSelect,
  jupyterUrlMap,
  showJupyter,
}: {
  nodes: TreeNode[];
  activeId: number | null;
  onSelect: (id: number) => void;
  jupyterUrlMap?: Map<string, string | null>;
  showJupyter?: boolean;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {nodes.map((sub) => {
        const jupyterUrl = jupyterUrlMap?.get(sub.title);
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className={`group text-left bg-[#1a1f22] border rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col ${
              activeId === sub.id
                ? "border-[#2eff8c]/50"
                : "border-[#434e54] hover:border-[#2eff8c]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <FileText size={20} className="text-[#2eff8c]" />
              </div>
              <ChevronRight size={18} className="text-[#798389] group-hover:text-[#2eff8c] transition-colors" />
            </div>
            <h5 className="text-base font-medium text-white group-hover:text-[#2eff8c] transition-colors mb-3 leading-snug">
              {sub.title}
            </h5>
            {showJupyter && (
              jupyterUrl ? (
                <a
                  href={jupyterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs bg-[#2eff8c]/10 text-[#2eff8c] px-2 py-1 rounded-md hover:bg-[#2eff8c]/20 transition-colors mt-auto"
                >
                  <ExternalLink size={12} />
                  Jupyter- {sub.title}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-[#798389] bg-white/5 px-2 py-1 rounded-md mt-auto">
                  <ExternalLink size={12} />
                  Jupyter: не задан
                </span>
              )
            )}
          </button>
        );
      })}
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
  jupyterUrlMap,
  showJupyter,
}: {
  topic: TreeNode;
  isOpen: boolean;
  onToggle: () => void;
  activeNodeId: number | null;
  onSelectNode: (id: number) => void;
  onBack: () => void;
  jupyterUrlMap?: Map<string, string | null>;
  showJupyter?: boolean;
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
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold shrink-0"
          style={{
            backgroundColor: `${topic.color || "#2eff8c"}1a`,
            color: topic.color || "#2eff8c",
          }}
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
            <div className="mb-5">
              <MarkdownRenderer content={topic.content} />
            </div>
          )}

          {activeNode ? (
            <>
              <NodeContent node={activeNode} onBack={onBack} jupyterUrl={jupyterUrlMap?.get(activeNode.title)} showJupyter={showJupyter} />
              {activeNode.children.length > 0 && (
                <div className="mt-4">
                  <SubtopicList
                    nodes={activeNode.children}
                    activeId={activeNodeId}
                    onSelect={onSelectNode}
                    jupyterUrlMap={jupyterUrlMap}
                    showJupyter={showJupyter}
                  />
                </div>
              )}
            </>
          ) : (
            <SubtopicList
              nodes={topic.children}
              activeId={activeNodeId}
              onSelect={onSelectNode}
              jupyterUrlMap={jupyterUrlMap}
            />
          )}

          {!activeNode && topic.labCategorySlug && (
            <div className="mt-4 flex gap-3">
              <Link
                to={`/labs/category/${topic.labCategorySlug}`}
                className="inline-flex items-center gap-2 text-xs text-[#2eff8c] hover:underline"
              >
                <FlaskConical size={14} />
                Перейти к лабораторным
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
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: nodes, isLoading } = trpc.course.topicNodes.useQuery();
  const { data: subtopics } = trpc.course.listSubtopics.useQuery();

  const tree = useMemo(() => {
    if (!nodes) return [];
    return buildTree(nodes);
  }, [nodes]);

  const jupyterUrlMap = useMemo(() => {
    const map = new Map<string, string | null>();
    subtopics?.forEach((s) => map.set(s.title, s.jupyterUrl));
    return map;
  }, [subtopics]);

  const syncUrlWithState = useCallback((topicId: number | null, nodeId: number | null) => {
    const params = new URLSearchParams();
    if (topicId !== null && tree.length > 0) {
      const topic = tree.find((t) => t.id === topicId);
      if (topic) {
        params.set("topic", topic.title);
        if (nodeId !== null) {
          const findNodeTitle = (nodes: TreeNode[]): string | null => {
            for (const n of nodes) {
              if (n.id === nodeId) return n.title;
              const found = findNodeTitle(n.children);
              if (found) return found;
            }
            return null;
          };
          const nodeTitle = findNodeTitle(topic.children);
          if (nodeTitle) params.set("node", nodeTitle);
        }
      }
    }
    navigate({ search: params.toString() }, { replace: true });
  }, [navigate, tree]);

  // Restore state from URL on load and keep it in sync when URL changes externally
  useLayoutEffect(() => {
    if (tree.length === 0) return;
    const params = new URLSearchParams(location.search);
    const topicTitle = params.get("topic");
    const nodeTitle = params.get("node");

    if (!topicTitle && !nodeTitle) {
      queueMicrotask(() => {
        setOpenTopicId(null);
        setActiveNodeId(null);
      });
      return;
    }

    const decodedTopic = topicTitle ? decodeURIComponent(topicTitle) : null;
    const decodedNode = nodeTitle ? decodeURIComponent(nodeTitle) : null;

    for (const topic of tree) {
      if (decodedTopic && topic.title !== decodedTopic) continue;

      if (decodedNode) {
        const findNode = (nodes: TreeNode[]): TreeNode | null => {
          for (const n of nodes) {
            if (n.title === decodedNode) return n;
            const found = findNode(n.children);
            if (found) return found;
          }
          return null;
        };
        const node = findNode(topic.children);
        if (node) {
          queueMicrotask(() => {
            setOpenTopicId(topic.id);
            setActiveNodeId(node.id);
          });
          return;
        }
      } else if (decodedTopic && topic.title === decodedTopic) {
        queueMicrotask(() => {
          setOpenTopicId(topic.id);
          setActiveNodeId(null);
        });
        return;
      }
    }

    // Unknown params: reset
    queueMicrotask(() => {
      setOpenTopicId(null);
      setActiveNodeId(null);
    });
  }, [location.search, tree]);

  const handleToggleTopic = (id: number) => {
    setOpenTopicId((prev) => {
      const next = prev === id ? null : id;
      setActiveNodeId(null);
      syncUrlWithState(next, null);
      return next;
    });
  };

  const handleSelectNode = (id: number) => {
    setActiveNodeId((prev) => {
      const next = prev === id ? null : id;
      syncUrlWithState(openTopicId, next);
      return next;
    });
  };

  return (
    <div className="pt-16">
      <section className="section-dark pt-8 pb-16 lg:pt-12 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#2eff8c] rounded-full" />
              Темы курса
            </h2>
            <p className="text-[#c8cdd1] max-w-2xl">
              Выберите тему, чтобы открыть теорию, задачи и лабораторные работы
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#2eff8c]" size={32} />
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center text-[#a0a8ad] py-12">
              Пока нет тем. Добавьте их в панели администратора.
            </div>
          ) : (
            openTopicId === null ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tree.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleToggleTopic(topic.id)}
                    className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl text-left flex flex-col"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-semibold shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${topic.color || "#2eff8c"}1a`,
                          color: topic.color || "#2eff8c",
                        }}
                      >
                        {String(topic.order).padStart(2, "0")}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#2eff8c] transition-colors leading-snug flex-1">
                        {topic.title}
                      </h3>
                      <ChevronRight size={18} className="text-[#798389] group-hover:text-[#2eff8c] transition-colors shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => handleToggleTopic(openTopicId)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#798389] hover:text-[#2eff8c] transition-colors"
                >
                  <ArrowLeft size={12} /> Назад к темам
                </button>
                {(() => {
                  const topic = tree.find((t) => t.id === openTopicId);
                  if (!topic) return null;
                  return (
                    <TopicAccordion
                      topic={topic}
                      isOpen={true}
                      onToggle={() => handleToggleTopic(openTopicId)}
                      activeNodeId={activeNodeId}
                      onSelectNode={handleSelectNode}
                      onBack={() => {
                        setActiveNodeId(null);
                        syncUrlWithState(openTopicId, null);
                      }}
                      jupyterUrlMap={jupyterUrlMap}
                      showJupyter={isAuthenticated}
                    />
                  );
                })()}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
