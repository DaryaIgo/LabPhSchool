import { useEffect, useRef, useCallback } from "react";
import { ClipboardCheck } from "lucide-react";

interface CircuitState {
  voltage: number;
  resistance: number;
  switchOn: boolean;
}

/* ================================================================
   TEXTBOOK-STYLE CIRCUIT SIMULATION (GOST/ISO symbols)
   ================================================================ */

interface Props {
  state: CircuitState;
  onAddMeasurement: () => void;
}

/* ---- Standard electric symbols (textbook style) ---- */
function drawBattery(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  voltage: number
) {
  // Battery: long line (+) and short line (-)
  ctx.strokeStyle = "#c8cdd1";
  ctx.lineWidth = 2.5;
  // Long bar (+)
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 10);
  ctx.lineTo(x - 14, y + 10);
  ctx.stroke();
  // Short bar (-)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 5);
  ctx.lineTo(x + 6, y + 5);
  ctx.stroke();
  // Connection lines
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 25, y);
  ctx.lineTo(x - 14, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 6, y);
  ctx.lineTo(x + 17, y);
  ctx.stroke();
  // Labels
  ctx.fillStyle = "#2eff8c";
  ctx.font = "bold 9px 'Geist Mono', monospace";
  ctx.fillText("+", x - 20, y - 14);
  ctx.fillStyle = "#ff6b6b";
  ctx.fillText("-", x + 2, y - 14);
  // Value label below
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px 'Geist Mono', monospace";
  ctx.fillText(`${voltage}V`, x - 10, y + 24);
}

function drawResistor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  horizontal: boolean,
  resistance: number
) {
  ctx.strokeStyle = "#ffcb3d";
  ctx.lineWidth = 2;
  if (horizontal) {
    // Zigzag
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(x - 16 + i * 7, y + (i % 2 === 0 ? -7 : 7));
    }
    ctx.lineTo(x + 22, y);
    ctx.stroke();
    // Connection lines
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x - 20, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 22, y);
    ctx.lineTo(x + 32, y);
    ctx.stroke();
    // Label
    ctx.fillStyle = "#ffcb3d";
    ctx.font = "bold 9px 'Geist Mono', monospace";
    ctx.fillText(`R = ${resistance}Ω`, x - 18, y + 20);
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(x + (i % 2 === 0 ? -7 : 7), y - 16 + i * 7);
    }
    ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x, y - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 22);
    ctx.lineTo(x, y + 32);
    ctx.stroke();
    ctx.fillStyle = "#ffcb3d";
    ctx.font = "bold 9px 'Geist Mono', monospace";
    ctx.fillText(`R = ${resistance}Ω`, x + 10, y + 4);
  }
}

function drawLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brightness: number
) {
  // Circle with cross inside (standard lamp symbol)
  const r = 16;

  // Glow effect
  if (brightness > 0) {
    const glow = ctx.createRadialGradient(
      x,
      y,
      r * 0.5,
      x,
      y,
      r + brightness * 25
    );
    const gb = Math.floor(200 - brightness * 80);
    glow.addColorStop(0, `rgba(255,255,${gb},${0.3 + brightness * 0.5})`);
    glow.addColorStop(1, "rgba(255,255,200,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r + brightness * 25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Circle
  ctx.strokeStyle = brightness > 0.3 ? "#ffffa0" : "#c8cdd1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Cross inside
  ctx.strokeStyle =
    brightness > 0
      ? `rgba(255,255,${200 - Math.floor(brightness * 50)},${0.6 + brightness * 0.4})`
      : "#798389";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 8);
  ctx.lineTo(x + 8, y + 8);
  ctx.moveTo(x + 8, y - 8);
  ctx.lineTo(x - 8, y + 8);
  ctx.stroke();

  // Connection lines
  ctx.strokeStyle = "#c8cdd1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x, y - r - 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.lineTo(x, y + r + 12);
  ctx.stroke();

  // Label
  ctx.fillStyle = "#c8cdd1";
  ctx.font = "9px 'Geist Mono', monospace";
  ctx.fillText("L", x + r + 4, y + 4);
}

function drawAmmeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  current: number
) {
  const r = 18;
  // Circle
  ctx.fillStyle = "#1a1f22";
  ctx.strokeStyle = "#2eff8c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // "A" letter
  ctx.fillStyle = "#2eff8c";
  ctx.font = "bold 14px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", x, y);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  // Value below
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${current.toFixed(2)}A`, x, y + r + 16);
  ctx.textAlign = "start";
}

function drawVoltmeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  voltage: number
) {
  const r = 18;
  // Circle
  ctx.fillStyle = "#1a1f22";
  ctx.strokeStyle = "#01acff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // "V" letter
  ctx.fillStyle = "#01acff";
  ctx.font = "bold 14px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("V", x, y);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  // Value below
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${voltage.toFixed(1)}V`, x, y + r + 16);
  ctx.textAlign = "start";
}

