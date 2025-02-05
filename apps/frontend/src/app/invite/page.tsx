"use client";
import { useTelegram } from "@/hooks/useTelegram";
import { useState } from "react";
import { AlertDialog } from "@/components/dialog/alert-dialog";
import { useScreenHeight } from "@/hooks/useScreenHeight";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME;

interface ListItem {
  title: string;
  subtitle?: string;
  showMeatIcon?: boolean;
}

const HOW_IT_WORKS_LIST: ListItem[] = [
  {
    title: "Share your invitation link",
    subtitle: "Get a play pass for each friends",
  },
  {
    title: "Your friends join YBDBD",
    subtitle: "Get a play pass for each friends",
  },
  {
    title: "1 friends / 2000",
    showMeatIcon: true,
  },
];

export default function InvitePage() {
  const screenHeight = useScreenHeight();
  const { telegram } = useTelegram();
  const { inviteCode } = useAuth(); // Get inviteCode from useAuth
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleInviteFriend = async () => {
    if (!telegram || !inviteCode) return;

    const inviteLink = `https://t.me/${BOT_USERNAME}/ybdbd1?startapp=${inviteCode}`;
    const text = `🎮 Join me in YBDBD Game!\n\n🎁 Get rewards when you join using my invite link\n\nPlay now and earn crypto rewards together! 🚀`;

    window.Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`
    );

    setAlertMessage("Invitation sent!");
    setShowAlert(true);
  };

  const handleCopyInvitation = async () => {
    const inviteLink = `https://t.me/${BOT_USERNAME}/ybdbd1?startapp=${inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setAlertMessage("Invitation link copied!");
      setShowAlert(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const vectorClass = `mx-auto -mt-4 ${screenHeight > 644 ? "" : "w-[40%]"}`;

  return (
    <main
      className="min-h-screen w-full animate-fade-in bg-cover bg-center bg-no-repeat relative pb-24"
      style={{ backgroundImage: 'url("/images/bg-main.webp")' }}
    >
      <div className="relative z-10 p-6">
        <h1
          className={`${screenHeight > 644 ? "text-[46px]" : "text-[26px]"} -rotate-1 font-lilita text-center mt-2 text-gradient-yb font-bold`}
        >
          Invite Friends
        </h1>
        <p className="text-sm text-center text-white font-lilita text-shadow-yb">
          Invite friends, complete and earn more
        </p>

        <Image
          src="/images/vector/invite/circle.png"
          alt="Balance background"
          width={180}
          height={180}
          priority
          unoptimized
          className={vectorClass}
        />

        <p className="text-[25px] -mt-2 text-center text-white font-lilita text-shadow-yb">
          How it works
        </p>

        <div className="mt-3 space-y-6 max-w-md mx-auto">
          {HOW_IT_WORKS_LIST.map((item, index) => (
            <div
              key={index}
              className="flex justify-center items-center gap-4 mr-7"
            >
              <Image
                src="/images/vector/invite/check.png"
                alt="Check icon"
                width={40}
                height={40}
                priority
                unoptimized
              />
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-[15px] text-white font-lilita text-shadow-yb">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-[12px] text-white font-lilita text-shadow-yb">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                {item.showMeatIcon && (
                  <Image
                    src="/images/vector/meat-red.png"
                    alt="Meat icon"
                    width={32}
                    height={32}
                    priority
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-row px-5 gap-4 max-w-md mx-auto justify-center">
          <button onClick={handleInviteFriend} className="">
            <Image
              src="/images/vector/invite/btn-invite.png"
              alt="btn invite"
              width={48}
              height={48}
              priority
              unoptimized
              className="w-full"
            />
          </button>

          <button onClick={handleCopyInvitation}>
            <Image
              src="/images/vector/invite/btn-copy.png"
              alt="btn copy"
              width={48}
              height={48}
              priority
              unoptimized
              className="w-full"
            />
          </button>
        </div>
      </div>

      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onConfirm={() => setShowAlert(false)}
        message={alertMessage}
        showConfirm={false}
      />
    </main>
  );
}
