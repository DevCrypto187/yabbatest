"use client";

import { useState } from "react";
import { WelcomeDialog } from "@/components/dialog/welcome-dialog";
import { Claim } from "./components/claim";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== "undefined") {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      return !hasSeenWelcome;
    }
    return true;
  });

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  return (
    <main
      className="min-h-screen w-full animate-fade-in bg-cover bg-center bg-no-repeat relative pb-16"
      style={{ backgroundImage: 'url("/images/bg-main.webp")' }}
    >
      {/* Welcome Dialog */}
      <WelcomeDialog isOpen={showWelcome} onClose={handleCloseWelcome} />

      <Claim />
    </main>
  );
}
