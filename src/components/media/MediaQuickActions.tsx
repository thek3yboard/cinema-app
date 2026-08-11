"use client";

import { useState, type ReactNode } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Eye, Heart, List, MoreVertical, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import CustomListPicker from '@/components/lists/CustomListPicker';
import type { MediaQuickActionItem, UserMediaState, UserMediaToggleField } from '@/hooks/useUserMediaStates';

type Props = {
  item: MediaQuickActionItem;
  state: UserMediaState;
  userId: string;
  disabled?: boolean;
  onToggle: (field: UserMediaToggleField) => void;
};

type ActionButtonProps = {
  label: string;
  active: boolean;
  activeClassName: string;
  disabled?: boolean;
  icon: ReactNode;
  onClick: () => void;
};

function ActionButton({ label, active, activeClassName, disabled, icon, onClick }: ActionButtonProps) {
  return (
    <Tooltip content={label} placement="top" className="bg-slate-950 text-slate-100">
      <button
        type="button"
        data-no-drag="true"
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={`pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyanza disabled:opacity-50 ${active ? activeClassName : 'bg-slate-100 text-slate-700'}`}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

export default function MediaQuickActions({ item, state, userId, disabled, onToggle }: Props) {
  const t = useTranslations('MediaUI');
  const [isTouchOpen, setIsTouchOpen] = useState(false);
  const watchlistLabel = state.in_watchlist ? t('removeFromWatchlist') : t('addToWatchlist');
  const watchedLabel = state.is_watched ? t('markAsUnwatched') : t('markAsWatched');
  const favoriteLabel = state.is_favorite ? t('removeFromFavorites') : t('addToFavorites');

  return (
    <div className="pointer-events-none absolute inset-0 isolate">
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-slate-950/65 p-3 backdrop-blur-[3px] transition duration-200 ${isTouchOpen ? 'visible opacity-100' : 'invisible opacity-0 group-focus-within:visible group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:visible [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:delay-150'}`}
        aria-label={t('quickActions', { title: item.title })}
      >
        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            label={watchlistLabel}
            active={state.in_watchlist}
            activeClassName="bg-blue-500 text-white"
            disabled={disabled}
            icon={<List className="h-5 w-5" />}
            onClick={() => onToggle('in_watchlist')}
          />
          <ActionButton
            label={watchedLabel}
            active={state.is_watched}
            activeClassName="bg-emerald-500 text-white"
            disabled={disabled}
            icon={<Eye className="h-5 w-5" />}
            onClick={() => onToggle('is_watched')}
          />
          <ActionButton
            label={favoriteLabel}
            active={state.is_favorite}
            activeClassName="bg-rose-500 text-white"
            disabled={disabled}
            icon={<Heart className="h-5 w-5" fill={state.is_favorite ? 'currentColor' : 'none'} />}
            onClick={() => onToggle('is_favorite')}
          />
          <CustomListPicker
            compact
            userId={userId}
            mediaId={item.mediaId}
            mediaType={item.mediaType}
            title={item.title}
            posterPath={item.posterPath}
            releaseYear={item.releaseYear}
            popularity={item.popularity}
            voteAverage={item.voteAverage}
          />
        </div>
      </div>
      <button
        type="button"
        data-no-drag="true"
        aria-label={isTouchOpen ? t('closeQuickActions') : t('openQuickActions', { title: item.title })}
        aria-expanded={isTouchOpen}
        onClick={() => setIsTouchOpen((current) => !current)}
        className="pointer-events-auto absolute right-2 top-2 z-30 hidden h-9 w-9 items-center justify-center rounded-full bg-slate-950/85 text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-nyanza [@media(hover:none)]:inline-flex"
      >
        {isTouchOpen ? <X className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
      </button>
    </div>
  );
}
