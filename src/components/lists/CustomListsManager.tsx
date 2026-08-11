"use client";

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import { Eye, Lock, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import ListCoverMosaic from './ListCoverMosaic';

type CustomListRow = {
  id: string;
  name: string;
  is_public: boolean;
  background_color: string;
  cover_url: string | null;
  updated_at: string;
  custom_list_items: { poster_path: string | null }[];
};

type Props = {
  locale: string;
  userId: string;
  username: string | null;
};

export default function CustomListsManager({ locale, userId, username }: Props) {
  const t = useTranslations('CustomLists');
  const [lists, setLists] = useState<CustomListRow[]>([]);
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadLists = useCallback(async () => {
    const { data, error } = await createClient()
      .from('custom_lists')
      .select('id, name, is_public, background_color, cover_url, updated_at, custom_list_items(poster_path)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error(t('loadError'));
      return;
    }

    setLists((data ?? []) as CustomListRow[]);
  }, [t, userId]);

  useEffect(() => {
    loadLists().finally(() => setIsLoading(false));
  }, [loadLists]);

  const createList = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setIsSaving(true);
    const { error } = await createClient().from('custom_lists').insert({
      user_id: userId,
      name: normalizedName,
      is_public: isPublic
    });
    setIsSaving(false);

    if (error) return toast.error(t('createError'));
    setName('');
    setIsPublic(false);
    toast.success(t('created'));
    await loadLists();
  };

  const toggleVisibility = async (list: CustomListRow) => {
    const nextVisibility = !list.is_public;
    setLists((current) => current.map((item) => item.id === list.id ? { ...item, is_public: nextVisibility } : item));

    const { error } = await createClient().from('custom_lists')
      .update({ is_public: nextVisibility })
      .eq('id', list.id)
      .eq('user_id', userId);

    if (error) {
      setLists((current) => current.map((item) => item.id === list.id ? list : item));
      toast.error(t('visibilityError'));
    }
  };

  const deleteList = async (list: CustomListRow) => {
    if (!window.confirm(t('deleteConfirmation', { name: list.name }))) return;

    const { error } = await createClient().from('custom_lists')
      .delete()
      .eq('id', list.id)
      .eq('user_id', userId);

    if (error) return toast.error(t('deleteError'));
    setLists((current) => current.filter((item) => item.id !== list.id));
    toast.success(t('deleted'));
  };

  return (
    <section id="custom-lists" className="mt-10 rounded-xl bg-slate-800/80 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
          <p className="mt-1 text-sm text-slate-300">{t('description')}</p>
        </div>
        {username && (
          <Link className="rounded-md border border-slate-500 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700" href={`/${locale}/users/${encodeURIComponent(username)}`}>
            {t('viewPublicProfile')}
          </Link>
        )}
      </div>

      <form onSubmit={createList} className="mt-5 grid gap-3 rounded-lg bg-slate-700/70 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="text-sm font-semibold text-white">
          {t('name')}
          <input
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('namePlaceholder')}
            className="mt-1 h-10 w-full rounded-md border border-slate-500 bg-slate-800 px-3 text-white placeholder:text-slate-400"
          />
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-white">
          <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} className="h-4 w-4" />
          {t('publicList')}
        </label>
        <Button type="submit" isLoading={isSaving} className="bg-lapis-lazuli font-bold text-white">
          {t('create')}
        </Button>
      </form>

      {isLoading ? (
        <p className="mt-5 text-slate-300">{t('loading')}</p>
      ) : lists.length ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {lists.map((list) => (
            <li key={list.id} style={{ backgroundColor: list.background_color }} className="relative overflow-hidden rounded-lg p-3 text-white shadow-md transition hover:-translate-y-0.5">
              <div className="pointer-events-none absolute inset-0 bg-slate-950/45" />
              <div className="relative flex min-w-0 gap-4">
                <Link href={`/${locale}/lists/${list.id}`} aria-label={list.name}>
                  <ListCoverMosaic
                    posterPaths={list.custom_list_items.map((item) => item.poster_path)}
                    label={t('coverPreview', { name: list.name })}
                    coverUrl={list.cover_url}
                    backgroundColor={list.background_color}
                    className="h-24 w-24"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link className="min-w-0 flex-1" href={`/${locale}/lists/${list.id}`}>
                      <span className="block truncate text-lg font-bold hover:underline">{list.name}</span>
                      <span className="mt-1 block text-sm text-slate-300">{t('movieCount', { count: list.custom_list_items.length })}</span>
                    </Link>
                    <button type="button" onClick={() => deleteList(list)} aria-label={t('deleteList', { name: list.name })} className="rounded p-2 text-red-300 hover:bg-slate-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button type="button" onClick={() => toggleVisibility(list)} className="mt-3 flex items-center gap-2 rounded-md border border-slate-500 px-3 py-1.5 text-sm hover:bg-slate-500">
                    {list.is_public ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {list.is_public ? t('public') : t('private')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-slate-300">{t('empty')}</p>
      )}
    </section>
  );
}
