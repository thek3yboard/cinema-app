"use client";

import { useId } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { GlobalSearchController } from '@/hooks/useGlobalSearch';
import {
  getSearchResultImage,
  getSearchResultTitle,
  GlobalSearchResult
} from '@/types/search';

type Props = {
  controller: GlobalSearchController;
  className?: string;
};

export default function GlobalSearchInput({ controller, className = '' }: Props) {
  const t = useTranslations('GlobalSearch');
  const listboxId = useId();
  const showDropdown = controller.isOpen
    && controller.query.trim().length >= controller.minimumQueryLength
    && (controller.isLoading || controller.hasSearched);

  const getTypeLabel = (result: GlobalSearchResult) => {
    if (result.media_type === 'movie') return t('movie');
    if (result.media_type === 'tv') return t('show');
    if (result.media_type === 'user') return t('user');
    return t('person');
  };

  return (
    <div className={`relative min-w-0 ${className}`}>
      <div className="relative flex h-10 w-full min-w-0 items-center rounded-[3px] bg-blueish-gray">
        <input
          type="text"
          inputMode="search"
          value={controller.query}
          onChange={controller.handleChange}
          onKeyDown={controller.handleKeyDown}
          onFocus={controller.open}
          onBlur={() => window.setTimeout(controller.close, 150)}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={controller.highlightedIndex >= 0 ? `${listboxId}-${controller.highlightedIndex}` : undefined}
          className={`h-full min-w-0 flex-1 bg-transparent pl-3 text-[13px] text-white outline-none placeholder:text-slate-400 sm:text-sm ${
            controller.query ? 'pr-9' : 'pr-3'
          }`}
        />
        {controller.query && (
          <button
            onMouseDown={(event) => event.preventDefault()}
            onClick={controller.clear}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            type="button"
            aria-label={t('clear')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          aria-label={t('submit')}
          className="flex h-full w-10 shrink-0 items-center justify-center rounded-r-[3px] bg-lapis-lazuli disabled:cursor-not-allowed disabled:opacity-50"
          disabled={controller.query.trim().length < controller.minimumQueryLength}
          onMouseDown={(event) => event.preventDefault()}
          onClick={controller.submit}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-[80] mt-1 overflow-hidden rounded-md border border-slate-600 bg-slate-800 text-white shadow-2xl">
          {controller.isLoading ? (
            <p className="px-3 py-3 text-sm text-slate-300">{t('searching')}</p>
          ) : controller.suggestions.length ? (
            <ul id={listboxId} role="listbox" aria-label={t('suggestions')} className="max-h-80 overflow-y-auto">
              {controller.suggestions.map((suggestion, index) => {
                const imagePath = getSearchResultImage(suggestion);
                const title = getSearchResultTitle(suggestion);

                return (
                  <li key={`${suggestion.media_type}-${suggestion.id}`}>
                    <button
                      id={`${listboxId}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={controller.highlightedIndex === index}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        controller.selectSuggestion(suggestion);
                      }}
                      className={`flex w-full min-w-0 items-center gap-3 px-3 py-2 text-left transition ${
                        controller.highlightedIndex === index ? 'bg-slate-600' : 'hover:bg-slate-700'
                      }`}
                    >
                      <Image
                        src={imagePath ? (suggestion.media_type === 'user' ? imagePath : `https://image.tmdb.org/t/p/w92${imagePath}`) : '/fallback-portrait.svg'}
                        alt=""
                        width={40}
                        height={56}
                        className="h-14 w-10 shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{title}</span>
                        <span className="mt-0.5 block text-xs text-slate-300">{getTypeLabel(suggestion)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-slate-300">{t('noSuggestions')}</p>
          )}
        </div>
      )}
    </div>
  );
}
