import {
  Award,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Mail,
  Send,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";

export default function About() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-[#262e33] py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="formula-text text-sm mb-4">
                F = ma | преподаватель физики
              </p>
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-6">
                О преподавателе
              </h1>
              <p className="text-[#c8cdd1] leading-relaxed mb-6">
                Более 12 лет преподаю физику в средней школе. Разработал
                собственную методику обучения, основанную на алгоритмическом
                подходе к решению задач. Каждый ученик получает персональный
                кабинет с доступом к полному школьному курсу, интерактивным
                лабораторным работам и отслеживанию прогресса.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://t.me/physics_teacher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2a3237] border border-[#434e54] text-white px-4 py-2.5 rounded-full text-sm hover:border-[#2eff8c]/50 transition-colors"
                >
                  <Send size={16} className="text-[#01acff]" />
                  Telegram
                </a>
                <a
                  href="mailto:teacher@kvant.physics"
                  className="inline-flex items-center gap-2 bg-[#2a3237] border border-[#434e54] text-white px-4 py-2.5 rounded-full text-sm hover:border-[#2eff8c]/50 transition-colors"
                >
                  <Mail size={16} className="text-[#ffcb3d]" />
                  Email
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="w-72 h-72 lg:w-80 lg:h-80 mx-auto rounded-full overflow-hidden border-2 border-[#2eff8c] shadow-2xl">
                <img
                  src="/images/teacher.jpg"
                  alt="Преподаватель физики"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#2eff8c] text-black font-mono-phys text-sm px-5 py-2 rounded-full font-medium whitespace-nowrap">
                E = mc²
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-dark py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Calendar,
                value: "12+",
                label: "Лет преподавания",
                color: "#2eff8c",
              },
              {
                icon: Users,
                value: "500+",
                label: "Учеников",
                color: "#01acff",
              },
              {
                icon: BookOpen,
                value: "12",
                label: "Тем курса",
                color: "#ffcb3d",
              },
              {
                icon: FlaskConical,
                value: "6",
                label: "Лабораторных работ",
                color: "#ff6b6b",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#2a3237] border border-[#434e54] rounded-2xl p-6 text-center transition-all hover:border-[#2eff8c]/30"
              >
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[#798389]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Experience */}
      <section className="section-light py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-10 text-center">
            Образование и опыт
          </h2>

          <div className="space-y-6">
            {[
              {
                year: "2012 — н.в.",
                title: "Преподаватель физики",
                desc: "Средняя общеобразовательная школа. Преподавание физики для 7-11 классов. Подготовка к ОГЭ и ЕГЭ. Разработка авторских методик.",
                icon: GraduationCap,
              },
              {
                year: "2010 — 2012",
                title: "Аспирантура",
                desc: "Исследования в области физического образования. Разработка интерактивных методов обучения.",
                icon: Award,
              },
              {
                year: "2005 — 2010",
                title: "МГУ им. Ломоносова",
                desc: "Физический факультет. Специальность: физика. Диплом с отличием.",
                icon: BookOpen,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-[#2eff8c]/10 flex items-center justify-center shrink-0">
                  <item.icon size={22} className="text-[#2eff8c]" />
                </div>
                <div>
                  <span className="text-xs font-mono-phys text-[#2eff8c]">
                    {item.year}
                  </span>
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#434e54] mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-10 text-center">
            Методика преподавания
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "Алгоритмический подход",
                desc: "Каждая задача решается по чёткому алгоритму: от анализа условия до проверки ответа. Это исключает хаотичные попытки и вырабатывает системное мышление.",
              },
              {
                num: "02",
                title: "Интерактивные лаборатории",
                desc: "Вместо статичных описаний — живые симуляции. Ученик может менять параметры эксперимента и наблюдать результат в реальном времени.",
              },
              {
                num: "03",
                title: "Персональный трекинг",
                desc: "Каждый ученик видит свой прогресс по всем темам. Система автоматически подсвечивает слабые места и рекомендует материалы для изучения.",
              },
              {
                num: "04",
                title: "От простого к сложному",
                desc: "Курс построен по принципу нарастающей сложности. Каждая новая тема опирается на предыдущие, создавая цельную картину мира.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-[#2a3237] border border-[#434e54] rounded-xl p-6"
              >
                <span className="font-mono-phys text-2xl font-bold text-[#2eff8c]">
                  {item.num}
                </span>
                <h3 className="text-lg font-semibold mt-3 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-[#c8cdd1] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-light py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-4">
            Свяжитесь со мной
          </h2>
          <p className="text-[#434e54] mb-8">
            Если у вас есть вопросы о курсе или вы хотите записаться на занятия
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <a
              href="https://t.me/physics_teacher"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#01acff] text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              <Send size={18} />
              Telegram
            </a>
            <a
              href="mailto:teacher@kvant.physics"
              className="flex items-center justify-center gap-2 bg-[#262e33] text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              <Mail size={18} />
              Написать письмо
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-[#798389]">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              Москва
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Занятия онлайн и офлайн
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
