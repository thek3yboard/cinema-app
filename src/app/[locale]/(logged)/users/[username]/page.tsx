"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@nextui-org/react';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import ListCoverMosaic from '@/components/lists/ListCoverMosaic';
import ProfileHeartBadge from '@/components/auth/ProfileHeartBadge';

type PublicProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type PublicList = {
  id: string;
  name: string;
  custom_list_items: { poster_path: string | null }[];
};

type HeartBadge = {
  tooltip_profile: { username: string } | null;
};

export default function PublicProfilePage({ params }: { params: { username: string; locale: string } }) {
  const t = useTranslations('PublicProfile');
  const tLists = useTranslations('CustomLists');
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [heartBadge, setHeartBadge] = useState<HeartBadge | null>(null);
  const [lists, setLists] = useState<PublicList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const supabase = createClient();
      const { data: profileData, error: profileError } = await supabase.from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', decodeURIComponent(params.username))
        .maybeSingle();

      if (!active) return;
      if (profileError || !profileData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const { data: listData } = await supabase.from('custom_lists')
        .select('id, name, custom_list_items(poster_path)')
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .order('updated_at', { ascending: false });

      const { data: badgeData } = await supabase.from('profile_heart_badges')
        .select('tooltip_profile:profiles!profile_heart_badges_tooltip_profile_id_fkey(username)')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (!active) return;
      setProfile(profileData as PublicProfile);
      setLists((listData ?? []) as PublicList[]);
      setHeartBadge(badgeData as HeartBadge | null);
      setIsLoading(false);
    };

    loadProfile();
    return () => { active = false; };
  }, [params.username]);

  if (isLoading) return <div className="p-8 text-center text-white">{t('loading')}</div>;
  if (notFound || !profile) return <div className="p-8 text-center text-white">{t('notFound')}</div>;

  return (
    <main className="mx-auto w-full max-w-4xl p-6 md:p-10">
      <section className="rounded-xl bg-slate-800/80 p-6 text-white">
        <div className="flex items-center gap-5">
          <Avatar className="h-24 w-24 text-large" name={profile.username} src={profile.avatar_url ?? undefined} />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-3xl font-bold">@{profile.username}</h1>
              {heartBadge?.tooltip_profile?.username && <ProfileHeartBadge partnerUsername={heartBadge.tooltip_profile.username} />}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-slate-800/80 p-6 text-white">
        <h2 className="text-2xl font-bold">{t('publicLists')}</h2>
        {lists.length ? (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {lists.map((list) => (
              <li key={list.id}>
                <Link href={`/${params.locale}/lists/${list.id}`} className="flex min-w-0 gap-4 rounded-lg bg-slate-700 p-3 transition hover:-translate-y-0.5 hover:bg-slate-600">
                  <ListCoverMosaic
                    posterPaths={list.custom_list_items.map((item) => item.poster_path)}
                    label={tLists('coverPreview', { name: list.name })}
                    className="h-28 w-28"
                  />
                  <span className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="flex min-w-0 items-center gap-2 text-lg font-bold"><Eye className="h-4 w-4 shrink-0" /><span className="truncate">{list.name}</span></span>
                    <span className="mt-2 block text-sm text-slate-300">{tLists('movieCount', { count: list.custom_list_items.length })}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-slate-300">{t('noPublicLists')}</p>
        )}
      </section>
    </main>
  );
}
