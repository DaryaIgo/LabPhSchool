interface Props {
  params: Record<string, number | string>;
  isRunning?: boolean;
}

export default function ExternalIframeSimulation({ params }: Props) {
  const url = String(params.url || "");

  if (!url) {
    return (
      <div className="bg-[#1a1f22] border border-[#37474f] rounded-2xl p-12 text-center text-[#798389]">
        URL симуляции не задан
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div
        className="relative w-full rounded-xl overflow-hidden border border-[#37474f]"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
          src={url}
          title="Внешняя симуляция"
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
