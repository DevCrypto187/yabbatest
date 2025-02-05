"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME;

export default function InvitePage() {
  const params = useParams();
  const inviteCode = params.code as string;

  useEffect(() => {
    if (typeof window !== "undefined" && inviteCode && BOT_USERNAME) {
      // Try direct Mini App link with the correct app name
      const miniAppUrl = `https://t.me/${BOT_USERNAME}/ybdbd1?startapp=${inviteCode}`;

      // Fallback to regular bot start if needed
      const fallbackUrl = `https://t.me/${BOT_USERNAME}?start=${inviteCode}`;

      try {
        window.location.href = miniAppUrl;
      } catch (error) {
        console.error("Failed to open Mini App directly:", error);
        window.location.href = fallbackUrl;
      }
    }
  }, [inviteCode]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-2xl text-white text-center p-4">
        Redirecting to Telegram...
      </p>
    </div>
  );
}
