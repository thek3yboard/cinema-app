"use client"

import { useEffect } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from '@/components/auth/AuthProvider';

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <AuthProvider>{children}</AuthProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
}

export function LocaleDocument({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
