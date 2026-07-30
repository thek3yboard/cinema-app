"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Avatar, Button, Tab, Tabs } from '@nextui-org/react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { fetchPage } from '@/app/[locale]/utils';

type UserMedia = {
  media_type: 'movie' | 'tv';
  media_id: number;
  in_watchlist: boolean;
  is_watched: boolean;
  is_favorite: boolean;
  rating: number;
  title: string | null;
  poster_path: string | null;
};

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;

export default function ProfilePage() {
  const locale = useLocale();
  const t = useTranslations('Profile');
  const router = useRouter();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [media, setMedia] = useState<UserMedia[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace(`/${locale}/signin?next=/${locale}/profile`);
  }, [isLoading, locale, router, user]);

  useEffect(() => {
    setUsername(profile?.username ?? '');
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    createClient().from('user_media')
      .select('media_type, media_id, in_watchlist, is_watched, is_favorite, rating, title, poster_path')
      .order('updated_at', { ascending: false })
      .then(({ data, error }: { data: UserMedia[] | null; error: { message: string } | null }) => {
        if (error) toast.error(t('loadListsError'));
        else {
          const savedMedia = data ?? [];
          setMedia(savedMedia);

          const incompleteMedia = savedMedia.filter((item) => !item.title || !item.poster_path);
          if (!incompleteMedia.length) return;

          Promise.all(incompleteMedia.map(async (item) => {
            const endpoint = item.media_type === 'movie' ? 'movie' : 'tv';
            const details = await fetchPage(`https://api.themoviedb.org/3/${endpoint}/${item.media_id}?language=${locale}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
            const title = details?.title ?? details?.name ?? null;
            const posterPath = details?.poster_path ?? null;

            if (title || posterPath) {
              await createClient().from('user_media').update({ title, poster_path: posterPath })
                .eq('user_id', user.id).eq('media_type', item.media_type).eq('media_id', item.media_id);
            }

            return { ...item, title, poster_path: posterPath };
          })).then((hydratedMedia) => {
            const hydratedByKey = new Map(hydratedMedia.map((item) => [`${item.media_type}:${item.media_id}`, item]));
            setMedia((currentMedia) => currentMedia.map((item) => hydratedByKey.get(`${item.media_type}:${item.media_id}`) ?? item));
          }).catch(() => toast.error(t('hydrateListsError')));
        }
      });
  }, [locale, t, user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.toLowerCase();
    if (!user || !usernamePattern.test(normalizedUsername)) {
      return toast.error(t('usernameFormatError'));
    }

    setIsSaving(true);
    const { error } = await createClient().from('profiles').update({
      username: normalizedUsername,
      display_name: normalizedUsername
    }).eq('id', user.id);
    setIsSaving(false);

    if (error) return toast.error(error.code === '23505' ? t('usernameTaken') : t('saveError'));
    await refreshProfile();
    toast.success(t('updated'));
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      event.target.value = '';
      return toast.error(t('avatarValidation'));
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${extension}`;
    setIsSaving(true);
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type
    });
    if (uploadError) {
      setIsSaving(false);
      return toast.error(t('avatarUploadError'));
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
    const { error: profileError } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
    setIsSaving(false);
    event.target.value = '';

    if (profileError) return toast.error(t('avatarProfileError'));
    await refreshProfile();
    toast.success(t('avatarUpdated'));
  };

  if (isLoading || !user) return <div className="p-8 text-center text-white">{t('loading')}</div>;

  const tabs = [
    { key: 'favorites', label: t('favorites'), filter: (item: UserMedia) => item.is_favorite },
    { key: 'watchlist', label: t('watchlist'), filter: (item: UserMedia) => item.in_watchlist },
    { key: 'watched', label: t('watched'), filter: (item: UserMedia) => item.is_watched }
  ];

  return (
    <div className="mx-auto w-full max-w-4xl p-6 md:p-10">
      <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
      <div className="mt-6 grid gap-6 rounded-xl bg-slate-800/80 p-6 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <Avatar name={profile?.username} src={profile?.avatar_url ?? undefined} className="h-32 w-32 text-large" />
          <label className="cursor-pointer rounded-md bg-lapis-lazuli px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            {t('changePhoto')}
            <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} disabled={isSaving} />
          </label>
          <p className="text-center text-xs text-slate-300">{t('avatarHelp')}</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={saveProfile}>
          <label className="font-semibold text-white">{t('username')}
            <input required minLength={3} maxLength={30} autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-500 bg-slate-700 px-3 text-white" />
          </label>
          <p className="text-sm text-slate-300">{user.email}</p>
          <Button type="submit" isLoading={isSaving} className="w-fit bg-lapis-lazuli font-bold text-white">{t('save')}</Button>
        </form>
      </div>

      <section id="lists" className="mt-10 min-w-0 overflow-hidden rounded-xl bg-slate-800/80 p-6">
        <h2 className="text-2xl font-bold text-white">{t('listsTitle')}</h2>
        <p className="mt-1 text-sm text-slate-300">{t('listsDescription')}</p>
        <Tabs
          aria-label={t('listsAria')}
          className="mt-4 w-full min-w-0"
          classNames={{
            base: 'w-full min-w-0',
            tabList: 'max-w-full overflow-x-auto',
            panel: 'w-full min-w-0 px-0'
          }}
          variant="underlined"
        >
          {tabs.map((tab) => {
            const items = media.filter(tab.filter);
            return <Tab key={tab.key} title={`${tab.label} (${items.length})`}>
              {items.length ? <ul className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((item) => <li className="min-w-0" key={`${item.media_type}-${item.media_id}`}>
                  <button type="button" onClick={() => router.push(`/${locale}/${item.media_type === 'movie' ? 'movies' : 'shows'}/${item.media_id}`)} className="flex w-full min-w-0 max-w-full overflow-hidden gap-3 rounded-md bg-slate-700 p-3 text-left text-white transition hover:bg-slate-600">
                    <Image
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : '/fallback-portrait.svg'}
                      alt={item.title ?? t('posterAlt')}
                      width={64}
                      height={96}
                      className="h-24 w-16 shrink-0 rounded object-cover"
                    />
                    <span className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
                      <span className="block max-w-full truncate text-base font-bold">{item.title ?? t('loadingTitle')}</span>
                      <span className="mt-1 text-sm text-slate-300">{item.media_type === 'movie' ? t('movie') : t('show')}{item.rating > 0 ? ` · ${item.rating}/10` : ''}</span>
                    </span>
                  </button>
                </li>)}
              </ul> : <p className="mt-4 text-slate-300">{t('emptyList')}</p>}
            </Tab>;
          })}
        </Tabs>
      </section>
    </div>
  );
}
