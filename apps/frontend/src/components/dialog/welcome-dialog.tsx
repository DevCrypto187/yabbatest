"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeDialog({ isOpen, onClose }: WelcomeDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 300); // Match the transition duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center transition-opacity backdrop-blur-sm duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-40" />
      <div
        className={`relative max-w-[90%] rounded-lg border-none bg-transparent text-center p-4 transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        } flex flex-col items-center`}
      >
        <div className="flex flex-col items-center space-y-4 mt-10">
          <Image
            src="/images/vector/symbol.webp"
            alt="Logo"
            width={120}
            height={120}
            unoptimized
            priority
            className="mb-4"
          />
          <p className="text-white font-lilita text-xl space-y-2">
            Welcome To YABBA-DABDA-DOO
            <br />
            You Can Earn Meats By Playing
            <br />
            YABBA-DABDA-DOO And May
            <br />
            Swap To The YDBDB Tokens.
            <br />
            By Inviting A Friend, You Can
            <br />
            Collect 1,000 Meats. If You
            <br />
            Complete The Daily Task And Tasks
            <br />
            In Task List, You Can Collect The
            <br />
            Meats. The More Meats, The More
            <br />
            You Can Earn YDBDB!
          </p>
        </div>
      </div>

      <div className="fixed bottom-10">
        <button onClick={onClose}>
          <Image
            alt="btn-back"
            src="/images/vector/btn-exit.png"
            width={266}
            height={38}
            unoptimized
          />
        </button>
      </div>
    </div>
  );
}
