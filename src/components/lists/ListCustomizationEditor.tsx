"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { Check, ImagePlus, Palette, Pencil, Pipette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cinemaFieldClassName, cinemaModalClassNames } from '@/components/ui/modalStyles';

export type CustomizableList = {
  id: string;
  name: string;
  description: string | null;
  background_color: string;
  cover_url: string | null;
};

type Props = {
  list: CustomizableList;
  userId: string;
  onUpdated: (changes: Omit<CustomizableList, 'id'>) => void;
};

const colorPresets = ['#334155', '#1e3a5f', '#164e63', '#14532d', '#581c87', '#881337', '#7c2d12', '#3f3f46'];

export default function ListCustomizationEditor({ list, userId, onUpdated }: Props) {
  const t = useTranslations('CustomLists');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? '');
  const [backgroundColor, setBackgroundColor] = useState(list.background_color);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!coverFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(coverFile);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [coverFile]);

  const resetForm = () => {
    setName(list.name);
    setDescription(list.description ?? '');
    setBackgroundColor(list.background_color);
    setCoverFile(null);
    setRemoveCover(false);
  };

  const closeEditor = () => {
    resetForm();
    onClose();
  };

  const selectCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      return toast.error(t('coverValidation'));
    }

    setCoverFile(file);
    setRemoveCover(false);
  };

  const saveCustomization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setIsSaving(true);
    const supabase = createClient();
    let nextCoverUrl = removeCover ? null : list.cover_url;

    if (coverFile) {
      const extension = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${userId}/${list.id}/cover.${extension}`;
      const { error: uploadError } = await supabase.storage.from('list-covers').upload(path, coverFile, {
        upsert: true,
        cacheControl: '3600',
        contentType: coverFile.type
      });

      if (uploadError) {
        setIsSaving(false);
        return toast.error(t('coverUploadError'));
      }

      const { data } = supabase.storage.from('list-covers').getPublicUrl(path);
      nextCoverUrl = `${data.publicUrl}?v=${Date.now()}`;
    }

    const changes = {
      name: normalizedName,
      description: description.trim() || null,
      background_color: backgroundColor,
      cover_url: nextCoverUrl
    };
    const { error } = await supabase.from('custom_lists')
      .update(changes)
      .eq('id', list.id)
      .eq('user_id', userId);
    setIsSaving(false);

    if (error) return toast.error(t('customizationError'));
    onUpdated(changes);
    setCoverFile(null);
    setRemoveCover(false);
    toast.success(t('customizationSaved'));
    onClose();
  };

  const shownCover = removeCover ? null : previewUrl ?? list.cover_url;

  return (
    <>
      <Button onPress={() => { resetForm(); onOpen(); }} startContent={<Pencil className="h-4 w-4" />} className="bg-white/15 font-semibold text-white backdrop-blur hover:bg-white/25">
        {t('customize')}
      </Button>
      <Modal isOpen={isOpen} onClose={closeEditor} scrollBehavior="inside" size="2xl" classNames={cinemaModalClassNames}>
        <ModalContent>
          <form onSubmit={saveCustomization} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ModalHeader className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aero-blue/20 text-nyanza"><Pencil className="h-5 w-5" /></span>
              <span>
                <span className="block text-xl font-bold text-white">{t('customizeTitle')}</span>
                <span className="mt-0.5 block text-sm font-normal text-slate-400">{t('customizeSubtitle')}</span>
              </span>
            </ModalHeader>
            <ModalBody className="gap-4 overscroll-contain">
              <label className="text-sm font-semibold text-slate-200">
                {t('name')}
                <input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className={`h-11 ${cinemaFieldClassName}`} />
              </label>
              <label className="text-sm font-semibold text-slate-200">
                {t('descriptionLabel')}
                <textarea maxLength={280} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t('descriptionPlaceholder')} className={`resize-none py-3 ${cinemaFieldClassName}`} />
                <span className="mt-1 block text-right text-xs font-normal text-slate-400">{description.length}/280</span>
              </label>
              <fieldset className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <legend className="px-1 text-sm font-semibold text-slate-200"><span className="flex items-center gap-2"><Palette className="h-4 w-4 text-nyanza" />{t('backgroundColor')}</span></legend>
                <p className="mt-1 text-xs text-slate-400">{t('backgroundColorHelp')}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={t('selectColor', { color })}
                      aria-pressed={backgroundColor === color}
                      onClick={() => setBackgroundColor(color)}
                      style={{ backgroundColor: color }}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition hover:scale-105 ${backgroundColor === color ? 'border-white ring-2 ring-nyanza/60 ring-offset-2 ring-offset-[#17233a]' : 'border-white/50'}`}
                    >
                      {backgroundColor === color && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  ))}
                  <label className="relative flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                    <span style={{ backgroundColor }} className="h-4 w-4 rounded-full border border-white/60" />
                    <Pipette className="h-4 w-4" />
                    {t('customColor')}
                    <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} aria-label={t('customColor')} className="sr-only" />
                  </label>
                </div>
              </fieldset>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-slate-200">{t('coverPhoto')}</p>
                <p className="mt-1 text-xs text-slate-400">{t('coverHelp')}</p>
                {shownCover && <div role="img" aria-label={t('coverPreview', { name })} style={{ backgroundImage: `url(${JSON.stringify(shownCover)})` }} className="mt-3 aspect-[16/7] w-full rounded-lg bg-slate-900 bg-cover bg-center shadow-inner" />}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button as="label" startContent={<ImagePlus className="h-4 w-4" />} className="cursor-pointer border border-white/10 bg-white/10 font-semibold text-white hover:bg-white/15">
                    {t('chooseCover')}
                    <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectCover} />
                  </Button>
                  {shownCover && (
                    <Button type="button" color="danger" variant="bordered" onPress={() => { setCoverFile(null); setRemoveCover(true); }}>
                      {t('removeCover')}
                    </Button>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="light" onPress={closeEditor} className="font-semibold text-slate-300">{t('cancel')}</Button>
              <Button type="submit" isLoading={isSaving} className="bg-aero-blue font-bold text-white shadow-lg shadow-slate-950/20">{t('saveChanges')}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
