"use client";

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import logo from '@/assets/cinema.png';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;

export default function SignUp() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSupabaseConfigured) return toast.error(t('supabaseSignUpConfigurationError'));
    if (!usernamePattern.test(username)) return toast.error(t('usernameFormatError'));
    if (password.length < 8) return toast.error(t('passwordLengthError'));

    setIsSubmitting(true);
    const normalizedUsername = username.toLowerCase();
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { username: normalizedUsername },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`
      }
    });
    setIsSubmitting(false);

    if (error) {
      return toast.error(error.message.includes('duplicate') ? t('usernameTaken') : t('signUpError'));
    }

    router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-aero-blue to-blueish-gray p-6">
      <Image className="mb-6" src={logo} alt="Cinema" width={220} priority />
      <section className="w-full max-w-md rounded-lg border-2 border-gray-500 bg-gradient-to-b from-nyanza to-pastel-yellow p-7 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-slate-800">{t('createAccountTitle')}</h1>
        <p className="mt-2 text-center text-sm text-slate-700">{t('createAccountSubtitle')}</p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={signUp}>
          <label className="font-semibold text-slate-700">{t('username')}
            <input required minLength={3} maxLength={30} autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 h-10 w-full rounded-md border-2 border-aero-blue bg-blueish-gray px-3 text-white" />
          </label>
          <label className="font-semibold text-slate-700">{t('email')}
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-10 w-full rounded-md border-2 border-aero-blue bg-blueish-gray px-3 text-white" />
          </label>
          <label className="font-semibold text-slate-700">{t('password')}
            <input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded-md border-2 border-aero-blue bg-blueish-gray px-3 text-white" />
          </label>
          <button disabled={isSubmitting} className="h-11 rounded-md border-2 border-gray-500 bg-blueish-gray font-bold text-white disabled:opacity-60">
            {isSubmitting ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-700">{t('alreadyHaveAccount')} <Link className="font-bold text-lapis-lazuli underline" href={`/${locale}/signin`}>{t('signIn')}</Link></p>
      </section>
    </main>
  );
}
