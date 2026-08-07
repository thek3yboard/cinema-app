"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@nextui-org/react';
import { Eye, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import MovieListItems, { CustomListMovie } from '@/components/lists/MovieListItems';
import ListCoverMosaic from '@/components/lists/ListCoverMosaic';
import { createClient } from '@/lib/supabase/client';

type ListOwner = {
  username: string;
  avatar_url: string | null;
};

type CustomListDetail = {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  profiles: ListOwner;
};

export default function CustomListPage({ params }: { params: { id: string; locale: string } }) {
  const t = useTranslations('CustomLists');
  const { user, isLoading: isAuthLoading } = useAuth();
  const [list, setList] = useState<CustomListDetail | null>(null);
  const [items, setItems] = useState<CustomListMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    let active = true;

    const loadList = async () => {
      const supabase = createClient();
      const { data: listData, error: listError } = await supabase.from('custom_lists')
        .select('id, user_id, name, is_public, profiles!custom_lists_user_id_fkey(username, avatar_url)')
        .eq('id', params.id)
        .maybeSingle();

      if (!active) return;
      if (listError || !listData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase.from('custom_list_items')
        .select('media_id, title, poster_path, added_at')
        .eq('list_id', params.id)
        .order('added_at', { ascending: false });

      if (!active) return;
      if (itemError) {
        setNotFound(true);
      } else {
        setList(listData as unknown as CustomListDetail);
        setItems((itemData ?? []) as CustomListMovie[]);
      }
      setIsLoading(false);
    };

    loadList();
    return () => { active = false; };
  }, [isAuthLoading, params.id]);

  if (isLoading || isAuthLoading) return <div className="p-8 text-center text-white">{t('loading')}</div>;
  if (notFound || !list) return <div className="p-8 text-center text-white">{t('listNotFound')}</div>;

  const canEdit = user?.id === list.user_id;

  return (
    <main className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <div className="rounded-xl bg-slate-800/80 p-6 text-white">
        <div className="rounded-lg bg-gradient-to-br from-slate-700 via-slate-700/80 to-slate-900 p-5 shadow-lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <ListCoverMosaic
              posterPaths={items.map((item) => item.poster_path)}
              label={t('coverPreview', { name: list.name })}
              className="h-40 w-40 sm:h-44 sm:w-44"
              priority
            />
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                {list.is_public ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {list.is_public ? t('public') : t('private')}
              </div>
              <h1 className="break-words text-3xl font-bold md:text-4xl">{list.name}</h1>
              <p className="mt-3 text-sm text-slate-300">{t('movieCount', { count: items.length })}</p>
            </div>
            <Link href={`/${params.locale}/users/${encodeURIComponent(list.profiles.username)}`} className="flex shrink-0 items-center gap-3 rounded-lg bg-slate-800/80 px-4 py-3 hover:bg-slate-700">
              <Avatar name={list.profiles.username} src={list.profiles.avatar_url ?? undefined} size="sm" />
              <span>
                <span className="block text-xs text-slate-300">{t('createdBy')}</span>
                <span className="block font-semibold">@{list.profiles.username}</span>
              </span>
            </Link>
          </div>
        </div>

        <MovieListItems initialItems={items} listId={list.id} canEdit={canEdit} />
      </div>
    </main>
  );
}
