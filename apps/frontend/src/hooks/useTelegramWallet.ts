// hooks/useTelegramWallet.ts
import { useEffect, useState, useCallback } from "react";
import { useTelegram } from "./useTelegram";

interface WalletInfo {
  address: string;
  network: string;
}

export const useTelegramWallet = () => {
  const { telegram } = useTelegram();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (!telegram) {
      setError("Telegram WebApp is not available");
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Show a popup to request wallet connection
      telegram.showPopup({
        title: "Connect Wallet",
        message: "Please confirm to connect your wallet",
        buttons: [
          { type: "ok", text: "Connect" },
          { type: "cancel", text: "Cancel" },
        ],
      });

      // You can get the user's Telegram ID from initDataUnsafe
      const userId = telegram.initDataUnsafe.user?.id;
      const username = telegram.initDataUnsafe.user?.username;

      if (!userId) {
        throw new Error("User ID not available");
      }

      // Here you would typically make an API call to your backend
      // to associate the wallet with the Telegram user
      // For now, we'll create a mock wallet address
      const mockWalletInfo: WalletInfo = {
        address: `0x${Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")}`,
        network: "Ethereum",
      };

      setWalletInfo(mockWalletInfo);

      // Store in local storage as a temporary solution
      // In production, you should store this server-side
      localStorage.setItem(
        "telegramWalletInfo",
        JSON.stringify({
          userId,
          username,
          ...mockWalletInfo,
        })
      );

      return mockWalletInfo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      telegram.showPopup({
        title: "Error",
        message: "Failed to connect wallet. Please try again.",
        buttons: [{ type: "close", text: "Close" }],
      });
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [telegram]);

  const disconnectWallet = useCallback(async () => {
    if (!telegram) return;

    try {
      telegram.showPopup({
        title: "Disconnect Wallet",
        message: "Are you sure you want to disconnect your wallet?",
        buttons: [
          { type: "ok", text: "Disconnect" },
          { type: "cancel", text: "Cancel" },
        ],
      });

      localStorage.removeItem("telegramWalletInfo");
      setWalletInfo(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect wallet"
      );
    }
  }, [telegram]);

  // Initialize wallet info from storage on mount
  useEffect(() => {
    const storedWallet = localStorage.getItem("telegramWalletInfo");
    if (storedWallet) {
      try {
        const parsed = JSON.parse(storedWallet);
        // Only restore if it matches the current user
        if (parsed.userId === telegram?.initDataUnsafe?.user?.id) {
          setWalletInfo({
            address: parsed.address,
            network: parsed.network,
          });
        }
      } catch (e) {
        console.log(e, "-- error");
        localStorage.removeItem("telegramWalletInfo");
      }
    }
  }, [telegram]);

  return {
    walletInfo,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };
};
