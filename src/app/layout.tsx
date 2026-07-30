import "@/app/[locale]/globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { Providers } from "./[locale]/providers";
import { PWARegister } from "./[locale]/lib/pwa-register";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cinema Center",
    manifest: "/manifest.json",
    icons: {
        icon: [
            {
                url: "/favicon.ico?v=3",
                type: "image/x-icon"
            }
        ],
        shortcut: "/favicon.ico?v=3"
    }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
    const [locale, messages] = await Promise.all([
        getLocale(),
        getMessages()
    ]);

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${montserrat.className} antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <PWARegister />
                        <main>{children}</main>
                        <Toaster richColors position="top-right" />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
