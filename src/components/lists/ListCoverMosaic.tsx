"use client";

import Image from 'next/image';
import { Clapperboard } from 'lucide-react';

type Props = {
  posterPaths: Array<string | null>;
  label: string;
  coverUrl?: string | null;
  backgroundColor?: string;
  className?: string;
  priority?: boolean;
};

export default function ListCoverMosaic({ posterPaths, label, coverUrl, backgroundColor, className = '', priority = false }: Props) {
  if (coverUrl) {
    return (
      <div
        role="img"
        aria-label={label}
        style={{ backgroundColor, backgroundImage: `url(${JSON.stringify(coverUrl)})` }}
        className={`shrink-0 overflow-hidden rounded-md bg-cover bg-center shadow-lg ${className}`}
      />
    );
  }

  const posters = posterPaths.filter((path): path is string => Boolean(path)).slice(0, 4);
  const gridClass = posters.length === 1
    ? 'grid-cols-1'
    : posters.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-2 grid-rows-2';

  return (
    <div
      role="img"
      aria-label={label}
      style={{ backgroundColor }}
      className={`relative grid shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-slate-600 to-slate-900 shadow-lg ${gridClass} ${className}`}
    >
      {posters.length ? posters.map((posterPath, index) => (
        <span
          key={`${posterPath}-${index}`}
          className={`relative min-h-0 min-w-0 overflow-hidden ${posters.length === 3 && index === 0 ? 'row-span-2' : ''}`}
        >
          <Image
            src={`https://image.tmdb.org/t/p/w342${posterPath}`}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 96px, 192px"
            className="object-cover"
          />
        </span>
      )) : (
        <span className="absolute inset-0 flex items-center justify-center text-slate-300">
          <Clapperboard className="h-1/3 w-1/3" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
