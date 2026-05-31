import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { ArrowRight, FlaskConical, Rocket, Timer, Waves, Zap } from "lucide-react";

const iconMap: Record<string, string> = {
  mechanics: "/images/icon_lab_mechanics.png",
  pendulum: "/images/icon_lab_pendulum.png",
  circuit: "/images/icon_lab_circuit.png",
  diffraction: "/images/icon_lab_diffraction.png",
  lens: "/images/icon_lab_lens.png",
  photoeffect: "/images/icon_lab_photoeffect.png",
};

export default function Labs() {
  const { data: labsList, isLoading } = trpc.course.labs.useQuery();

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-[#262e33] py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="formula-text text-sm mb-4">F = ma | эксперименты</p>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6">
            Лабораторные работы
          </h1>
          <p className="text-[#c8cdd1] max-w-2xl mx-auto">
            Интерактивные симуляции физических экспериментов. Меняйте
            параметры, наблюдайте результаты, фиксируйте данные.
          </p>
        </div>
      </section>

      {/* Lab Grid */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-[#2a3237] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {labsList?.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/labs/${lab.slug}`}
                  className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-20 h-20 opacity-70 group-hover:opacity-100 transition-opacity">
                      <img
                        src={
                          iconMap[lab.iconType || "mechanics"] ||
                          "/images/icon_lab_mechanics.png"
                        }
                        alt={lab.title}
                        className="w-full h-full object-contain invert"
                      />
                    </div>
                    <span className="w-10 h-10 rounded-full bg-[#2eff8c]/10 flex items-center justify-center group-hover:bg-[#2eff8c]/20 transition-colors">
                      <FlaskConical
                        size={18}
                        className="text-[#2eff8c]"
                      />
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-[#2eff8c] transition-colors">
                    {lab.title}
                  </h3>
                  <p className="text-sm text-[#798389] mb-4 leading-relaxed">
                    {lab.description}
                  </p>

                  <div className="pt-4 border-t border-white/5">
                    <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                      Открыть симуляцию
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Additional standalone labs */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/labs/projectile"
              className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <Rocket size={48} className="text-[#2eff8c]" />
                </div>
                <span className="w-10 h-10 rounded-full bg-[#2eff8c]/10 flex items-center justify-center group-hover:bg-[#2eff8c]/20 transition-colors">
                  <FlaskConical size={18} className="text-[#2eff8c]" />
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#2eff8c] transition-colors">
                Бросок тела под углом к горизонту
              </h3>
              <p className="text-sm text-[#798389] mb-4 leading-relaxed">
                Исследование траектории полёта тела, брошенного под углом.
                Определение дальности, максимальной высоты и времени полёта.
              </p>

              <div className="pt-4 border-t border-white/5">
                <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                  Открыть симуляцию
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            <Link
              to="/labs/pendulum"
              className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <Timer size={48} className="text-[#2eff8c]" />
                </div>
                <span className="w-10 h-10 rounded-full bg-[#2eff8c]/10 flex items-center justify-center group-hover:bg-[#2eff8c]/20 transition-colors">
                  <FlaskConical size={18} className="text-[#2eff8c]" />
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#2eff8c] transition-colors">
                Колебания математического маятника
              </h3>
              <p className="text-sm text-[#798389] mb-4 leading-relaxed">
                Изучение зависимости периода колебаний от длины нити и массы.
                Определение ускорения свободного падения.
              </p>

              <div className="pt-4 border-t border-white/5">
                <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                  Открыть симуляцию
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            <Link
              to="/labs/spring"
              className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <Waves size={48} className="text-[#2eff8c]" />
                </div>
                <span className="w-10 h-10 rounded-full bg-[#2eff8c]/10 flex items-center justify-center group-hover:bg-[#2eff8c]/20 transition-colors">
                  <FlaskConical size={18} className="text-[#2eff8c]" />
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#2eff8c] transition-colors">
                Колебания пружинного маятника
              </h3>
              <p className="text-sm text-[#798389] mb-4 leading-relaxed">
                Исследование зависимости периода от массы груза и жёсткости
                пружины. Закон сохранения энергии в колебательной системе.
              </p>

              <div className="pt-4 border-t border-white/5">
                <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                  Открыть симуляцию
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            <Link
              to="/labs/energy"
              className="group bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 transition-all duration-300 hover:border-[#2eff8c]/50 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <Zap size={48} className="text-[#2eff8c]" />
                </div>
                <span className="w-10 h-10 rounded-full bg-[#2eff8c]/10 flex items-center justify-center group-hover:bg-[#2eff8c]/20 transition-colors">
                  <FlaskConical size={18} className="text-[#2eff8c]" />
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#2eff8c] transition-colors">
                Закон сохранения энергии
              </h3>
              <p className="text-sm text-[#798389] mb-4 leading-relaxed">
                Преобразование потенциальной энергии в кинетическую и тепло
                при движении по наклонной плоскости. Работа силы трения.
              </p>

              <div className="pt-4 border-t border-white/5">
                <span className="inline-flex items-center gap-1 text-[#2eff8c] text-sm font-medium group-hover:gap-2 transition-all">
                  Открыть симуляцию
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
