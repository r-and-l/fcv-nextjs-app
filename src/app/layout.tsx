import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Мой Футбольный клуб - Создание команд",
  description: "Создавай и управляй своими футбольными командами легко и быстро",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
