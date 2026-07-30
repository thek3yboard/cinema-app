import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { LocaleDocument } from './providers';

export default async function RootLocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
            <LocaleDocument locale={locale} />
            {children}
        </NextIntlClientProvider>
    );
}
