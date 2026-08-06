"use client";

import { useMemo, useState } from "react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  Zoom,
  Fullscreen,
  Slideshow,
} from "yet-another-react-lightbox/plugins";

type Photo = {
  key: string;
  url: string;
  thumbUrl: string;
};

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = useMemo<Slide[]>(
    () => photos.map((photo) => ({ src: photo.url })),
    [photos],
  );

  const indexedPhotos = photos.map((photo, index) => ({ photo, index }));

  const leftColumnImages = indexedPhotos.filter(({ index }) => index % 2 === 0);

  const rightColumnImages = indexedPhotos.filter(
    ({ index }) => index % 2 === 1,
  );

  const openLightbox = (imageIndex: number) => {
    setIndex(imageIndex);
    setOpen(true);
  };

  return (
    <section className="w-full lg:max-w-none px-4 lg:px-0 pt-6 lg:pt-0 pb-12 lg:pb-0 flex flex-col gap-5">
      <div className="flex justify-between items-baseline">
        <h2 className="text-white text-xl font-bold tracking-wide">Galería</h2>

        <span className="text-primary-100 text-xs font-semibold tracking-wide">
          {photos.length} fotos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {leftColumnImages.map(({ photo, index }) => (
            <img
              key={photo.key}
              src={photo.thumbUrl}
              alt=""
              className="w-full rounded-lg cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => openLightbox(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openLightbox(index);
                }
              }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {rightColumnImages.map(({ photo, index }) => (
            <img
              key={photo.key}
              src={photo.thumbUrl}
              alt=""
              className="w-full rounded-lg cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => openLightbox(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openLightbox(index);
                }
              }}
            />
          ))}
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
        plugins={[Zoom, Fullscreen, Slideshow]}
      />
    </section>
  );
}