function drawSwitch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isOn: boolean
) {
  // Two circles for contacts
  ctx.fillStyle = "#434e54";
  [x - 14, x + 14].forEach(cx => {
    ctx.beginPath();
    ctx.arc(cx, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  // Switch arm
  ctx.strokeStyle = isOn ? "#2eff8c" : "#ff6b6b";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x + 14, isOn ? y : y - 18);
  ctx.stroke();
  ctx.lineCap = "butt";
  // Connection lines
  ctx.strokeStyle = "#c8cdd1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 28, y);
  ctx.lineTo(x - 14, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 14, y);
  ctx.lineTo(x + 28, y);
  ctx.stroke();
  // Label
  ctx.fillStyle = isOn ? "#2eff8c" : "#ff6b6b";
  ctx.font = "bold 9px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(isOn ? "S (ON)" : "S (OFF)", x, y + 18);
  ctx.textAlign = "start";
}

function drawConnectingDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.fillStyle = "#c8cdd1";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

/* ================================================================ */
export default function OhmsLawCircuit({ state, onAddMeasurement }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const electronPos = useRef(0);

  const current = state.switchOn ? state.voltage / state.resistance : 0;
  const brightness = Math.min(current / 3, 1);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // White paper background (textbook style)
    ctx.fillStyle = "#f0ede8";
    ctx.fillRect(0, 0, W, H);

    // Subtle grid (drafting paper look)
    ctx.strokeStyle = "rgba(180,170,160,0.15)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // ---- CIRCUIT LAYOUT (textbook style rectangle) ----
    // Layout:
    //          R (resistor)
    //    ┌────//\/\────┐
    //  + │               │ L (lamp)
    //  Б │     A         │
    //  - │               │
    //    └──────S────────┘
    //         V (parallel to battery)

    const marginX = 70;
    const marginY = 70;
    const circuitW = W - marginX * 2;
    const circuitH = H - marginY * 2 - 40;
    const leftX = marginX;
    const rightX = marginX + circuitW;
    const topY = marginY;
    const bottomY = marginY + circuitH;
    const midY = marginY + circuitH / 2;

    // Draw wire frame (thin lines like in textbooks)
    ctx.strokeStyle = "#2a2520";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";

    // Top wire: left -> resistor -> right
    ctx.beginPath();
    ctx.moveTo(leftX + 25, midY); // from battery
    ctx.lineTo(leftX + 25, topY + 30); // up
    ctx.lineTo(leftX + 80, topY + 30); // to resistor left
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftX + 80 + 44, topY + 30); // from resistor right
    ctx.lineTo(rightX - 40, topY + 30); // to right
    ctx.lineTo(rightX - 40, midY - 28); // down to lamp
    ctx.stroke();

    // Bottom wire: right -> switch -> left
    ctx.beginPath();
    ctx.moveTo(rightX - 40, midY + 28); // from lamp bottom
    ctx.lineTo(rightX - 40, bottomY - 30); // down
    ctx.lineTo(leftX + 80 + 44, bottomY - 30); // to switch right
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftX + 80, bottomY - 30); // from switch left
    ctx.lineTo(leftX + 25, bottomY - 30); // to left
    ctx.lineTo(leftX + 25, midY); // up to battery
    ctx.stroke();

    // Connecting dots at corners
    drawConnectingDot(ctx, leftX + 25, topY + 30);
    drawConnectingDot(ctx, rightX - 40, topY + 30);
    drawConnectingDot(ctx, rightX - 40, bottomY - 30);
    drawConnectingDot(ctx, leftX + 25, bottomY - 30);

    // ---- COMPONENTS ----

    // Battery (left side)
    drawBattery(ctx, leftX + 25, midY, state.voltage);

    // Resistor (top)
    drawResistor(ctx, leftX + 80 + 22, topY + 30, true, state.resistance);

    // Lamp (right side)
    drawLamp(ctx, rightX - 40, midY, brightness);

    // Switch (bottom)
    drawSwitch(ctx, leftX + 80 + 22, bottomY - 30, state.switchOn);

    // Ammeter (inside the loop, left of center)
    drawAmmeter(ctx, leftX + 60 + (circuitW - 100) / 4, midY, current);

    // Voltmeter wires (parallel to battery)
    ctx.strokeStyle = "#01acff";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(leftX + 25, midY - 14); // from battery top
    ctx.lineTo(leftX - 35, midY - 14); // left
    ctx.lineTo(leftX - 35, midY); // to voltmeter
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#01acff";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(leftX + 25, midY + 14); // from battery bottom
    ctx.lineTo(leftX - 35, midY + 14); // left
    ctx.lineTo(leftX - 35, midY); // to voltmeter
    ctx.stroke();
    ctx.setLineDash([]);

    drawVoltmeter(ctx, leftX - 35, midY, state.voltage);

    // ---- ANIMATED CURRENT ARROWS ----
    if (state.switchOn && current > 0) {
      electronPos.current = (electronPos.current + current * 0.3) % 100;

      // Define path segments with direction
      const pathSegments = [
        { x1: leftX + 25, y1: midY, x2: leftX + 25, y2: topY + 30 },
        { x1: leftX + 25, y1: topY + 30, x2: leftX + 80, y2: topY + 30 },
        { x1: leftX + 80 + 44, y1: topY + 30, x2: rightX - 40, y2: topY + 30 },
        { x1: rightX - 40, y1: topY + 30, x2: rightX - 40, y2: midY - 28 },
        { x1: rightX - 40, y1: midY + 28, x2: rightX - 40, y2: bottomY - 30 },
        {
          x1: rightX - 40,
          y1: bottomY - 30,
          x2: leftX + 80 + 44,
          y2: bottomY - 30,
        },
        { x1: leftX + 80, y1: bottomY - 30, x2: leftX + 25, y2: bottomY - 30 },
        { x1: leftX + 25, y1: bottomY - 30, x2: leftX + 25, y2: midY },
      ];

      const totalSegments = pathSegments.length;

      for (let e = 0; e < 6; e++) {
        const offset = (e / 6) * totalSegments;
        const totalPos =
          ((electronPos.current / 100) * totalSegments + offset) %
          totalSegments;
        const segIdx = Math.floor(totalPos);
        const frac = totalPos - segIdx;

        if (segIdx < totalSegments) {
          const seg = pathSegments[segIdx];
          const ex = seg.x1 + (seg.x2 - seg.x1) * frac;
          const ey = seg.y1 + (seg.y2 - seg.y1) * frac;

          // Draw arrow (textbook style: small solid arrow)
          const angle = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(angle);
          ctx.fillStyle = `rgba(46,130,90,${0.5 + Math.sin(Date.now() / 300 + e) * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(4, 0);
          ctx.lineTo(-3, -3);
          ctx.lineTo(-3, 3);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // Current direction label
      ctx.fillStyle = "rgba(46,130,90,0.6)";
      ctx.font = "italic 10px 'Geist Sans', sans-serif";
      ctx.fillText("I", leftX + circuitW / 2 - 20, topY + 18);
    }

    // ---- TITLE BOX (textbook style) ----
    ctx.fillStyle = "#2a2520";
    ctx.font = "bold 13px 'Geist Sans', sans-serif";
    ctx.fillText(
      "Рис. 1.  Электрическая цепь для проверки закона Ома",
      marginX,
      28
    );

    // Legend box
    const legendX = rightX - 140;
    const legendY = 15;
    ctx.fillStyle = "rgba(240,237,232,0.95)";
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 1;
    ctx.fillRect(legendX, legendY, 130, 70);
    ctx.strokeRect(legendX, legendY, 130, 70);

    ctx.fillStyle = "#2a2520";
    ctx.font = "bold 9px 'Geist Sans', sans-serif";
    ctx.fillText("Условные обозначения:", legendX + 6, legendY + 14);

    const legendItems = [
      { label: "Б — батарея", color: "#c8cdd1" },
      { label: "R — резистор", color: "#ffcb3d" },
      { label: "L — лампа", color: "#c8cdd1" },
      { label: "S — выключатель", color: "#2a2520" },
    ];
    legendItems.forEach((item, i) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX + 6, legendY + 22 + i * 12, 10, 2);
      ctx.fillStyle = "#2a2520";
      ctx.font = "8px 'Geist Sans', sans-serif";
      ctx.fillText(item.label, legendX + 20, legendY + 26 + i * 12);
    });

    // Measurement panel (bottom right)
    const panelX = W - 175;
    const panelY = H - 95;
    ctx.fillStyle = "rgba(240,237,232,0.95)";
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 1;
    roundRect(ctx, panelX, panelY, 160, 78, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2a2520";
    ctx.font = "bold 9px 'Geist Mono', monospace";
    ctx.fillText("ИЗМЕРЕНИЯ:", panelX + 8, panelY + 16);

    const readings = [
      {
        label: "U =",
        value: `${state.voltage.toFixed(1)} В`,
        color: "#01acff",
      },
      {
        label: "I =",
        value: state.switchOn ? `${current.toFixed(3)} А` : "0 А",
        color: state.switchOn ? "#2a7a4a" : "#999",
      },
      { label: "R =", value: `${state.resistance} Ом`, color: "#c89220" },
      {
        label: "P =",
        value: `${(current * state.voltage).toFixed(2)} Вт`,
        color: "#2a2520",
      },
    ];
    readings.forEach((r, i) => {
      const rowY = panelY + 30 + i * 13;
      ctx.fillStyle = "#2a2520";
      ctx.font = "9px 'Geist Mono', monospace";
      ctx.fillText(r.label, panelX + 8, rowY);
      ctx.fillStyle = r.color;
      ctx.font = "bold 9px 'Geist Mono', monospace";
      ctx.fillText(r.value, panelX + 28, rowY);
    });

    // Add measurement button hint
    if (state.switchOn && current > 0) {
      ctx.fillStyle = "rgba(46,130,90,0.8)";
      ctx.font = "italic 9px 'Geist Sans', sans-serif";
      ctx.fillText("Нажмите «Записать в таблицу»", panelX + 8, panelY - 6);
    }

    // --- Active wire glow ---
    if (state.switchOn && current > 0) {
      ctx.strokeStyle = `rgba(46,130,90,${0.08 + brightness * 0.1})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(leftX + 25, midY);
      ctx.lineTo(leftX + 25, topY + 30);
      ctx.lineTo(leftX + 80, topY + 30);
      ctx.moveTo(leftX + 80 + 44, topY + 30);
      ctx.lineTo(rightX - 40, topY + 30);
      ctx.lineTo(rightX - 40, midY - 28);
      ctx.moveTo(rightX - 40, midY + 28);
      ctx.lineTo(rightX - 40, bottomY - 30);
      ctx.lineTo(leftX + 80 + 44, bottomY - 30);
      ctx.moveTo(leftX + 80, bottomY - 30);
      ctx.lineTo(leftX + 25, bottomY - 30);
      ctx.lineTo(leftX + 25, midY);
      ctx.stroke();
    }

    // eslint-disable-next-line react-hooks/immutability
    animRef.current = requestAnimationFrame(draw);
  }, [state, brightness, current]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 720;
    canvas.height = 460;

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border-2 border-[#d4cfc7] shadow-lg"
        style={{
          maxWidth: 720,
          height: "auto",
          aspectRatio: "720/460",
          background: "#f0ede8",
        }}
      />
      {state.switchOn && current > 0 && (
        <button
          onClick={onAddMeasurement}
          className="absolute bottom-3 right-3 btn-lime text-xs flex items-center gap-1 shadow-lg"
        >
          <ClipboardCheck size={14} />
          Записать
        </button>
      )}
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
