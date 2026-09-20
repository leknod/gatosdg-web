import { sql, type CatSummary } from "@/lib/db";
import { getCoverPhoto } from "@/lib/getPhotos";
import Link from "next/link";

type CatWithCover = CatSummary & {
  coverUrl: string | null;
};

export default async function Home() {
  const cats = (await sql`
    SELECT name, slug FROM cats ORDER BY sort_order ASC
  `) as CatSummary[];

  const catsWithCovers: CatWithCover[] = await Promise.all(
    cats.map(async (cat) => {
      const cover = await getCoverPhoto(cat.slug);
      return { ...cat, coverUrl: cover?.url ?? null };
    }),
  );

  return (
    <main className="min-h-[calc(100vh-57px)] bg-surface-900 pt-28 pb-16 px-4">
      <div className="flex flex-col items-center gap-10 px-8 sm:grid sm:grid-cols-3 md:grid-cols-4 sm:max-w-4xl sm:mx-auto sm:gap-6 md:gap-8">
        {catsWithCovers.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group flex flex-col items-center gap-3 w-full sm:w-auto"
          >
            {/* Circular avatar */}
            <div className="w-full aspect-square rounded-full overflow-hidden border-2 border-surface-700 group-hover:border-primary-100/60 shadow-lg group-hover:shadow-primary-100/20 group-hover:shadow-xl transition-all duration-300">
              {cat.coverUrl ? (
                <img
                  src={cat.coverUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-800">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 sm:w-10 sm:h-10 text-[#3a3025]"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Name */}
            <span className="text-white font-semibold text-base sm:text-sm tracking-wide text-center group-hover:text-primary-100 transition-colors duration-200">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
