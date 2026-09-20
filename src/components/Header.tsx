import { sql, type CatSummary } from "@/lib/db";
import { getCoverPhoto } from "@/lib/getPhotos";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const cats = (await sql`
    SELECT name, slug FROM cats ORDER BY sort_order ASC
  `) as CatSummary[];

  const catsWithCovers = await Promise.all(
    cats.map(async (cat) => {
      const cover = await getCoverPhoto(cat.slug);
      return { ...cat, coverUrl: cover?.thumbUrl ?? null };
    }),
  );

  return <HeaderClient cats={catsWithCovers} />;
}
