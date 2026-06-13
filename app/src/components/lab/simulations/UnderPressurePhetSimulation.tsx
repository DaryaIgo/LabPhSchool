interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

// eslint-disable-next-line no-empty-pattern
export default function UnderPressurePhetSimulation({}: Props) {
  const url = "https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html";

  return (
    <div className="w-full space-y-4">
      <div
        className="relative w-full rounded-xl overflow-hidden border border-[#37474f]"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
          src={url}
          title="PhET: Под давлением"
          className="absolute inset-0 w-full h-full"
          allowFullScreen
        />
      </div>
      <p className="text-sm text-[#798389]">
        Если симуляция не загрузилась,{" "}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[#2eff8c] hover:underline"
        >
          откройте её в новой вкладке
        </a>
        .
      </p>
    </div>
  );
}
