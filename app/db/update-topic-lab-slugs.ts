import { getDb } from "../api/queries/connection";
import { topicNodes } from "./schema";
import { eq } from "drizzle-orm";

async function update() {
  const db = getDb();
  const mappings = [
    { slug: "kinematics", labCategorySlug: "mechanics" },
    { slug: "dynamics", labCategorySlug: "mechanics" },
    { slug: "conservation", labCategorySlug: "mechanics" },
    { slug: "statics", labCategorySlug: "mechanics" },
    { slug: "molecular", labCategorySlug: "molecular-thermodynamics" },
    { slug: "electrostatics", labCategorySlug: "electrodynamics" },
    { slug: "dc-circuits", labCategorySlug: "electrodynamics" },
    { slug: "magnetism", labCategorySlug: "electrodynamics" },
    { slug: "oscillations", labCategorySlug: null },
    { slug: "optics", labCategorySlug: "optics" },
    { slug: "atomic", labCategorySlug: "nuclear-physics" },
    { slug: "quantum", labCategorySlug: "nuclear-physics" },
  ];

  for (const m of mappings) {
    await db
      .update(topicNodes)
      .set({ labCategorySlug: m.labCategorySlug })
      .where(eq(topicNodes.slug, m.slug));
    console.log(`Updated ${m.slug} -> ${m.labCategorySlug}`);
  }
  console.log("Done");
}

update().catch((err) => {
  console.error(err);
  process.exit(1);
});
