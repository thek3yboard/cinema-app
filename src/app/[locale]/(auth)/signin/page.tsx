"use client";

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import logo from '@/assets/cinema.png';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function SignIn() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || `/${locale}/movies`;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInWithPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSupabaseConfigured) return toast.error(t('supabaseSignInConfigurationError'));

    setIsSubmitting(true);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (error) return toast.error(t('signInError'));
    router.replace(next.startsWith(`/${locale}/`) ? next : `/${locale}/movies`);
    router.refresh();
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) return toast.error(t('supabaseSignInConfigurationError'));
    const callback = new URL(`/${locale}/auth/callback`, window.location.origin);
    callback.searchParams.set('next', next);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callback.toString() }
    });
    if (error) toast.error(t('googleSignInError'));
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-aero-blue to-blueish-gray p-6">
      <Image className="mb-6" src={logo} alt="Cinema" width={220} priority />
      <section className="w-full max-w-md rounded-lg border-2 border-gray-500 bg-gradient-to-b from-nyanza to-pastel-yellow p-7 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-slate-800">{t('signInTitle')}</h1>
        <p className="mt-2 text-center text-sm text-slate-700">{t('signInSubtitle')}</p>
        <button type="button" onClick={signInWithGoogle} className="mt-6 flex h-11 w-full items-center justify-center rounded-md border border-slate-400 bg-white font-semibold text-slate-800 hover:bg-slate-100">
          {t('continueWithGoogle')}
        </button>
        <div className="my-5 flex items-center gap-3 text-sm text-slate-600"><span className="h-px grow bg-slate-400" />{t('or')}<span className="h-px grow bg-slate-400" /></div>
        <form className="flex flex-col gap-4" onSubmit={signInWithPassword}>
          <label className="font-semibold text-slate-700">{t('email')}
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-10 w-full rounded-md border-2 border-aero-blue bg-blueish-gray px-3 text-white" />
          </label>
          <label className="font-semibold text-slate-700">{t('password')}
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded-md border-2 border-aero-blue bg-blueish-gray px-3 text-white" />
          </label>
          <button disabled={isSubmitting} className="h-11 rounded-md border-2 border-gray-500 bg-blueish-gray font-bold text-white disabled:opacity-60">
            {isSubmitting ? t('signingIn') : t('signIn')}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-700">{t('noAccount')} <Link className="font-bold text-lapis-lazuli underline" href={`/${locale}/signup`}>{t('createAccount')}</Link></p>
      </section>
    </main>
  );
}
