import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";

const headingFont = localFont({
  src: "./fonts/Tektur-VariableFont_wdth,wght.ttf",
  variable: "--font-custom-heading",
  display: "swap",
});

const sansFont = localFont({
  src: "./fonts/WDXLLubrifontTC-Regular.ttf",
  variable: "--font-custom-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Мой Футбольный клуб - Создание команд",
  description: "Создавай и управляй своими футбольными командами легко и быстро",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`h-full antialiased ${sansFont.variable} ${headingFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
