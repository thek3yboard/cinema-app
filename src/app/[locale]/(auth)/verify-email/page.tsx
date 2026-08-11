"use client";

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import logo from '@/assets/cinema.png';
import { createClient } from '@/lib/supabase/client';
import { isEmailAuthEnabled, isSupabaseConfigured } from '@/lib/supabase/config';

export default function VerifyEmail() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEmailAuthEnabled) router.replace(`/${locale}/signin`);
  }, [locale, router]);

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEmailAuthEnabled) return;
    if (!isSupabaseConfigured) return toast.error(t('supabaseVerificationConfigurationError'));
    if (!/^\d{6,10}$/.test(code)) return toast.error(t('completeVerificationCode'));

    setIsSubmitting(true);
    const { error } = await createClient().auth.verifyOtp({ email, token: code, type: 'email' });
    setIsSubmitting(false);
    if (error) return toast.error(t('invalidVerificationCode'));

    toast.success(t('accountActivated'));
    router.replace(`/${locale}/movies`);
    router.refresh();
  };

  const resend = async () => {
    if (!isEmailAuthEnabled) return;
    if (!isSupabaseConfigured || !email) return;
    const { error } = await createClient().auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/${locale}/auth/callback` }
    });
    if (error) return toast.error(t('resendError'));
    toast.success(t('codeResent'));
  };

  if (!isEmailAuthEnabled) return null;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-aero-blue to-blueish-gray p-6">
      <Image className="mb-6" src={logo} alt="Cinema" width={220} priority />
      <section className="w-full max-w-md rounded-lg border-2 border-gray-500 bg-gradient-to-b from-nyanza to-pastel-yellow p-7 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-slate-800">{t('verifyTitle')}</h1>
        <p className="mt-2 text-center text-sm text-slate-700">{t('verifySubtitle')}</p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={verify}>
          <label className="font-semibold text-slate-700">{t('email')}
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-10 w-full rounded-md border-2 border-aero-blue bg-blueish-gray px-3 text-white" />
          </label>
          <label className="font-semibold text-slate-700">{t('code')}
            <input required inputMode="numeric" pattern="[0-9]{6,10}" maxLength={10} autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="mt-1 h-12 w-full rounded-md border-2 border-aero-blue bg-blueish-gray px-3 text-center text-2xl tracking-[0.35em] text-white" />
          </label>
          <button disabled={isSubmitting} className="h-11 rounded-md border-2 border-gray-500 bg-blueish-gray font-bold text-white disabled:opacity-60">
            {isSubmitting ? t('verifying') : t('activateAccount')}
          </button>
        </form>
        <button type="button" onClick={resend} className="mt-4 w-full text-sm font-bold text-lapis-lazuli underline">{t('resendActivationEmail')}</button>
        <p className="mt-5 text-center text-sm text-slate-700"><Link className="font-bold text-lapis-lazuli underline" href={`/${locale}/signin`}>{t('backToSignIn')}</Link></p>
      </section>
    </main>
  );
}
