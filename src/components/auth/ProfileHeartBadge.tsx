"use client";

import { Tooltip } from '@nextui-org/react';
import { Heart } from 'lucide-react';

type Props = {
  partnerUsername: string;
};

export default function ProfileHeartBadge({ partnerUsername }: Props) {
  const partnerHandle = `@${partnerUsername}`;

  return (
    <Tooltip content={partnerHandle} placement="top">
      <span
        aria-label={partnerHandle}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm"
      >
        <Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
      </span>
    </Tooltip>
  );
}
