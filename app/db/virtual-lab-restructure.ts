import { getDb } from "../api/queries/connection";
import { labCategories, labSubcategories, labWorks } from "./schema";
import { eq, not, inArray } from "drizzle-orm";

async function restructure() {
  const db = getDb();

  // 1. Get old categories
  const oldCats = await db.select({ id: labCategories.id }).from(labCategories);
  const oldCatIds = oldCats.map((c) => c.id);
  console.log("Old category IDs:", oldCatIds);

  // 2. Insert 5 standard physics categories
  const categories = [
    {
      order: 1,
      title: "Механика",
      slug: "mechanics",
      grade: "7–9 класс",
      description:
        "Кинематика, динамика, статика. Законы Ньютона, движение тел, силы, равновесие, импульс и энергия.",
      shortDesc: "Кинематика, динамика, статика",
      color: "#2eff8c",
      iconType: "mechanics",
    },
    {
      order: 2,
      title: "Молекулярная физика и термодинамика",
      slug: "molecular-thermodynamics",
      grade: "8–10 класс",
      description:
        "Молекулярно-кинетическая теория, идеальный газ, теплопередача, первое и второе начала термодинамики, тепловые машины.",
      shortDesc: "МКТ, газ, термодинамика",
      color: "#ff7043",
      iconType: "thermal",
    },
    {
      order: 3,
      title: "Электродинамика",
      slug: "electrodynamics",
      grade: "8–11 класс",
      description:
        "Электростатика, постоянный ток, магнитное поле, электромагнитная индукция, колебательный контур, электромагнитные волны.",
      shortDesc: "Электричество и магнетизм",
      color: "#ffd600",
      iconType: "circuit",
    },
    {
      order: 4,
      title: "Оптика",
      slug: "optics",
      grade: "8–11 класс",
      description:
        "Геометрическая оптика: отражение, преломление, линзы. Волновая оптика: интерференция, дифракция, дисперсия, поляризация.",
      shortDesc: "Свет, линзы, волны",
      color: "#66bb6a",
      iconType: "optics",
    },
    {
      order: 5,
      title: "Ядерная физика",
      slug: "nuclear-physics",
      grade: "9–11 класс",
      description:
        "Квантовая механика, теория относительности, физика атомного ядра, радиоактивность, ядерные реакции, элементарные частицы.",
      shortDesc: "Кванты, ядро, частицы",
      color: "#ef5350",
      iconType: "atomic",
    },
  ];

  const insertedCats: { id: number; slug: string }[] = [];
  for (const cat of categories) {
    const exists = await db
      .select()
      .from(labCategories)
      .where(eq(labCategories.slug, cat.slug))
      .limit(1);
    if (exists.length > 0) {
      insertedCats.push({ id: exists[0].id, slug: cat.slug });
      console.log(`Category already exists: ${cat.title}`);
      continue;
    }
    const result = await db.insert(labCategories).values(cat);
    insertedCats.push({ id: Number(result[0].insertId), slug: cat.slug });
    console.log(`Created category: ${cat.title} (id=${result[0].insertId})`);
  }

  const catMap = new Map(insertedCats.map((c) => [c.slug, c.id]));

  // 3. Insert subcategories
  const subcategories = [
    // Механика
    { categorySlug: "mechanics", order: 1, title: "Кинематика", slug: "kinematics", description: "Равномерное и равноускоренное движение, движение по окружности, относительность движения." },
    { categorySlug: "mechanics", order: 2, title: "Динамика", slug: "dynamics", description: "Законы Ньютона, силы в природе, сила тяжести, сила упругости, сила трения." },
    { categorySlug: "mechanics", order: 3, title: "Статика", slug: "statics", description: "Условия равновесия тел, момент силы, центр тяжести, простые механизмы." },
    { categorySlug: "mechanics", order: 4, title: "Законы сохранения", slug: "conservation-laws", description: "Импульс, работа, мощность, энергия, закон сохранения импульса и энергии." },

    // Молекулярная физика и термодинамика
    { categorySlug: "molecular-thermodynamics", order: 1, title: "Молекулярная физика", slug: "molecular-physics", description: "Основы МКТ, идеальный газ, уравнение состояния, изопроцессы." },
    { categorySlug: "molecular-thermodynamics", order: 2, title: "Термодинамика", slug: "thermodynamics", description: "Первое и второе начала термодинамики, тепловые машины, КПД, энтропия." },

    // Электродинамика
    { categorySlug: "electrodynamics", order: 1, title: "Электростатика", slug: "electrostatics", description: "Электрическое поле, потенциал, напряжённость, закон Кулона." },
    { categorySlug: "electrodynamics", order: 2, title: "Постоянный ток", slug: "dc-circuits", description: "Закон Ома, соединение проводников, работа и мощность тока." },
    { categorySlug: "electrodynamics", order: 3, title: "Электромагнетизм", slug: "electromagnetism", description: "Магнитное поле, электромагнитная индукция, сила Ампера, колебательный контур." },

    // Оптика
    { categorySlug: "optics", order: 1, title: "Геометрическая оптика", slug: "geometric-optics", description: "Отражение, преломление, линзы, зеркала, оптические приборы." },
    { categorySlug: "optics", order: 2, title: "Волновая оптика", slug: "wave-optics", description: "Интерференция, дифракция, дисперсия, поляризация света." },

    // Ядерная физика
    { categorySlug: "nuclear-physics", order: 1, title: "Квантовая механика", slug: "quantum-mechanics", description: "Фотоэффект, корпускулярно-волновой дуализм, уровни энергии атома." },
    { categorySlug: "nuclear-physics", order: 2, title: "Теория относительности", slug: "relativity", description: "Специальная теория относительности, пространство-время, энергия покоя." },
    { categorySlug: "nuclear-physics", order: 3, title: "Атомное ядро и частицы", slug: "nuclear-particles", description: "Строение ядра, радиоактивность, ядерные реакции, элементарные частицы." },
  ];

  // Clear old subcategories
  const allSubs = await db.select({ id: labSubcategories.id }).from(labSubcategories);
  if (allSubs.length > 0) {
    await db.delete(labSubcategories);
    console.log("Cleared old subcategories");
  }

  const insertedSubs: { id: number; slug: string }[] = [];
  for (const sub of subcategories) {
    const categoryId = catMap.get(sub.categorySlug);
    if (!categoryId) continue;
    const result = await db.insert(labSubcategories).values({
      categoryId,
      order: sub.order,
      title: sub.title,
      slug: sub.slug,
      description: sub.description,
    });
    insertedSubs.push({ id: Number(result[0].insertId), slug: sub.slug });
    console.log(`Created subcategory: ${sub.title}`);
  }

  const subMap = new Map(insertedSubs.map((s) => [s.slug, s.id]));

  // 4. Re-assign existing lab works
  const reassignment = [
    { workId: 1, categorySlug: "molecular-thermodynamics", subSlug: "molecular-physics" },
    { workId: 2, categorySlug: "mechanics", subSlug: "dynamics" },
    { workId: 3, categorySlug: "mechanics", subSlug: "dynamics" },
    { workId: 4, categorySlug: "electrodynamics", subSlug: "dc-circuits" },
  ];

  for (const r of reassignment) {
    const catId = catMap.get(r.categorySlug);
    const subId = subMap.get(r.subSlug);
    if (catId) {
      await db
        .update(labWorks)
        .set({ categoryId: catId, subcategoryId: subId ?? null })
        .where(eq(labWorks.id, r.workId));
      console.log(`Reassigned work ${r.workId} -> ${r.categorySlug}/${r.subSlug}`);
    }
  }

  // 5. Delete old categories that are not in the new set
  const newCatIds = insertedCats.map((c) => c.id);
  if (oldCatIds.length > 0) {
    const catsToDelete = await db
      .select({ id: labCategories.id })
      .from(labCategories)
      .where(not(inArray(labCategories.id, newCatIds)));
    for (const c of catsToDelete) {
      await db.delete(labCategories).where(eq(labCategories.id, c.id));
      console.log(`Deleted old category id=${c.id}`);
    }
  }

  console.log("Restructure complete.");
}

restructure().catch((err) => {
  console.error(err);
  process.exit(1);
});
