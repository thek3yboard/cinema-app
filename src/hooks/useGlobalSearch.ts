"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { searchAll } from '@/lib/tmdb/search';
import {
  getSearchResultHref,
  getSearchResultTitle,
  GlobalSearchResult
} from '@/types/search';

const minimumQueryLength = 2;

export function useGlobalSearch(onNavigate?: () => void) {
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GlobalSearchResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < minimumQueryLength) {
      setSuggestions([]);
      setHighlightedIndex(-1);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchAll(normalizedQuery, locale, 1, controller.signal);
        setSuggestions(data.results.slice(0, 8));
        setHighlightedIndex(-1);
        setHasSearched(true);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSuggestions([]);
          setHasSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [locale, query]);

  const submit = () => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < minimumQueryLength) return;

    setIsOpen(false);
    setHighlightedIndex(-1);
    onNavigate?.();
    router.push(`/${locale}/search?query=${encodeURIComponent(normalizedQuery)}`);
  };

  const selectSuggestion = (suggestion: GlobalSearchResult) => {
    setQuery(getSearchResultTitle(suggestion));
    setSuggestions([]);
    setHighlightedIndex(-1);
    setIsOpen(false);
    onNavigate?.();
    router.push(getSearchResultHref(locale, suggestion));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      setHighlightedIndex((current) => current < suggestions.length - 1 ? current + 1 : 0);
      return;
    }

    if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      setHighlightedIndex((current) => current > 0 ? current - 1 : suggestions.length - 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0) selectSuggestion(suggestions[highlightedIndex]);
      else submit();
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const clear = () => {
    setQuery('');
    setSuggestions([]);
    setHighlightedIndex(-1);
    setHasSearched(false);
    setIsOpen(false);
  };

  return {
    query,
    suggestions,
    highlightedIndex,
    isOpen,
    isLoading,
    hasSearched,
    minimumQueryLength,
    handleChange,
    handleKeyDown,
    submit,
    selectSuggestion,
    clear,
    open: () => setIsOpen(true),
    close: () => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };
}

export type GlobalSearchController = ReturnType<typeof useGlobalSearch>;
