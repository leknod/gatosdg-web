"use client";

import { useEffect } from "react";
import Link from "next/link";

type CatData = {
  name: string;
  slug: string;
};

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  cats: CatData[];
};

export default function MobileMenu({ isOpen, onClose, cats }: MobileMenuProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to catch outside clicks, no visual effect */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown panel — positioned below the header, no overlay */}
      <div className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="max-h-[calc(100dvh-5rem)] w-full max-w-4xl bg-surface-800/99 border border-surface-700 shadow-2xl rounded-3xl p-3 pointer-events-auto animate-slide-down flex flex-col overflow-hidden">
          <div
            data-lenis-prevent
            className="overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-1 content-start"
          >
            {cats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={onClose}
                className="text-white hover:text-primary-100 text-sm font-medium tracking-wide transition-colors px-3 py-2 rounded-xl hover:bg-primary-100/8 active:bg-primary-100/15"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
