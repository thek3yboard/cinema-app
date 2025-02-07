import type { Metadata } from "next";
import { Providers } from "./providers";
import { Montserrat } from "next/font/google";
import { PWARegister } from "./lib/pwa-register";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    manifest: '/manifest.json',
};

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
    
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className={`${montserrat.className} antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <PWARegister />
                        <main>{children}</main>
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
