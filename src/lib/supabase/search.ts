import { createClient } from './client';
import { GlobalSearchResult } from '@/types/search';

type ProfileSearchRow = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export async function searchProfiles(query: string, limit = 6): Promise<GlobalSearchResult[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];

  const pattern = `%${normalizedQuery}%`;
  const { data, error } = await createClient().from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', pattern)
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as ProfileSearchRow[])
    .sort((first, second) => {
      const firstExact = first.username.toLowerCase() === normalizedQuery.toLowerCase();
      const secondExact = second.username.toLowerCase() === normalizedQuery.toLowerCase();
      return Number(secondExact) - Number(firstExact) || first.username.localeCompare(second.username);
    })
    .slice(0, limit)
    .map((profile) => ({
      ...profile,
      media_type: 'user' as const
    }));
}
