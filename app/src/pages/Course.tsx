import { useState, useMemo, useLayoutEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import SnakeTimeline from "@/components/SnakeTimeline";
import TopicOrbitView from "@/components/TopicOrbitView";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
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
    subtopics?.forEach(s => map.set(s.title, s.jupyterUrl));
    return map;
  }, [subtopics]);

  const syncUrlWithState = useCallback(
    (topicId: number | null, nodeId: number | null) => {
      const params = new URLSearchParams();
      if (topicId !== null && tree.length > 0) {
        const topic = tree.find(t => t.id === topicId);
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
    },
    [navigate, tree]
  );

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

  const handleToggleTopic = useCallback(
    (id: number) => {
      setOpenTopicId(prev => {
        const next = prev === id ? null : id;
        setActiveNodeId(null);
        syncUrlWithState(next, null);
        return next;
      });
    },
    [syncUrlWithState]
  );

  const handleSelectNode = useCallback(
    (id: number | null) => {
      setActiveNodeId(id);
      syncUrlWithState(openTopicId, id);
    },
    [syncUrlWithState, openTopicId]
  );

  const handleCloseTopic = useCallback(() => {
    setOpenTopicId(null);
    setActiveNodeId(null);
    syncUrlWithState(null, null);
  }, [syncUrlWithState]);

  const topicItems = useMemo(() => {
    return tree.map(topic => ({
      id: topic.id,
      title: topic.title,
      order: topic.order,
      color: topic.color || "#2eff8c",
      icon: (
        <CategoryIcon
          iconKey={topic.iconType}
          size={22}
          color={topic.color || "#2eff8c"}
        />
      ),
      description: topic.content
        ? topic.content.replace(/[#*_`[\]]/g, "").slice(0, 220) +
          (topic.content.length > 220 ? "..." : "")
        : "Выберите тему, чтобы открыть теорию, задачи и лабораторные работы",
      details:
        topic.children.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs text-[#798389] uppercase tracking-wider mb-2">
              Подтемы
            </p>
            {topic.children.slice(0, 3).map(child => (
              <div
                key={child.id}
                className="flex items-center gap-2 text-xs text-[#c8cdd1]"
              >
                <span className="w-1 h-1 rounded-full bg-[#2eff8c]" />
                {child.title}
              </div>
            ))}
            {topic.children.length > 3 && (
              <p className="text-xs text-[#798389] mt-1">
                +{topic.children.length - 3} подтем
              </p>
            )}
          </div>
        ) : undefined,
      onClick: () => handleToggleTopic(topic.id),
    }));
  }, [tree, handleToggleTopic]);

  const activeTopic = useMemo(
    () => tree.find(t => t.id === openTopicId),
    [tree, openTopicId]
  );

  return (
    <div className="pt-16 min-h-screen bg-[#262e33]">
      <section className="section-dark pt-10 pb-16 lg:pt-14 lg:pb-24 rocket-cursor">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 lg:mb-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Курс по{" "}
              <span className="relative inline-block">
                <span
                  className="relative z-10"
                  style={{
                    background:
                      "linear-gradient(90deg, #2eff8c, #5fffa8, #2eff8c)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  физике
                </span>
                <span
                  className="absolute -inset-1 rounded-lg blur-xl opacity-30"
                  style={{ backgroundColor: "#2eff8c" }}
                />
              </span>
            </h2>
            <p className="text-[#a0a8ad] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Пройдите путь от кинематики до квантовой физики.
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
            <SnakeTimeline items={topicItems} columns={4} baseSize="lg" />
          )}
        </div>
      </section>

      {activeTopic && (
        <TopicOrbitView
          topic={activeTopic}
          activeNodeId={activeNodeId}
          onSelectNode={handleSelectNode}
          onClose={handleCloseTopic}
          jupyterUrlMap={jupyterUrlMap}
          showJupyter={isAuthenticated}
        />
      )}
    </div>
  );
}
