"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { ListPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

type CustomList = {
  id: string;
  name: string;
  is_public: boolean;
};

type Props = {
  userId: string;
  movieId: number;
  title: string;
  posterPath: string | null;
};

export default function CustomListPicker({ userId, movieId, title, posterPath }: Props) {
  const t = useTranslations('CustomLists');
  const locale = useLocale();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lists, setLists] = useState<CustomList[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [pendingListId, setPendingListId] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('custom_lists')
      .select('id, name, is_public')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      setIsLoading(false);
      toast.error(t('loadError'));
      return;
    }

    const ownLists = (data ?? []) as CustomList[];
    setLists(ownLists);
    if (!ownLists.length) {
      setSelectedListIds(new Set());
      setIsLoading(false);
      return;
    }

    const { data: memberships, error: membershipsError } = await supabase.from('custom_list_items')
      .select('list_id')
      .eq('media_id', movieId)
      .in('list_id', ownLists.map((list) => list.id));

    setIsLoading(false);
    if (membershipsError) return toast.error(t('loadMembershipsError'));
    setSelectedListIds(new Set((memberships ?? []).map((item: { list_id: string }) => item.list_id)));
  }, [movieId, t, userId]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const toggleMembership = async (list: CustomList) => {
    const isSelected = selectedListIds.has(list.id);
    setPendingListId(list.id);
    const supabase = createClient();
    const { error } = isSelected
      ? await supabase.from('custom_list_items').delete().eq('list_id', list.id).eq('media_id', movieId)
      : await supabase.from('custom_list_items').upsert({
          list_id: list.id,
          media_id: movieId,
          title,
          poster_path: posterPath
        }, { onConflict: 'list_id,media_id' });
    setPendingListId(null);

    if (error) return toast.error(t('membershipError'));
    setSelectedListIds((current) => {
      const next = new Set(current);
      if (isSelected) next.delete(list.id);
      else next.add(list.id);
      return next;
    });
    toast.success(isSelected ? t('removedFromList', { name: list.name }) : t('addedToList', { name: list.name }));
  };

  return (
    <>
      <div className="relative group max-md:mr-2">
        <button type="button" onClick={onOpen} className="rounded-full bg-gray-200 p-2 text-gray-700" aria-label={t('addToCustomList')}>
          <ListPlus className="h-5 w-5" />
        </button>
        <span className="absolute bottom-[115%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {t('addToCustomList')}
        </span>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{t('chooseLists')}</ModalHeader>
          <ModalBody>
            {isLoading ? (
              <p>{t('loading')}</p>
            ) : lists.length ? (
              <ul className="space-y-2">
                {lists.map((list) => {
                  const isSelected = selectedListIds.has(list.id);
                  return (
                    <li key={list.id}>
                      <Button
                        fullWidth
                        isLoading={pendingListId === list.id}
                        onPress={() => toggleMembership(list)}
                        className={`justify-between ${isSelected ? 'bg-lapis-lazuli text-white' : 'bg-slate-200 text-slate-900'}`}
                      >
                        <span className="truncate">{list.name}</span>
                        <span className="text-xs">{isSelected ? t('included') : t('notIncluded')}</span>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-3">
                <p>{t('noListsForPicker')}</p>
                <Link className="font-semibold text-lapis-lazuli hover:underline" href={`/${locale}/profile#custom-lists`} onClick={onClose}>
                  {t('createFirstList')}
                </Link>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose}>{t('close')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
