import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2 } from "./r2";

export type Photo = {
  key: string;
  url: string;
  thumbUrl: string;
};

export async function getPhotos(slug: string): Promise<Photo[]> {
  const result = await r2.send(
    new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: `${slug}/`,
    }),
  );

  const files = result.Contents?.filter((file) => file.Key && !file.Key.endsWith("/")) ?? [];

  // Obtener todas las llaves que corresponden a miniaturas (que contienen '_thumb')
  const thumbKeys = new Set(
    files
      .map((f) => f.Key!)
      .filter((key) => key.includes("_thumb")),
  );

  // Las originales son las que no contienen '_thumb'
  const originals = files.filter((f) => !f.Key!.includes("_thumb"));

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL!;

  return originals.map((file) => {
    const key = file.Key!;

    // Obtener la clave esperada para su miniatura reemplazando la extensión por _thumb.webp
    const lastDotIndex = key.lastIndexOf(".");
    const baseKey = lastDotIndex !== -1 ? key.substring(0, lastDotIndex) : key;
    const expectedThumbKey = `${baseKey}_thumb.webp`;

    const hasThumb = thumbKeys.has(expectedThumbKey);

    return {
      key,
      url: `${baseUrl}/${key}`,
      thumbUrl: hasThumb ? `${baseUrl}/${expectedThumbKey}` : `${baseUrl}/${key}`,
    };
  });
}

export async function getCoverPhoto(
  slug: string,
): Promise<Photo | null> {
  // Para la portada obtenemos las fotos del gato y retornamos la primera (que ya viene con su thumbUrl correspondiente)
  const photos = await getPhotos(slug);
  if (photos.length === 0) return null;
  return photos[0];
}

