import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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

    return children;
}
