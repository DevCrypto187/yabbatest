import { Metadata, Viewport } from "next";
import Providers from "./providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "YBDBD",
  description: "Created with Next.js",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <link
          rel="preload"
          href="/images/logo2xl-alt.webp"
          as="image"
          type="image/webp"
        />
        <link
          rel="preload"
          href="/images/vector/btn-play.webp"
          as="image"
          type="image/webp"
        />
        <link
          rel="preload"
          href="/images/vector/balance.png"
          as="image"
          type="image/png"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
