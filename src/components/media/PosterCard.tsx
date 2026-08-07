"use client";

import type { ReactNode } from 'react';
import Image from 'next/image';

type Props = {
  title: string;
  imageSrc: string;
  metadata: string;
  onClick: () => void;
  action?: ReactNode;
};

export default function PosterCard({ title, imageSrc, metadata, onClick, action }: Props) {
  return (
    <div className="group relative h-full min-w-0 transition hover:-translate-y-1">
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg bg-slate-800/90 text-left text-white shadow-md transition group-hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-nyanza"
      >
        <Image
          src={imageSrc}
          alt={title}
          width={228}
          height={342}
          className="aspect-[2/3] w-full object-cover"
        />
        <span className="flex min-w-0 flex-1 flex-col p-3">
          <span className="line-clamp-2 font-bold">{title}</span>
          <span className="mt-auto pt-2 text-xs text-slate-300">{metadata}</span>
        </span>
      </button>
      {action}
    </div>
  );
}
