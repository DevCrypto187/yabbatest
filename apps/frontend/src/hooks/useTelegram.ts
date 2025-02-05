"use client";

import { useEffect, useState } from "react";

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    button_color: string;
    button_text_color: string;
  };
  initData: string;
  initDataUnsafe: {
    query_id: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date: string;
    hash: string;
  };
  openTelegramLink: (url: string) => void;
  copyTextToClipboard: (text: string) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons: Array<{
      type: "default" | "ok" | "close" | "cancel";
      text: string;
    }>;
  }) => void;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null);
  const [startParam, setStartParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = window.Telegram?.WebApp;
      if (tg?.initData) {
        setTelegram(tg);

        try {
          // Get start_param from initData
          const params = new URLSearchParams(tg.initData);
          const start = params.get("start_param");
          if (start) {
            setStartParam(start);
            // store this in localStorage
            // localStorage.setItem("invite_code", start);
          }
        } catch (error) {
          console.error("Error parsing initData:", error);
        }
      }
    }
  }, []);

  return { telegram, startParam };
};
