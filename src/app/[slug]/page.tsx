import Gallery from "@/components/Gallery";
import { sql, type CatDetail } from "@/lib/db";
import { getPhotos } from "@/lib/getPhotos";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Cake, CalendarRange } from "lucide-react";

function calcAge(birthdate: string | null) {
  if (!birthdate) return "";
  const birth = new Date(birthdate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years === 0) return `${months} meses`;
  return `${years} años`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const [cat] = (await sql`
    SELECT name FROM cats WHERE slug = ${slug} LIMIT 1
  `) as { name: string }[];

  if (!cat) {
    return {
      title: "Gato no encontrado",
    };
  }

  return {
    title: cat.name,

    openGraph: {
      title: `${cat.name} | GatosDG`,
      description:
        "Fotos, historias y recuerdos de nuestros gatos. Un pequeño rincón dedicado a nuestros compañeros de cuatro patas.",
      images: [
        {
          url: "https://gatosdg.vercel.app/og-image.png",
          width: 1200,
          height: 630,
          alt: `${cat.name} | GatosDG`,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const cats = (await sql`
    SELECT slug FROM cats
  `) as { slug: string }[];
  return cats.map((cat) => ({ slug: cat.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const photos = await getPhotos(slug);

  const coverPhoto = photos[0] ?? null;
  const galleryPhotos = photos.slice(1);

  const [cat] = (await sql`
    SELECT 
      c.id, 
      c.name, 
      c.slug, 
      c.description, 
      c.birthdate::text as birthdate, 
      c.departure_date::text as departure_date, 
      c.location, 
      c.sort_order, 
      c.is_current, 
      COALESCE(
        json_agg(json_build_object('nickname', n.nickname)) FILTER (WHERE n.nickname IS NOT NULL), 
        '[]'::json
      ) AS nicknames 
    FROM cats c 
    LEFT JOIN nicknames n ON c.id = n.cat_id 
    WHERE c.slug = ${slug} 
    GROUP BY c.id
  `) as CatDetail[];

  if (!cat) notFound();
  return (
    <main className="min-h-[calc(100vh-57px)] flex flex-col items-center">
      {/* Container - stacked on mobile/tablet, two-column grid on desktop (lg:) */}
      <div className="w-full max-w-md lg:max-w-6xl lg:grid lg:grid-cols-12 lg:gap-12 flex flex-col pb-12 px-0 lg:px-6 lg:pt-28">
        {/* Left Column: Image & Info Card */}
        <div className="col-span-12 lg:col-span-5 flex flex-col lg:sticky lg:top-28 lg:self-start">
          {/* Cover Photo (Mobile/Tablet only) */}
          <div className="relative w-full aspect-4/5 overflow-hidden block lg:hidden">
            <img
              src={coverPhoto?.url}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
            {/* Bottom vignette gradient to blend the image into the page background */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-surface-900 to-transparent" />
          </div>

          {/* Avatar Container (Desktop only) */}
          <div className="hidden lg:flex justify-center -mb-16 z-20 relative">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary-100 shadow-2xl bg-surface-800">
              <img
                src={coverPhoto?.url}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info Card Container */}
          <div className="relative -mt-16 lg:mt-0 mx-4 lg:mx-2 z-10">
            <div className="bg-surface-800 border border-surface-700 rounded-4xl p-6 lg:pt-20 shadow-2xl flex flex-col gap-4">
              {/* Title & Tags */}
              <div className="flex flex-col gap-2.5">
                <h1 className="text-white text-3xl font-bold tracking-tight">
                  {cat.name}
                </h1>
                {cat.nicknames && cat.nicknames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cat.nicknames.map((n: { nickname: string }) => (
                      <span
                        key={n.nickname}
                        className="bg-surface-600 text-primary-100 text-[10px] font-extrabold tracking-wider px-3.5 py-1 rounded-full uppercase select-none"
                      >
                        {n.nickname}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Age / Period */}
              <div className="flex items-center gap-2 text-primary-50 text-sm mt-2">
                {cat.is_current ? (
                  <>
                    <Cake className="w-4 h-4 text-primary-100" />
                    <span>{calcAge(cat.birthdate)}</span>
                  </>
                ) : (
                  <>
                    <CalendarRange className="w-4 h-4 text-primary-100" />
                    <span>
                      {cat.birthdate?.slice(0, 4)} –{" "}
                      {cat.departure_date?.slice(0, 4) ?? ""}
                    </span>
                  </>
                )}
              </div>
              {/* Location */}
              <div className="flex items-center gap-2 text-primary-50 text-sm">
                <MapPin className="w-4 h-4 text-primary-100" />
                <span>{cat.location}</span>
              </div>

              {/* Description */}
              <p className="whitespace-pre-line text-[#d6cebf] text-[15px] leading-relaxed font-normal mt-2">
                {cat.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Photo Gallery Section */}
        <div className="col-span-12 lg:col-span-7 flex flex-col mt-6 lg:mt-0">
          <Gallery photos={galleryPhotos} />
        </div>
      </div>
    </main>
  );
}
