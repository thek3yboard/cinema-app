import type { Metadata } from "next";
import { Providers } from "./providers";
import { Montserrat } from "next/font/google";
import { PWARegister } from "@/app/lib/pwa-register";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${montserrat.className} antialiased`}>
            <Providers>
                <PWARegister />
                <main>{children}</main>
            </Providers>
        </body>
        </html>
    );
}
