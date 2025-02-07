import "@/app/[locale]/globals.css";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    );
}
