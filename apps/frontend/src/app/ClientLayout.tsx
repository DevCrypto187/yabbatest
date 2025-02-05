"use client";

import "./globals.css";
import { Lilita_One } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useTelegram } from "@/hooks/useTelegram";
import { usePathname } from "next/navigation";

const TELEGRAM_ONLY = true;

const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lilita-one",
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { telegram } = useTelegram();
  const hasAccess = !TELEGRAM_ONLY || telegram;
  const pathname = usePathname();
  const isGamePage = pathname === "/games/stone-age-defenders";

  return (
    <div
      className={`${lilitaOne.variable} bg-black bg-[url('/images/bg-main.webp')] bg-cover bg-center bg-no-repeat min-h-screen`}
    >
      {hasAccess ? (
        <>
          {children}
          {!isGamePage && <BottomNav />}
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <p className="text-2xl text-white text-center p-4">
            This app can only be accessed through Telegram
          </p>
        </div>
      )}
    </div>
  );
}
