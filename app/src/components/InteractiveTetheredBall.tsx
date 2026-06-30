import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type RefObject,
} from "react";
import Matter from "matter-js";

interface InteractiveTetheredBallProps {
  /** Цвет акцента раздела — используется для обводки, свечения и линии крепления. */
  accent: string;
  /** Содержимое шара (обычно иконка). */
  children: ReactNode;
  /** Классы внешнего контейнера. */
  className?: string;
  /** Классы самого шара. Должны задавать width/height (круг) одинаковые значения. */
  ballClassName?: string;
  /** Inline-стили шара. */
  ballStyle?: CSSProperties;
  /**
   * Элемент, к которому прикреплён шар. Если передан, точка крепления вычисляется
   * относительно центра этого элемента. Иначе — центр верхней части контейнера.
   */
  anchorRef?: RefObject<HTMLElement | null>;
}

/**
 * Интерактивный шар, прикреплённый к своей точке крепления невидимой пружиной.
 * Пользователь может захватить шар мышью/тачем и оттянуть.
 * При превышении порогового расстояния пружина обрывается,
 * и шар падает вниз под действием гравитации Matter.js.
 */
export default function InteractiveTetheredBall({
  accent,
  children,
  className = "",
  ballClassName = "w-28 h-28 md:w-36 md:h-36",
  ballStyle,
  anchorRef: externalAnchorRef,
}: InteractiveTetheredBallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const glowLineRef = useRef<SVGLineElement>(null);
  const coreLineRef = useRef<SVGLineElement>(null);
  const gradientId = useId();
  const [introDone, setIntroDone] = useState(false);
  const brokenRef = useRef(false);

  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const ballBodyRef = useRef<Matter.Body | null>(null);
  const tetherRef = useRef<Matter.Constraint | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const floorRef = useRef<Matter.Body | null>(null);
  const anchorRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const ballEl = ballRef.current;
    if (!container || !ballEl) return;

    const { Engine, Runner, Bodies, Composite, Constraint, Body, Events } =
      Matter;

    const engine = Engine.create();
    engine.gravity.y = 1;
    engineRef.current = engine;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const ballSize = ballEl.offsetWidth;
    const radius = ballSize / 2;

    const computeAnchor = () => {
      const anchorEl = externalAnchorRef?.current;
      const containerRect = container.getBoundingClientRect();

      if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      }

      return { x: width / 2, y: radius + 16 };
    };

    const anchor = computeAnchor();
    anchorRef.current = anchor;

    const ball = Bodies.circle(anchor.x, anchor.y, radius, {
      restitution: 0.55,
      friction: 0.04,
      frictionAir: 0.015,
      density: 0.004,
      render: { visible: false },
    });
    ballBodyRef.current = ball;

    const tether = Constraint.create({
      pointA: anchor,
      bodyB: ball,
      stiffness: 0.035,
      damping: 0.07,
      length: 0,
      render: { visible: false },
    });
    tetherRef.current = tether;

    // Пол — близко к низу контейнера, но с отступом, чтобы шар не увеличивал scrollHeight.
    const floorY = height - Math.max(80, radius * 0.8);
    const floor = Bodies.rectangle(width / 2, floorY, width * 3, 120, {
      isStatic: true,
      render: { visible: false },
    });
    floorRef.current = floor;
    const leftWall = Bodies.rectangle(-60, height / 2, 100, height * 4, {
      isStatic: true,
      render: { visible: false },
    });
    const rightWall = Bodies.rectangle(
      width + 60,
      height / 2,
      100,
      height * 4,
      {
        isStatic: true,
        render: { visible: false },
      }
    );

    Composite.add(engine.world, [ball, tether, floor, leftWall, rightWall]);

    const breakDistance = radius * 3.5;
    let isBroken = false;

    const breakTether = () => {
      if (isBroken || !tetherRef.current) return;
      Composite.remove(engine.world, tetherRef.current);
      tetherRef.current = null;
      isBroken = true;
      brokenRef.current = true;
      if (glowLineRef.current) glowLineRef.current.setAttribute("opacity", "0");
      if (coreLineRef.current) coreLineRef.current.setAttribute("opacity", "0");
    };

    const updateLines = () => {
      const body = ballBodyRef.current;
      if (!body || isBroken) return;

      const dx = body.position.x - anchorRef.current.x;
      const dy = body.position.y - anchorRef.current.y;
      const dist = Math.hypot(dx, dy);

      [glowLineRef.current, coreLineRef.current].forEach(line => {
        if (!line) return;
        line.setAttribute("x1", String(anchorRef.current.x));
        line.setAttribute("y1", String(anchorRef.current.y));
        line.setAttribute("x2", String(body.position.x));
        line.setAttribute("y2", String(body.position.y));
      });

      // Линия проявляется при натяжении и немного тускнеет при очень сильном.
      const intensity = Math.min(Math.max(dist / (radius * 0.9), 0.25), 1);
      if (glowLineRef.current)
        glowLineRef.current.setAttribute("opacity", String(intensity * 0.35));
      if (coreLineRef.current)
        coreLineRef.current.setAttribute("opacity", String(intensity));
    };

    const updateBall = () => {
      const body = ballBodyRef.current;
      if (!body) return;

      const x = body.position.x - radius;
      const y = body.position.y - radius;
      ballEl.style.transform = `translate(${x}px, ${y}px)`;
    };

    const checkBreak = () => {
      if (
        isBroken ||
        brokenRef.current ||
        !isDraggingRef.current ||
        !ballBodyRef.current
      )
        return;

      const dx = ballBodyRef.current.position.x - anchorRef.current.x;
      const dy = ballBodyRef.current.position.y - anchorRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > breakDistance) {
        breakTether();
      }
    };

    const beforeUpdate = () => {
      checkBreak();
      updateBall();
      updateLines();
    };

    Events.on(engine, "beforeUpdate", beforeUpdate);

    const runner = Runner.create();
    Runner.run(runner, engine);

    // --- Ручной drag через Pointer Events ---
    const getLocalPos = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handlePointerDown = (e: globalThis.PointerEvent) => {
      if (!ballBodyRef.current) return;

      const local = getLocalPos(e.clientX, e.clientY);
      const dx = local.x - ballBodyRef.current.position.x;
      const dy = local.y - ballBodyRef.current.position.y;

      // Захват только если клик попал внутрь шара.
      if (Math.hypot(dx, dy) > radius + 8) return;

      e.preventDefault();
      isDraggingRef.current = true;
      dragOffsetRef.current = { x: dx, y: dy };
      ballEl.style.cursor = "grabbing";
      ballEl.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: globalThis.PointerEvent) => {
      if (!isDraggingRef.current || !ballBodyRef.current) return;
      e.preventDefault();

      const local = getLocalPos(e.clientX, e.clientY);
      Body.setPosition(ballBodyRef.current, {
        x: local.x - dragOffsetRef.current.x,
        y: local.y - dragOffsetRef.current.y,
      });
      Body.setVelocity(ballBodyRef.current, { x: 0, y: 0 });
      Body.setAngularVelocity(ballBodyRef.current, 0);
    };

    const handlePointerUp = (e: globalThis.PointerEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      isDraggingRef.current = false;
      ballEl.style.cursor = "grab";
      ballEl.releasePointerCapture(e.pointerId);
    };

    ballEl.addEventListener("pointerdown", handlePointerDown);
    ballEl.addEventListener("pointermove", handlePointerMove);
    ballEl.addEventListener("pointerup", handlePointerUp);
    ballEl.addEventListener("pointercancel", handlePointerUp);
    ballEl.addEventListener("pointerleave", handlePointerUp);

    // --- Resize handling ---
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      if (floorRef.current) {
        Body.setPosition(floorRef.current, {
          x: newWidth / 2,
          y: newHeight - Math.max(80, radius * 0.8),
        });
      }

      if (!isBroken) {
        const newAnchor = computeAnchor();
        anchorRef.current = newAnchor;
        if (tetherRef.current) {
          tetherRef.current.pointA = newAnchor;
          Body.setPosition(ball, newAnchor);
          Body.setVelocity(ball, { x: 0, y: 0 });
        }
      }
    };

    window.addEventListener("resize", handleResize);

    // Плавное появление шара после монтирования физики.
    requestAnimationFrame(() => setIntroDone(true));

    return () => {
      window.removeEventListener("resize", handleResize);
      Events.off(engine, "beforeUpdate", beforeUpdate);
      Runner.stop(runner);
      Engine.clear(engine);
      ballEl.removeEventListener("pointerdown", handlePointerDown);
      ballEl.removeEventListener("pointermove", handlePointerMove);
      ballEl.removeEventListener("pointerup", handlePointerUp);
      ballEl.removeEventListener("pointercancel", handlePointerUp);
      ballEl.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [externalAnchorRef, gradientId]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${className}`}
      style={{ touchAction: "none" }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Свечение линии */}
        <line
          ref={glowLineRef}
          x1="0"
          y1="0"
          x2="0"
          y2="0"
          stroke={accent}
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0"
          style={{ filter: `drop-shadow(0 0 8px ${accent})` }}
        />

        {/* Основная линия крепления */}
        <line
          ref={coreLineRef}
          x1="0"
          y1="0"
          x2="0"
          y2="0"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0"
        />
      </svg>

      <div
        ref={ballRef}
        className={`absolute top-0 left-0 rounded-full border-2 flex items-center justify-center z-10 ${ballClassName}`}
        style={{
          borderColor: `${accent}55`,
          backgroundColor: `${accent}14`,
          boxShadow: `0 0 60px ${accent}20, inset 0 0 40px ${accent}10`,
          cursor: "grab",
          pointerEvents: "auto",
          touchAction: "none",
          ...ballStyle,
        }}
      >
        {/* Внешнее свечение */}
        <div
          className="absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ backgroundColor: accent }}
        />

        {/* Блик поверхности */}
        <div
          className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25) 0%, transparent 45%)",
          }}
        />

        <div
          className="relative z-10 flex items-center justify-center w-full h-full transition-all duration-500 ease-out"
          style={{
            opacity: introDone ? 1 : 0,
            transform: introDone ? "scale(1)" : "scale(0.75)",
            color: accent,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
