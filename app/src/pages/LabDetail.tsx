import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";

/* ============ FREE FALL SIMULATION ============ */
function FreeFallSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [height, setHeight] = useState(5);
  const [mass, setMass] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    time: number;
    g: number;
  } | null>(null);
  const animRef = useRef(0);
  const startTimeRef = useRef(0);

  const G = 9.81;
  const PIXELS_PER_METER = 40;

  const drawScene = useCallback(
    (ballY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, W, H);

      // Scale/ruler on left
      ctx.strokeStyle = "#434e54";
      ctx.lineWidth = 1;
      const groundY = H - 60;
      const maxH = 10;
      const drawHeight = Math.min(height, maxH);
      const pixelsH = drawHeight * PIXELS_PER_METER;

      // Ruler ticks
      for (let m = 0; m <= maxH; m++) {
        const y = groundY - m * PIXELS_PER_METER;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(40, y);
        ctx.stroke();
        ctx.fillStyle = "#798389";
        ctx.font = "10px monospace";
        ctx.fillText(`${m}м`, 2, y + 3);
      }

      // Ground
      ctx.fillStyle = "#434e54";
      ctx.fillRect(0, groundY, W, 2);

      // Surface type indicator
      ctx.fillStyle = "#2a3237";
      ctx.fillRect(50, groundY + 5, W - 60, 30);
      ctx.fillStyle = "#798389";
      ctx.font = "12px Geist Sans";
      ctx.fillText("Поверхность: бетон", 60, groundY + 24);

      // Ball
      const ballRadius = 8 + mass * 2;
      const ballX = W / 2;
      const ballDrawY = ballY;

      // Ball trail
      ctx.strokeStyle = "rgba(46,255,140,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ballX, groundY - pixelsH);
      ctx.lineTo(ballX, ballDrawY);
      ctx.stroke();

      // Ball shadow
      const shadowY = groundY;
      const distToGround = shadowY - ballDrawY;
      const shadowOpacity = Math.max(0, 0.3 - distToGround / 1000);
      ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;
      ctx.beginPath();
      ctx.ellipse(ballX, shadowY, ballRadius * (1 + distToGround / 200), 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball body
      const grad = ctx.createRadialGradient(
        ballX - ballRadius / 3,
        ballDrawY - ballRadius / 3,
        1,
        ballX,
        ballDrawY,
        ballRadius
      );
      grad.addColorStop(0, "#5effa8");
      grad.addColorStop(1, "#2eff8c");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ballX, ballDrawY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Height indicator
      ctx.strokeStyle = "#2eff8c";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ballX + ballRadius + 10, ballDrawY);
      ctx.lineTo(ballX + ballRadius + 10, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "11px monospace";
      const currentH = Math.max(0, (groundY - ballDrawY) / PIXELS_PER_METER);
      ctx.fillText(`${currentH.toFixed(2)}м`, ballX + ballRadius + 15, (ballDrawY + groundY) / 2);
    },
    [height, mass]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;

    const groundY = canvas.height - 60;
    const drawHeight = Math.min(height, 10);
    const startY = groundY - drawHeight * PIXELS_PER_METER;
    drawScene(startY);

    return () => cancelAnimationFrame(animRef.current);
  }, [height, mass, drawScene]);

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const groundY = canvas.height - 60;
    const drawHeight = Math.min(height, 10);
    const startY = groundY - drawHeight * PIXELS_PER_METER;
    const totalTime = Math.sqrt((2 * height) / G);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const t = Math.min(elapsed, totalTime);

      const fallen = 0.5 * G * t * t;
      const currentY = startY + fallen * PIXELS_PER_METER;

      drawScene(Math.min(currentY, groundY - 8 - mass * 2));

      // Timer display
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`t = ${t.toFixed(3)}с`, canvas.width - 120, 30);

      if (t < totalTime) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
        const calculatedG = (2 * height) / (totalTime * totalTime);
        setResult({ time: totalTime, g: calculatedG });
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setIsRunning(false);
    setResult(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const groundY = canvas.height - 60;
    const drawHeight = Math.min(height, 10);
    drawScene(groundY - drawHeight * PIXELS_PER_METER);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-[#434e54]"
          style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
        />
      </div>
      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-4">Параметры</h4>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Высота падения: {height} м
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={height}
                onChange={(e) => {
                  setHeight(parseFloat(e.target.value));
                  reset();
                }}
                disabled={isRunning}
                className="w-full accent-[#2eff8c]"
              />
            </div>

            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Масса шара: {mass} кг
              </label>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.1}
                value={mass}
                onChange={(e) => {
                  setMass(parseFloat(e.target.value));
                  reset();
                }}
                disabled={isRunning}
                className="w-full accent-[#2eff8c]"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={startSimulation}
              disabled={isRunning}
              className="flex-1 btn-lime flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play size={16} />
              {isRunning ? "Падение..." : "Запустить"}
            </button>
            <button onClick={reset} className="btn-outline px-4">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">Результаты</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#798389]">Время падения:</span>
                <span className="font-mono-phys">{result.time.toFixed(3)} с</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Высота:</span>
                <span className="font-mono-phys">{height} м</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Расчётное g:</span>
                <span className="font-mono-phys text-[#2eff8c]">
                  {result.g.toFixed(2)} м/с²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Погрешность:</span>
                <span className="font-mono-phys">
                  {Math.abs((result.g - G) / G * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Теория</h4>
          <p className="text-sm text-[#c8cdd1] leading-relaxed">
            Ускорение свободного падения g определяется по формуле:
          </p>
          <p className="formula-text text-center my-3">H = gt²/2</p>
          <p className="text-sm text-[#c8cdd1] leading-relaxed">
            Отсюда g = 2H/t². Измерив время падения t с высоты H, находим
            экспериментальное значение g.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ PENDULUM SIMULATION ============ */
function PendulumSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ period: number } | null>(null);
  const animRef = useRef(0);

  const G = 9.81;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = Math.PI / 6;
    let time = 0;
    const T = 2 * Math.PI * Math.sqrt(length / G);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1f22";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const originX = canvas.width / 2;
      const originY = 40;
      const pxPerM = 80;
      const lenPx = Math.min(length * pxPerM, 300);

      // Current angle
      const currentAngle = isRunning
        ? (Math.PI / 6) * Math.cos(time * Math.sqrt(G / length))
        : angle;

      const bobX = originX + lenPx * Math.sin(currentAngle);
      const bobY = originY + lenPx * Math.cos(currentAngle);

      // String
      ctx.strokeStyle = "#c8cdd1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Pivot
      ctx.fillStyle = "#798389";
      ctx.beginPath();
      ctx.arc(originX, originY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bob
      const bobRadius = 12;
      const grad = ctx.createRadialGradient(
        bobX - 4, bobY - 4, 1, bobX, bobY, bobRadius
      );
      grad.addColorStop(0, "#5effa8");
      grad.addColorStop(1, "#2eff8c");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      // Trail arc
      ctx.strokeStyle = "rgba(46,255,140,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(originX, originY, lenPx, -Math.PI / 6 - Math.PI / 2, Math.PI / 6 - Math.PI / 2);
      ctx.stroke();

      // Info
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`T = ${T.toFixed(2)} с`, 20, 30);
      ctx.fillStyle = "#798389";
      ctx.font = "11px monospace";
      ctx.fillText(`l = ${length} м`, 20, 48);

      if (isRunning) {
        time += 0.016;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [length, isRunning]);

  const startSimulation = () => {
    setIsRunning(true);
    const T = 2 * Math.PI * Math.sqrt(length / G);
    setTimeout(() => {
      setIsRunning(false);
      setResult({ period: T });
    }, T * 1000);
  };

  const reset = () => {
    setIsRunning(false);
    setResult(null);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-[#434e54]"
          style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
        />
      </div>
      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-4">Параметры</h4>
          <div>
            <label className="text-xs text-[#798389] block mb-2">
              Длина нити: {length} м
            </label>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={length}
              onChange={(e) => {
                setLength(parseFloat(e.target.value));
                reset();
              }}
              disabled={isRunning}
              className="w-full accent-[#2eff8c]"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={startSimulation}
              disabled={isRunning}
              className="flex-1 btn-lime flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play size={16} />
              {isRunning ? "Колебание..." : "Запустить"}
            </button>
            <button onClick={reset} className="btn-outline px-4">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
            <h4 className="font-semibold text-[#2eff8c] mb-3">Результаты</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#798389]">Период:</span>
                <span className="font-mono-phys text-[#2eff8c]">
                  {result.period.toFixed(2)} с
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Длина:</span>
                <span className="font-mono-phys">{length} м</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#798389]">Частота:</span>
                <span className="font-mono-phys">
                  {(1 / result.period).toFixed(2)} Гц
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Теория</h4>
          <p className="text-sm text-[#c8cdd1] leading-relaxed">
            Период математического маятника:
          </p>
          <p className="formula-text text-center my-3">T = 2π√(l/g)</p>
          <p className="text-sm text-[#c8cdd1]">
            Зависимость периода от длины нити носит квадратичный характер.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ OHM'S LAW SIMULATION ============ */
function OhmLawSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const current = voltage / resistance;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1f22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Circuit rectangle
    const w = 300;
    const h = 200;
    const x1 = cx - w / 2;
    const y1 = cy - h / 2;

    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, w, h);

    // Battery (left side)
    ctx.fillStyle = "#2eff8c";
    ctx.fillRect(x1 - 15, cy - 20, 10, 40);
    ctx.fillStyle = "#01acff";
    ctx.fillRect(x1 - 30, cy - 10, 10, 20);

    // Battery label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`${voltage}V`, x1 - 55, cy + 4);

    // Resistor (top)
    ctx.fillStyle = "#ffcb3d";
    const resistorW = 60;
    ctx.fillRect(cx - resistorW / 2, y1 - 8, resistorW, 16);
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`${resistance}Ω`, cx - 15, y1 + 4);

    // Light bulb (right side)
    const bulbX = x1 + w + 20;
    const bulbY = cy;
    const brightness = Math.min(current / 5, 1);

    // Bulb glow
    const glowGrad = ctx.createRadialGradient(bulbX, bulbY, 5, bulbX, bulbY, 40);
    glowGrad.addColorStop(0, `rgba(255,255,100,${brightness * 0.8})`);
    glowGrad.addColorStop(1, "rgba(255,255,100,0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Bulb
    ctx.fillStyle = `rgb(${200 + brightness * 55}, ${200 + brightness * 55}, ${150 - brightness * 50})`;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ammeter (bottom)
    ctx.fillStyle = "#2a3237";
    ctx.beginPath();
    ctx.arc(cx, y1 + h + 20, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2eff8c";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#2eff8c";
    ctx.font = "bold 11px monospace";
    ctx.fillText("A", cx - 5, y1 + h + 26);

    // Current flow arrows (animated)
    ctx.fillStyle = `rgba(46,255,140,${0.3 + brightness * 0.5})`;
    const arrowOffset = (Date.now() / 500) % 1;
    for (let i = 0; i < 4; i++) {
      const pos = (arrowOffset + i * 0.25) % 1;
      // Top edge
      ctx.beginPath();
      ctx.arc(x1 + pos * w, y1, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Info panel
    ctx.fillStyle = "#2a3237";
    ctx.fillRect(20, 20, 180, 100);
    ctx.strokeStyle = "#434e54";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 180, 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText("Измерения:", 30, 42);

    ctx.fillStyle = "#2eff8c";
    ctx.font = "12px monospace";
    ctx.fillText(`I = ${current.toFixed(2)} A`, 30, 62);
    ctx.fillStyle = "#01acff";
    ctx.fillText(`U = ${voltage} V`, 30, 80);
    ctx.fillStyle = "#ffcb3d";
    ctx.fillText(`R = ${resistance} Ω`, 30, 98);

    // Formula
    ctx.fillStyle = "#798389";
    ctx.font = "11px monospace";
    ctx.fillText("I = U / R", 20, canvas.height - 20);
  }, [voltage, resistance, current]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-[#434e54]"
          style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
        />
      </div>
      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-4">Параметры цепи</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Напряжение: {voltage} В
              </label>
              <input
                type="range"
                min={1}
                max={24}
                step={1}
                value={voltage}
                onChange={(e) => setVoltage(parseInt(e.target.value))}
                className="w-full accent-[#01acff]"
              />
            </div>
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Сопротивление: {resistance} Ом
              </label>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={resistance}
                onChange={(e) => setResistance(parseFloat(e.target.value))}
                className="w-full accent-[#ffcb3d]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
          <h4 className="font-semibold text-[#2eff8c] mb-3">Результаты</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#798389]">Сила тока:</span>
              <span className="font-mono-phys text-[#2eff8c]">
                {current.toFixed(2)} А
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#798389]">Мощность:</span>
              <span className="font-mono-phys">
                {(voltage * current).toFixed(1)} Вт
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Теория</h4>
          <p className="formula-text text-center my-3">I = U/R</p>
          <p className="text-sm text-[#c8cdd1]">
            Закон Ома: сила тока прямо пропорциональна напряжению и обратно
            пропорциональна сопротивлению.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ DIFFRACTION SIMULATION ============ */
function DiffractionSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wavelength, setWavelength] = useState(550);
  const [slitSpacing, setSlitSpacing] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a1f22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const slitX = 200;
    const screenX = 500;
    const screenH = 300;
    const screenY = (canvas.height - screenH) / 2;

    // Light source
    const grad = ctx.createLinearGradient(0, 0, slitX, 0);
    const r = Math.floor(255 * (1 - (wavelength - 400) / 300));
    const g = Math.floor(255 * (1 - Math.abs(wavelength - 550) / 150));
    const b = Math.floor(255 * ((wavelength - 400) / 300));
    grad.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.8)`);
    ctx.fillStyle = grad;
    ctx.fillRect(50, screenY, slitX - 50, screenH);

    // Barrier with slits
    ctx.fillStyle = "#434e54";
    ctx.fillRect(slitX, 0, 8, screenY + screenH / 2 - 15);
    ctx.fillRect(slitX, screenY + screenH / 2 + 15, 8, canvas.height);

    // Slit labels
    ctx.fillStyle = "#2eff8c";
    ctx.font = "9px monospace";
    ctx.fillText("S1", slitX + 2, screenY + screenH / 2 - 20);
    ctx.fillText("S2", slitX + 2, screenY + screenH / 2 + 25);

    // Interference pattern on screen
    const numPoints = 200;
    for (let i = 0; i < numPoints; i++) {
      const y = screenY + (i / numPoints) * screenH;
      const centerY = screenY + screenH / 2;
      const dy = y - centerY;

      // Double slit interference: I = I0 * cos²(πd sinθ / λ)
      const theta = Math.atan2(dy, screenX - slitX);
      const d = slitSpacing * 1e-6; // convert μm to m
      const lambda = wavelength * 1e-9; // convert nm to m
      const phase = (Math.PI * d * Math.sin(theta)) / lambda;
      const intensity = Math.pow(Math.cos(phase), 2);

      const barWidth = intensity * 40;
      const colorVal = Math.floor(intensity * 255);
      ctx.fillStyle = `rgba(${Math.min(255, r + colorVal / 3)},${Math.min(255, g + colorVal / 3)},${Math.min(255, b + colorVal / 3)},${0.3 + intensity * 0.7})`;
      ctx.fillRect(screenX - barWidth / 2, y, barWidth, screenH / numPoints);
    }

    // Screen line
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(screenX, screenY + screenH);
    ctx.stroke();

    // Info
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`λ = ${wavelength} нм`, 20, 30);
    ctx.fillStyle = "#2eff8c";
    ctx.font = "11px monospace";
    ctx.fillText(`d = ${slitSpacing} мкм`, 20, 48);
    ctx.fillStyle = "#798389";
    ctx.font = "10px monospace";
    ctx.fillText("Интерференционная картина", 20, canvas.height - 20);
  }, [wavelength, slitSpacing]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-[#434e54]"
          style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
        />
      </div>
      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-4">Параметры</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Длина волны: {wavelength} нм
              </label>
              <input
                type="range"
                min={400}
                max={700}
                step={10}
                value={wavelength}
                onChange={(e) => setWavelength(parseInt(e.target.value))}
                className="w-full accent-[#2eff8c]"
              />
              <div className="flex justify-between text-[10px] text-[#798389] mt-1">
                <span>Фиолетовый</span>
                <span>Красный</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Шаг решётки: {slitSpacing} мкм
              </label>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.1}
                value={slitSpacing}
                onChange={(e) => setSlitSpacing(parseFloat(e.target.value))}
                className="w-full accent-[#01acff]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Теория</h4>
          <p className="text-sm text-[#c8cdd1]">
            Условие максимума при дифракции на двух щелях:
          </p>
          <p className="formula-text text-center my-3">d·sin φ = mλ</p>
          <p className="text-sm text-[#c8cdd1]">
            Где d — расстояние между щелями, λ — длина волны, m — порядок
            максимума.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ LENS SIMULATION ============ */
function LensSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focalLength, setFocalLength] = useState(10);
  const [objectDist, setObjectDist] = useState(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a1f22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const opticalAxisY = canvas.height / 2;
    const lensX = canvas.width / 2;
    const cm = 8; // pixels per cm

    // Optical axis
    ctx.strokeStyle = "#c8cdd1";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, opticalAxisY);
    ctx.lineTo(canvas.width - 20, opticalAxisY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lens
    ctx.strokeStyle = "#2eff8c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lensX, opticalAxisY - 60);
    ctx.quadraticCurveTo(lensX + 15, opticalAxisY - 30, lensX, opticalAxisY);
    ctx.quadraticCurveTo(lensX - 15, opticalAxisY + 30, lensX, opticalAxisY + 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lensX, opticalAxisY - 60);
    ctx.quadraticCurveTo(lensX - 15, opticalAxisY - 30, lensX, opticalAxisY);
    ctx.quadraticCurveTo(lensX + 15, opticalAxisY + 30, lensX, opticalAxisY + 60);
    ctx.stroke();

    // Focal points
    const fPx = focalLength * cm;
    ctx.fillStyle = "#ffcb3d";
    ctx.beginPath();
    ctx.arc(lensX - fPx, opticalAxisY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lensX + fPx, opticalAxisY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#798389";
    ctx.font = "10px monospace";
    ctx.fillText("F", lensX - fPx - 3, opticalAxisY + 16);
    ctx.fillText("F", lensX + fPx - 3, opticalAxisY + 16);

    // Object
    const objX = lensX - objectDist * cm;
    const objH = 40;
    ctx.strokeStyle = "#01acff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, opticalAxisY);
    ctx.lineTo(objX, opticalAxisY - objH);
    ctx.stroke();
    ctx.fillStyle = "#01acff";
    ctx.beginPath();
    ctx.moveTo(objX - 5, opticalAxisY - objH + 8);
    ctx.lineTo(objX, opticalAxisY - objH);
    ctx.lineTo(objX + 5, opticalAxisY - objH + 8);
    ctx.fill();
    ctx.font = "11px monospace";
    ctx.fillText("Предмет", objX - 20, opticalAxisY + 20);

    // Image (using lens formula)
    const d = objectDist;
    const f = focalLength;
    if (d > f) {
      const imageDist = (f * d) / (d - f);
      const imageX = lensX + imageDist * cm;
      const magnification = imageDist / d;
      const imageH = objH * magnification;

      ctx.strokeStyle = "#2eff8c";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(imageX, opticalAxisY);
      ctx.lineTo(imageX, opticalAxisY + imageH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#2eff8c";
      ctx.font = "11px monospace";
      ctx.fillText("Изображение", imageX - 25, opticalAxisY + imageH + 20);

      // Ray tracing
      ctx.strokeStyle = "rgba(46,255,140,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      // Ray parallel to axis -> through F'
      ctx.beginPath();
      ctx.moveTo(objX, opticalAxisY - objH);
      ctx.lineTo(lensX, opticalAxisY - objH);
      ctx.lineTo(imageX, opticalAxisY + imageH);
      ctx.stroke();
      // Ray through center
      ctx.beginPath();
      ctx.moveTo(objX, opticalAxisY - objH);
      ctx.lineTo(imageX, opticalAxisY + imageH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Info
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`F = ${focalLength} см`, 20, 30);
    ctx.fillStyle = "#798389";
    ctx.font = "11px monospace";
    ctx.fillText(`d = ${objectDist} см`, 20, 48);
    if (d > f) {
      const imgDist = ((f * d) / (d - f)).toFixed(1);
      ctx.fillStyle = "#2eff8c";
      ctx.fillText(`f = ${imgDist} см`, 20, 66);
    }
  }, [focalLength, objectDist]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-[#434e54]"
          style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
        />
      </div>
      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-4">Параметры</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Фокусное расстояние: {focalLength} см
              </label>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={focalLength}
                onChange={(e) => setFocalLength(parseInt(e.target.value))}
                className="w-full accent-[#2eff8c]"
              />
            </div>
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Расстояние до предмета: {objectDist} см
              </label>
              <input
                type="range"
                min={15}
                max={50}
                step={1}
                value={objectDist}
                onChange={(e) => setObjectDist(parseInt(e.target.value))}
                className="w-full accent-[#01acff]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Теория</h4>
          <p className="formula-text text-center my-3">1/F = 1/d + 1/f</p>
          <p className="text-sm text-[#c8cdd1]">
            Формула тонкой линзы. F — фокусное расстояние, d — расстояние до
            предмета, f — расстояние до изображения.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ PHOTOELECTRIC EFFECT SIMULATION ============ */
function PhotoeffectSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frequency, setFrequency] = useState(8);
  const [workFunction, setWorkFunction] = useState(2);

  const h = 4.136e-15; // eV·s
  const EK = Math.max(0, h * frequency * 1e14 - workFunction);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a1f22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cathode plate
    ctx.fillStyle = "#434e54";
    ctx.fillRect(100, 350, 100, 20);
    ctx.fillStyle = "#798389";
    ctx.font = "10px monospace";
    ctx.fillText("Катод", 125, 385);

    // Anode plate
    ctx.fillStyle = "#434e54";
    ctx.fillRect(400, 350, 100, 20);
    ctx.fillText("Анод", 425, 385);

    // Light beam
    const freqColor = Math.min(1, Math.max(0, (frequency - 4) / 10));
    const r = Math.floor(200 * freqColor + 55);
    const g = Math.floor(100 * (1 - freqColor));
    const b = Math.floor(255 * (1 - freqColor * 0.5));

    const lightGrad = ctx.createLinearGradient(0, 0, 300, 0);
    lightGrad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    lightGrad.addColorStop(1, `rgba(${r},${g},${b},0.8)`);
    ctx.fillStyle = lightGrad;
    ctx.fillRect(50, 340, 200, 40);

    // Light source label
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.font = "bold 12px monospace";
    ctx.fillText(`ν = ${frequency}×10¹⁴ Гц`, 50, 325);

    // Photons
    for (let i = 0; i < 5; i++) {
      const x = 120 + i * 35;
      const y = 340 + Math.sin(Date.now() / 200 + i) * 10;
      ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Electrons (if EK > 0)
    if (EK > 0) {
      for (let i = 0; i < 6; i++) {
        const startX = 150 + Math.random() * 40;
        const speed = EK * 3;
        const ex = startX + (Math.random() * speed + 50);
        const ey = 340 + Math.random() * 20 - 10;

        if (ex < 400) {
          ctx.fillStyle = "#2eff8c";
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fill();

          // Electron trail
          ctx.strokeStyle = "rgba(46,255,140,0.2)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(startX, ey);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      }
    }

    // Info panel
    ctx.fillStyle = "#2a3237";
    ctx.fillRect(20, 20, 200, 80);
    ctx.strokeStyle = "#434e54";
    ctx.strokeRect(20, 20, 200, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.fillText("Результаты:", 30, 40);
    ctx.fillStyle = EK > 0 ? "#2eff8c" : "#ff4444";
    ctx.font = "11px monospace";
    ctx.fillText(`Eₖ = ${EK.toFixed(2)} эВ`, 30, 58);
    ctx.fillStyle = "#798389";
    ctx.fillText(`Aвых = ${workFunction} эВ`, 30, 76);

    // Formula
    ctx.fillStyle = "#c8cdd1";
    ctx.font = "11px monospace";
    ctx.fillText("hν = Aвых + Eₖ", 20, canvas.height - 30);
  }, [frequency, workFunction, EK]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-[#434e54]"
          style={{ maxWidth: 600, height: "auto", aspectRatio: "6/5" }}
        />
      </div>
      <div className="space-y-4">
        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-4">Параметры</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Частота света: {frequency}×10¹⁴ Гц
              </label>
              <input
                type="range"
                min={4}
                max={15}
                step={0.5}
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
                className="w-full accent-[#2eff8c]"
              />
            </div>
            <div>
              <label className="text-xs text-[#798389] block mb-2">
                Работа выхода: {workFunction} эВ
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={workFunction}
                onChange={(e) => setWorkFunction(parseFloat(e.target.value))}
                className="w-full accent-[#01acff]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#2eff8c]/30 rounded-xl p-5">
          <h4 className="font-semibold text-[#2eff8c] mb-3">Результаты</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#798389]">Энергия фотона:</span>
              <span className="font-mono-phys">
                {(h * frequency * 1e14).toFixed(2)} эВ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#798389]">Eₖ электрона:</span>
              <span className={`font-mono-phys ${EK > 0 ? "text-[#2eff8c]" : "text-red-400"}`}>
                {EK.toFixed(2)} эВ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#798389]">Фотоэффект:</span>
              <span className={EK > 0 ? "text-[#2eff8c]" : "text-red-400"}>
                {EK > 0 ? "есть" : "нет"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#2a3237] border border-[#434e54] rounded-xl p-5">
          <h4 className="font-semibold mb-3">Теория</h4>
          <p className="formula-text text-center my-3">hν = Aвых + Eₖ</p>
          <p className="text-sm text-[#c8cdd1]">
            Уравнение Эйнштейна: энергия фотона идёт на работу выхода и
            кинетическую энергию электрона.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ MAIN LAB DETAIL PAGE ============ */
const simMap: Record<string, React.FC> = {
  "free-fall-acceleration": FreeFallSim,
  "pendulum-oscillations": PendulumSim,
  "ohms-law": OhmLawSim,
  "light-diffraction": DiffractionSim,
  "lens-focal-length": LensSim,
  "photoelectric-effect": PhotoeffectSim,
};

export default function LabDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: lab, isLoading } = trpc.course.labBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const Simulation = slug ? simMap[slug] : null;

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-[#2eff8c] animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#798389] mb-4">Лабораторная работа не найдена</p>
          <button onClick={() => navigate("/labs")} className="btn-lime">
            К списку лабораторий
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-[#262e33] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate("/labs")}
            className="inline-flex items-center gap-2 text-[#798389] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Назад к лабораториям
          </button>

          <p className="formula-text text-sm mb-3">Лабораторная работа</p>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">{lab.title}</h1>
          <p className="text-[#c8cdd1] max-w-2xl">{lab.description}</p>
        </div>
      </section>

      {/* Simulation */}
      <section className="section-dark py-12">
        <div className="max-w-7xl mx-auto px-6">
          {Simulation ? (
            <Simulation />
          ) : (
            <div className="text-center py-20 text-[#798389]">
              Симуляция для этой лаборатории в разработке
            </div>
          )}
        </div>
      </section>

      {/* Theory */}
      {lab.theory && (
        <section className="section-light py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">
              Теоретическое обоснование
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-[#434e54] leading-relaxed">{lab.theory}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
